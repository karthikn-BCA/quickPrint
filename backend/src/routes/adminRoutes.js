const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllOrders,
  getOrderDetails,
  markOrderPrinted,
  markOrderCollected,
  retryPrintJob,
  getShopSettings,
  updateShopSettings,
} = require('../controllers/adminController');

// All admin routes require JWT authentication
router.use(authenticateAdmin);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.get('/orders/:orderId', getOrderDetails);
router.put('/orders/:orderId/mark-printed', markOrderPrinted);
router.put('/orders/:orderId/mark-collected', markOrderCollected);
router.post('/orders/:orderId/retry-print', retryPrintJob);

router.get('/settings', getShopSettings);
router.put('/settings', updateShopSettings);

module.exports = router;
