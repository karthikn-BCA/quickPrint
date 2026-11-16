const rateLimit = require('express-rate-limit');

// Helper to detect local development or loopback addresses
const isLocalOrDev = (req) => {
  if (process.env.NODE_ENV !== 'production') return true;
  const ip = req.ip || req.connection?.remoteAddress || '';
  return ip.includes('127.0.0.1') || ip.includes('::1') || ip === 'localhost';
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: isLocalOrDev,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

// Authentication limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: isLocalOrDev,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts. Please wait a few minutes before trying again.',
  },
});

// Upload limiter
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  skip: isLocalOrDev,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Upload limit reached. Please wait a few minutes before uploading more documents.',
  },
});

// Order creation limiter
const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  skip: isLocalOrDev,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many order requests. Please wait a few moments.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  orderLimiter,
};
