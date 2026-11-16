const express = require('express');
const router = express.Router();
const { createOrder, trackOrder, getCustomerOrders } = require('../controllers/orderController');
const { orderLimiter } = require('../middleware/rateLimiter');

router.post('/create', orderLimiter, createOrder);
router.get('/track', trackOrder);
router.get('/my-orders', getCustomerOrders);

module.exports = router;
