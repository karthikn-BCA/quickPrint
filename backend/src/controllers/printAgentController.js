const fs = require('fs');
const Order = require('../models/Order');
const Document = require('../models/Document');
const ShopSettings = require('../models/ShopSettings');
const PrintingJob = require('../models/PrintingJob');
const { notifyOrderUpdated, notifyAdmin } = require('../services/socketService');

/**
 * Returns pending jobs in the queue for the Print Agent
 */
async function getPendingPrintJobs(req, res) {
  try {
    // Only return orders that are strictly PAID and QUEUED
    const orders = await Order.find({
      paymentStatus: 'PAID',
      printingStatus: { $in: ['QUEUED'] },
    })
      .sort({ createdAt: 1 })
      .populate('items.document');

    const formattedJobs = orders.map((order) => ({
      orderId: order.orderId,
      customerName: order.customerName,
      items: order.items.map((item) => ({
        documentId: item.document._id,
        originalName: item.originalName,
        fileType: item.fileType,
        printType: item.printType,
        printSides: item.printSides,
        copies: item.copies,
        pageSelection: item.pageSelection,
        customPages: item.customPages,
        selectedPagesList: item.selectedPagesList,
        paperSize: item.paperSize,
        orientation: item.orientation,
        downloadUrl: `/api/print-agent/download/${item.document._id}`,
      })),
      totalSheets: order.totalPhysicalSheets,
      paidAt: order.paidAt,
    }));

    return res.status(200).json({
      success: true,
      jobs: formattedJobs,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Secure document download endpoint for the Windows Print Agent
 */
async function downloadDocumentForPrinting(req, res) {
  try {
    const { documentId } = req.params;
    const doc = await Document.findById(documentId);

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    if (!fs.existsSync(doc.filePath)) {
      return res.status(404).json({ success: false, error: 'File binary not found on disk.' });
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.originalName)}"`);
    res.setHeader('X-Document-Pages', doc.pageCount.toString());

    const fileStream = fs.createReadStream(doc.filePath);
    fileStream.pipe(res);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Updates print job status from Print Agent (e.g. PRINTING, PRINTED, FAILED)
 */
async function updatePrintJobStatus(req, res) {
  try {
    const { orderId, status, agentId, failureReason } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing orderId or status in update request.',
      });
    }

    const order = await Order.findOne({ orderId: orderId.toUpperCase() });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    // Duplicate-print protection:
    // If order was already PRINTED, do not re-process unless explicitly retried
    if (order.printingStatus === 'PRINTED' && status !== 'PRINTED') {
      return res.status(400).json({
        success: false,
        error: 'Duplicate print protection: Order is already marked as PRINTED.',
      });
    }

    if (status === 'PRINTING') {
      order.printingStatus = 'PRINTING';
      order.printStartedAt = new Date();
      order.printedByAgent = agentId || 'windows-agent-local';
    } else if (status === 'PRINTED') {
      order.printingStatus = 'PRINTED';
      order.collectionStatus = 'READY';
      order.printedAt = new Date();
      order.failureReason = null;
    } else if (status === 'FAILED') {
      order.printingStatus = 'FAILED';
      order.failureReason = failureReason || 'Printer error during job execution.';
    }

    await order.save();

    // Update or create PrintingJob record
    await PrintingJob.findOneAndUpdate(
      { orderId: order.orderId },
      {
        status: status === 'PRINTED' ? 'COMPLETED' : status,
        lastError: failureReason || null,
        completedAt: status === 'PRINTED' ? new Date() : undefined,
      },
      { upsert: true }
    );

    // Notify customer in real time
    notifyOrderUpdated(order.orderId, order);

    // Notify admin dashboard in real time
    notifyAdmin('job_status_change', {
      orderId: order.orderId,
      status: order.printingStatus,
      collectionStatus: order.collectionStatus,
      failureReason: order.failureReason,
    });

    return res.status(200).json({
      success: true,
      message: `Order ${order.orderId} status updated to ${status}.`,
      order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Agent Heartbeat endpoint to report printer health to admin dashboard
 */
async function reportHeartbeat(req, res) {
  try {
    const { printerName, simulationMode = true, status = 'online' } = req.body;

    const settings = await ShopSettings.findOne();
    if (settings) {
      settings.agentStatus = {
        online: status === 'online',
        lastHeartbeat: new Date(),
        printerName: printerName || 'Simulated Shop Printer',
        simulationMode: Boolean(simulationMode),
      };
      await settings.save();
    }

    notifyAdmin('printer_status_change', {
      online: status === 'online',
      lastHeartbeat: new Date(),
      printerName: printerName || 'Campus Xerox Printer',
      simulationMode: Boolean(simulationMode),
    });

    return res.status(200).json({
      success: true,
      message: 'Heartbeat acknowledged.',
      serverTime: new Date(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getPendingPrintJobs,
  downloadDocumentForPrinting,
  updatePrintJobStatus,
  reportHeartbeat,
};
