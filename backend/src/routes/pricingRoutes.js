const express = require('express');
const router = express.Router();
const { getPublicPricing, calculateEstimate } = require('../controllers/pricingController');

router.get('/', getPublicPricing);
router.post('/calculate', calculateEstimate);

module.exports = router;
