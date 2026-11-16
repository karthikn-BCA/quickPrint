const Order = require('../models/Order');
const Payment = require('../models/Payment');
const PrintingJob = require('../models/PrintingJob');
const { verifyPaymentSignature, verifyWebhookSignature } = require('../services/razorpayService');
const { notifyOrderUpdated, notifyAdmin, dispatchJobToAgents } = require('../services/socketService');

/**
 * Verifies Razorpay payment signature and activates the print queue
 */
async function verifyPayment(req, res) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification parameters.',
      });
    }

    // 1. Fetch order from DB
    const order = await Order.findOne({ orderId: orderId.toUpperCase().trim() }).populate('items.document');
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    // 2. Prevent duplicate processing (Idempotency)
    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Order already verified and paid.',
        orderId: order.orderId,
        printingStatus: order.printingStatus,
      });
    }

    // 3. Cryptographically verify signature
    const isValidSignature = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      // Record failed attempt
      order.paymentStatus = 'FAILED';
      await order.save();

      notifyAdmin('payment_failed', {
        orderId: order.orderId,
        customerName: order.customerName,
        reason: 'Invalid Razorpay cryptographic signature.',
      });

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Signature mismatch. Potential tampering detected.',
      });
    }

    // 4. Record Payment in DB
    const payment = await Payment.create({
      order: order._id,
      orderId: order.orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amountPaise: Math.round(order.grandTotal * 100),
      amountRupees: order.grandTotal,
      currency: 'INR',
      status: 'VERIFIED',
      customerMobile: order.mobileNumber,
    });

    // 5. Update Order Status to PAID and QUEUED
    order.paymentStatus = 'PAID';
    order.printingStatus = 'QUEUED';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paidAt = new Date();
    await order.save();

    // 6. Create PrintingJob in queue
    const printJob = await PrintingJob.create({
      order: order._id,
      orderId: order.orderId,
      status: 'PENDING',
    });

    // 7. Real-Time Socket.IO Notifications
    notifyOrderUpdated(order.orderId, order);

    notifyAdmin('new_paid_order', {
      orderId: order.orderId,
      customerName: order.customerName,
      mobileNumber: order.mobileNumber,
      totalSheets: order.totalPhysicalSheets,
      grandTotal: order.grandTotal,
      paidAt: order.paidAt,
    });

    // 8. Dispatch to connected Windows Print Agents immediately
    dispatchJobToAgents({
      jobId: printJob._id,
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
      createdAt: order.createdAt,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Order entered into automatic printing queue.',
      orderId: order.orderId,
      printingStatus: order.printingStatus,
      paymentId: payment._id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Payment verification exception: ${err.message}`,
    });
  }
}

/**
 * Razorpay Webhook Handler
 */
async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ status: 'Invalid signature' });
    }

    const event = req.body.event;
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const rzpOrderId = paymentEntity.order_id;

      const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
      if (order && order.paymentStatus !== 'PAID') {
        order.paymentStatus = 'PAID';
        order.printingStatus = 'QUEUED';
        order.razorpayPaymentId = paymentEntity.id;
        order.paidAt = new Date();
        await order.save();

        notifyOrderUpdated(order.orderId, order);
        notifyAdmin('new_paid_order', {
          orderId: order.orderId,
          customerName: order.customerName,
          grandTotal: order.grandTotal,
        });
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  verifyPayment,
  handleWebhook,
};
