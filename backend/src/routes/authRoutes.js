const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getMe,
  forgotPasswordRequest,
  forgotPasswordVerify,
  forgotPasswordReset,
} = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, loginAdmin);
router.get('/me', authenticateAdmin, getMe);

// Forgot Password flow (3 steps)
router.post('/forgot-password/request', authLimiter, forgotPasswordRequest);
router.post('/forgot-password/verify', authLimiter, forgotPasswordVerify);
router.post('/forgot-password/reset', authLimiter, forgotPasswordReset);

module.exports = router;
