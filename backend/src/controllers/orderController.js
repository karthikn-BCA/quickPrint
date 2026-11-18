const crypto = require('crypto');
const Order = require('../models/Order');
const Document = require('../models/Document');
const { getActivePricing, calculateItemPricing } = require('../services/pricingEngine');
const { generateOrderId } = require('../utils/orderIdGenerator');
const { createRazorpayOrder, getRazorpayKeyId, isSimulationMode } = require('../services/razorpayService');
const { notifyAdmin } = require('../services/socketService');

/**
 * Creates a new Pending order and initiates Razorpay payment order
 */
async function createOrder(req, res) {
  try {
    const { customerName, mobileNumber, email, items } = req.body;

    // Validate customer info
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Customer name is required.' });
    }
    const cleanMobile = (mobileNumber || '').toString().trim();
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain at least one document.' });
    }

    // Fetch active pricing from DB
    const pricingRates = await getActivePricing();

    const validatedItems = [];
    let grandTotal = 0;
    let totalPhysicalSheets = 0;

    // Validate every document in DB and recalculate pricing
    for (const item of items) {
      const docId = item.documentId || item.document || item.id;
      const doc = await Document.findById(docId);
      if (!doc) {
        return res.status(400).json({
          success: false,
          error: `Document "${item.originalName || docId}" not found or expired. Please re-upload.`,
        });
      }

      const effectivePages = Math.max(1, parseInt(item.totalPages, 10) || doc.pageCount || 1);
      if (effectivePages > doc.pageCount) {
        doc.pageCount = effectivePages;
        await doc.save();
      }

      const itemConfig = {
        totalPages: effectivePages,
        printType: item.printType === 'COLOUR' ? 'COLOUR' : 'BW',
        printSides: item.printSides === 'DOUBLE' ? 'DOUBLE' : 'SINGLE',
        copies: parseInt(item.copies, 10) || 1,
        pageSelection: item.pageSelection === 'CUSTOM' ? 'CUSTOM' : 'ALL',
        customPages: (item.customPages || '').trim(),
      };

      let calculated;
      try {
        calculated = calculateItemPricing(itemConfig, pricingRates);
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: `Invalid configuration for "${doc.originalName}": ${err.message}`,
        });
      }

      grandTotal += calculated.itemTotal;
      totalPhysicalSheets += calculated.physicalSheets;

      validatedItems.push({
        document: doc._id,
        originalName: doc.originalName,
        fileType: doc.fileExtension === '.pdf' ? 'pdf' : (doc.fileExtension === '.docx' || doc.fileExtension === '.doc' ? 'word' : 'image'),
        paperSize: 'A4',
        orientation: item.orientation === 'LANDSCAPE' ? 'LANDSCAPE' : 'PORTRAIT',
        ...calculated,
      });
    }

    const verifiedGrandTotal = Number(grandTotal.toFixed(2));
    const uniqueOrderId = generateOrderId();
    const sessionToken = crypto.randomBytes(24).toString('hex');

    // Create Razorpay payment order
    const rzpOrder = await createRazorpayOrder(uniqueOrderId, verifiedGrandTotal);

    // Save pending order to database
    const newOrder = await Order.create({
      orderId: uniqueOrderId,
      customerName: customerName.trim(),
      mobileNumber: cleanMobile,
      email: email ? email.trim().toLowerCase() : undefined,
      sessionToken,
      items: validatedItems,
      totalPhysicalSheets,
      grandTotal: verifiedGrandTotal,
      paymentStatus: 'PENDING',
      printingStatus: 'WAITING_FOR_PAYMENT',
      collectionStatus: 'UNCOLLECTED',
      razorpayOrderId: rzpOrder.id,
    });

    // Notify admin dashboard in real-time
    notifyAdmin('new_pending_order', {
      orderId: uniqueOrderId,
      customerName: newOrder.customerName,
      totalSheets: totalPhysicalSheets,
      grandTotal: verifiedGrandTotal,
    });

    return res.status(201).json({
      success: true,
      order: {
        orderId: newOrder.orderId,
        customerName: newOrder.customerName,
        mobileNumber: newOrder.mobileNumber,
        totalPhysicalSheets: newOrder.totalPhysicalSheets,
        grandTotal: newOrder.grandTotal,
        paymentStatus: newOrder.paymentStatus,
        printingStatus: newOrder.printingStatus,
        sessionToken: newOrder.sessionToken,
      },
      payment: {
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: getRazorpayKeyId(),
        isSimulated: isSimulationMode(),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Order creation failed: ${err.message}`,
    });
  }
}

/**
 * Customer order tracking by Order ID or Mobile number
 */
async function trackOrder(req, res) {
  try {
    const { orderId, mobileNumber } = req.query;

    const rawOrderId = (orderId || '').toString().trim().toUpperCase();
    const cleanOrderId = rawOrderId.replace(/[^A-Z0-9]/g, '');
    const cleanMobile = (mobileNumber || '').toString().replace(/\D/g, '').slice(-10);

    if (!cleanOrderId && !cleanMobile) {
      return res.status(400).json({ success: false, error: 'Please enter either an Order ID or your Mobile Number.' });
    }

    let order = null;

    // 1. Try finding by Order ID (exact or regex partial match)
    if (cleanOrderId) {
      order = await Order.findOne({ orderId: cleanOrderId })
        .populate('items.document', 'originalName fileExtension sizeBytes');

      if (!order) {
        order = await Order.findOne({
          orderId: { $regex: cleanOrderId, $options: 'i' },
        }).populate('items.document', 'originalName fileExtension sizeBytes');
      }
    }

    // 2. If not found by Order ID, or if only mobile provided, find latest order by mobile
    if (!order) {
      const candidateMobile = (cleanMobile && cleanMobile.length === 10)
        ? cleanMobile
        : ((cleanOrderId.length === 10 && /^\d{10}$/.test(cleanOrderId)) ? cleanOrderId : null);

      if (candidateMobile) {
        order = await Order.findOne({ mobileNumber: candidateMobile })
          .sort({ createdAt: -1 })
          .populate('items.document', 'originalName fileExtension sizeBytes');
      }
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: cleanOrderId
          ? `Order "${rawOrderId}" not found. Please verify your Order ID.`
          : `No print orders found for mobile number "${mobileNumber}".`,
      });
    }

    return res.status(200).json({
      success: true,
      order: {
        orderId: order.orderId,
        customerName: order.customerName,
        mobileNumber: order.mobileNumber,
        items: order.items || [],
        totalPhysicalSheets: order.totalPhysicalSheets || 0,
        grandTotal: order.grandTotal || 0,
        paymentStatus: order.paymentStatus || 'PAID',
        printingStatus: order.printingStatus || 'QUEUED',
        collectionStatus: order.collectionStatus || 'PENDING',
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        printedAt: order.printedAt,
        collectedAt: order.collectedAt,
        failureReason: order.failureReason || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Customer order history lookup by verified mobile number
 */
async function getCustomerOrders(req, res) {
  try {
    const { mobileNumber } = req.query;
    const cleanMobile = (mobileNumber || '').toString().replace(/\D/g, '').slice(-10);

    if (!cleanMobile || cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 10-digit mobile number.',
      });
    }

    const orders = await Order.find({ mobileNumber: cleanMobile })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('orderId customerName totalPhysicalSheets grandTotal paymentStatus printingStatus collectionStatus createdAt paidAt');

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createOrder,
  trackOrder,
  getCustomerOrders,
};
