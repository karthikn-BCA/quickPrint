const crypto = require('crypto');

/**
 * Generates unique human-readable Order ID e.g. XR20261116001
 * Uses Date prefix + unique incremental-like alphanumeric suffix
 */
function generateOrderId(prefix = 'XR') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Random 4-digit uppercase alphanumeric token
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `${prefix}${dateStr}${randomSuffix}`;
}

module.exports = { generateOrderId };
