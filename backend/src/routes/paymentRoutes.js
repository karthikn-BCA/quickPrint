const express = require('express');
const router = express.Router();
const { verifyPayment, handleWebhook } = require('../controllers/paymentController');

router.post('/verify', verifyPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
