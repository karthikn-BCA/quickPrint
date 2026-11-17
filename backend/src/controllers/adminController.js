const Order = require('../models/Order');
const ShopSettings = require('../models/ShopSettings');
const PrintingJob = require('../models/PrintingJob');
const Payment = require('../models/Payment');
const { notifyOrderUpdated, notifyAdmin, dispatchJobToAgents } = require('../services/socketService');

/**
 * Dashboard Overview Statistics
 */
async function getDashboardStats(req, res) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      printingOrders,
      readyOrders,
      completedOrders,
      failedOrders,
      revenueAgg,
      todayRevenueAgg,
      settings,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments({ printingStatus: { $in: ['WAITING_FOR_PAYMENT', 'PAID', 'QUEUED'] } }),
      Order.countDocuments({ printingStatus: 'PRINTING' }),
      Order.countDocuments({ collectionStatus: 'READY' }),
      Order.countDocuments({ collectionStatus: 'COLLECTED' }),
      Order.countDocuments({ printingStatus: 'FAILED' }),
      Order.aggregate([
        { $match: { paymentStatus: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'PAID', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
      ShopSettings.findOne().lean(),
    ]);

    const totalRevenue = revenueAgg.length > 0 ? Number(revenueAgg[0].total.toFixed(2)) : 0;
    const todayRevenue = todayRevenueAgg.length > 0 ? Number(todayRevenueAgg[0].total.toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        pendingOrders,
        printingOrders,
        readyOrders,
        completedOrders,
        failedOrders,
        totalRevenue,
        todayRevenue,
        printerStatus: settings?.agentStatus || {
          online: false,
          lastHeartbeat: null,
          printerName: 'Campus Printer',
          simulationMode: true,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * List orders with search, filter, and pagination
 */
async function getAllOrders(req, res) {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};

    if (status && status !== 'ALL') {
      if (status === 'READY') {
        filter.collectionStatus = 'READY';
      } else if (status === 'COLLECTED') {
        filter.collectionStatus = 'COLLECTED';
      } else {
        filter.printingStatus = status;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { orderId: { $regex: q, $options: 'i' } },
        { mobileNumber: { $regex: q, $options: 'i' } },
        { customerName: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('items.document', 'originalName fileExtension sizeBytes mimeType pageCount'),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get single order details
 */
async function getOrderDetails(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId: orderId.toUpperCase() }).populate('items.document');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const payment = await Payment.findOne({ order: order._id });

    return res.status(200).json({
      success: true,
      order,
      payment,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Manually mark order as PRINTED & READY for collection
 */
async function markOrderPrinted(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId: orderId.toUpperCase() });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    order.printingStatus = 'PRINTED';
    order.collectionStatus = 'READY';
    order.printedAt = new Date();
    await order.save();

    notifyOrderUpdated(order.orderId, order);
    notifyAdmin('order_status_change', {
      orderId: order.orderId,
      status: 'PRINTED',
      message: 'Order manually marked as printed by shopkeeper.',
    });

    return res.status(200).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Mark order as collected by customer
 */
async function markOrderCollected(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId: orderId.toUpperCase() });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    order.collectionStatus = 'COLLECTED';
    order.collectedAt = new Date();
    await order.save();

    notifyOrderUpdated(order.orderId, order);

    return res.status(200).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Retry failed print job
 */
async function retryPrintJob(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId: orderId.toUpperCase() }).populate('items.document');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    order.printingStatus = 'QUEUED';
    order.failureReason = null;
    order.printAttempts = (order.printAttempts || 0) + 1;
    await order.save();

    // Re-dispatch to print agent
    dispatchJobToAgents({
      orderId: order.orderId,
      customerName: order.customerName,
      items: order.items.map((item) => ({
        documentId: item.document._id,
        originalName: item.originalName,
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
      isRetry: true,
    });

    notifyOrderUpdated(order.orderId, order);

    return res.status(200).json({
      success: true,
      message: 'Print job re-queued successfully.',
      order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get and update Shop Settings & Pricing
 */
async function getShopSettings(req, res) {
  try {
    let settings = await ShopSettings.findOne();
    if (!settings) {
      settings = await ShopSettings.create({});
    }
    return res.status(200).json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function updateShopSettings(req, res) {
  try {
    const updates = req.body;
    let settings = await ShopSettings.findOne();
    if (!settings) {
      settings = new ShopSettings();
    }

    if (updates.shopName) settings.shopName = updates.shopName;
    if (updates.campusLocation) settings.campusLocation = updates.campusLocation;
    if (updates.contactPhone) settings.contactPhone = updates.contactPhone;
    if (updates.contactEmail) settings.contactEmail = updates.contactEmail;
    if (updates.operatingHours) settings.operatingHours = updates.operatingHours;
    if (updates.estimatedCollectionMinutes) settings.estimatedCollectionMinutes = updates.estimatedCollectionMinutes;
    if (updates.maxFileSizeMB) settings.maxFileSizeMB = updates.maxFileSizeMB;
    if (updates.documentRetentionDays) settings.documentRetentionDays = updates.documentRetentionDays;

    if (updates.pricing) {
      if (updates.pricing.bwSingle !== undefined) settings.pricing.bwSingle = Number(updates.pricing.bwSingle);
      if (updates.pricing.bwDouble !== undefined) settings.pricing.bwDouble = Number(updates.pricing.bwDouble);
      if (updates.pricing.colSingle !== undefined) settings.pricing.colSingle = Number(updates.pricing.colSingle);
      if (updates.pricing.colDouble !== undefined) settings.pricing.colDouble = Number(updates.pricing.colDouble);
    }

    await settings.save();

    notifyAdmin('settings_updated', { settings });

    return res.status(200).json({
      success: true,
      message: 'Shop settings and pricing updated successfully.',
      settings,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getDashboardStats,
  getAllOrders,
  getOrderDetails,
  markOrderPrinted,
  markOrderCollected,
  retryPrintJob,
  getShopSettings,
  updateShopSettings,
};
