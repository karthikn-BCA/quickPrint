const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ShopSettings = require('../models/ShopSettings');

const JWT_SECRET = process.env.JWT_SECRET || 'campusprint_super_secret_jwt_key_2026';

/**
 * Middleware to authenticate Admin or Shopkeeper JWT token.
 */
async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Session invalid or user no longer exists.',
      });
    }

    if (user.role !== 'admin' && user.role !== 'shopkeeper') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Administrator or shopkeeper privileges required.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }
}

/**
 * Middleware to authenticate the local Windows Print Agent via API Key.
 */
async function authenticatePrintAgent(req, res, next) {
  try {
    const apiKey = req.headers['x-agent-api-key'] || req.query.agentKey;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Print Agent API key required.',
      });
    }

    const settings = await ShopSettings.findOne().select('+printAgentApiKey');
    const validKey = (settings && settings.printAgentApiKey) || process.env.PRINT_AGENT_API_KEY || 'cp_agent_key_campusprint_secure_2026';

    if (apiKey !== validKey) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Invalid Print Agent API key.',
      });
    }

    req.isPrintAgent = true;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Agent authentication error: ${err.message}`,
    });
  }
}

module.exports = {
  authenticateAdmin,
  authenticatePrintAgent,
  JWT_SECRET,
};
