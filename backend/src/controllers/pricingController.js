const { getActivePricing, calculateItemPricing, parseAndValidatePageRange } = require('../services/pricingEngine');
const ShopSettings = require('../models/ShopSettings');

/**
 * Returns public shop pricing and general campus shop information
 */
async function getPublicPricing(req, res) {
  try {
    const pricing = await getActivePricing();
    const settings = await ShopSettings.findOne().lean();

    return res.status(200).json({
      success: true,
      pricing,
      shop: {
        shopName: settings?.shopName || 'CampusPrint Xerox & Digital Printing Center',
        campusLocation: settings?.campusLocation || 'SAC Ground Floor, Main Campus',
        contactPhone: settings?.contactPhone || '+91 98765 43210',
        operatingHours: settings?.operatingHours || 'Mon-Sat: 8:30 AM to 7:00 PM',
        estimatedCollectionMinutes: settings?.estimatedCollectionMinutes || 15,
        maxFileSizeMB: settings?.maxFileSizeMB || 25,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Validates and calculates estimated pricing for cart items
 */
async function calculateEstimate(req, res) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Items array is required' });
    }

    const pricingRates = await getActivePricing();
    let grandTotal = 0;
    let totalPhysicalSheets = 0;

    const calculatedItems = [];

    for (const item of items) {
      try {
        const itemResult = calculateItemPricing(item, pricingRates);
        grandTotal += itemResult.itemTotal;
        totalPhysicalSheets += itemResult.physicalSheets;

        calculatedItems.push({
          documentId: item.documentId || item.id,
          originalName: item.originalName,
          ...itemResult,
        });
      } catch (calcError) {
        return res.status(400).json({
          success: false,
          error: `Error calculating price for "${item.originalName || 'Document'}": ${calcError.message}`,
        });
      }
    }

    return res.status(200).json({
      success: true,
      rates: pricingRates,
      totalPhysicalSheets,
      grandTotal: Number(grandTotal.toFixed(2)),
      items: calculatedItems,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getPublicPricing,
  calculateEstimate,
};
