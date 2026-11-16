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

      const itemConfig = {
        totalPages: doc.pageCount,
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
        fileType: doc.fileExtension === '.pdf' ? 'pdf' : 'image',
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
 * Customer order tracking by Order ID and Mobile number (or sessionToken)
 * Enforces Customer Data Isolation!
 */
async function trackOrder(req, res) {
  try {
    const { orderId, mobileNumber } = req.query;
    const sessionToken = req.headers['x-session-token'] || req.query.sessionToken;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required.' });
    }

    const query = { orderId: orderId.toUpperCase().trim() };

    const order = await Order.findOne(query).populate('items.document', 'originalName fileExtension sizeBytes');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found. Please check your Order ID.',
      });
    }

    // Security check: Must provide matching mobile number OR matching session token
    const isMobileMatch = mobileNumber && order.mobileNumber === mobileNumber.trim();
    const isSessionMatch = sessionToken && order.sessionToken === sessionToken;

    if (!isMobileMatch && !isSessionMatch) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access. Please enter the mobile number used when placing this order.',
      });
    }

    return res.status(200).json({
      success: true,
      order: {
        orderId: order.orderId,
        customerName: order.customerName,
        mobileNumber: order.mobileNumber,
        items: order.items,
        totalPhysicalSheets: order.totalPhysicalSheets,
        grandTotal: order.grandTotal,
        paymentStatus: order.paymentStatus,
        printingStatus: order.printingStatus,
        collectionStatus: order.collectionStatus,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        printedAt: order.printedAt,
        collectedAt: order.collectedAt,
        failureReason: order.failureReason,
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
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 10-digit mobile number.',
      });
    }

    const orders = await Order.find({ mobileNumber: mobileNumber.trim() })
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
