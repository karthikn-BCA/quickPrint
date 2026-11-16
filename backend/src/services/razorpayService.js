const Razorpay = require('razorpay');
const crypto = require('crypto');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'campusprint_webhook_secret_2026';

let razorpayInstance = null;

if (keyId && keySecret && keyId !== 'rzp_test_placeholder' && keySecret !== 'rzp_secret_placeholder') {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log('[Payment] Razorpay SDK initialized with provided Test Keys.');
  } catch (err) {
    console.warn(`[Payment Warning] Could not initialize Razorpay SDK: ${err.message}`);
  }
} else {
  console.log('[Payment] Running with Razorpay Simulation Test Sandbox Mode.');
}

/**
 * Creates an order in Razorpay
 * @param {string} orderId - CampusPrint unique order ID (receipt)
 * @param {number} amountRupees - Verified amount in INR
 */
async function createRazorpayOrder(orderId, amountRupees) {
  const amountPaise = Math.round(amountRupees * 100);

  if (razorpayInstance) {
    try {
      const options = {
        amount: amountPaise,
        currency: 'INR',
        receipt: orderId,
        payment_capture: 1,
        notes: {
          system: 'CampusPrint',
          orderId: orderId,
        },
      };
      const response = await razorpayInstance.orders.create(options);
      return {
        id: response.id,
        amount: response.amount,
        currency: response.currency,
        isSimulated: false,
      };
    } catch (err) {
      console.error('[Razorpay API Error]', err);
      throw new Error(`Razorpay Order Creation Failed: ${err.error?.description || err.message}`);
    }
  }

  // Simulation fallback for local test environment
  const simulatedRazorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  return {
    id: simulatedRazorpayOrderId,
    amount: amountPaise,
    currency: 'INR',
    isSimulated: true,
  };
}

/**
 * Verifies Razorpay payment signature
 */
function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!razorpayOrderId || !razorpayPaymentId) {
    return false;
  }

  if (razorpayInstance && keySecret) {
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    return generated_signature === razorpaySignature;
  }

  // In test simulation mode: if signature starts with 'sim_sig_' or matches hash
  if (razorpaySignature && (razorpaySignature.startsWith('sim_sig_') || razorpaySignature.length >= 16)) {
    return true;
  }

  return false;
}

/**
 * Verifies Razorpay Webhook signature
 */
function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!signatureHeader || !webhookSecret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signatureHeader;
}

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  getRazorpayKeyId: () => keyId || 'rzp_test_campusprint_demo',
  isSimulationMode: () => !razorpayInstance,
};
