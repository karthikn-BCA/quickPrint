const ShopSettings = require('../models/ShopSettings');

/**
 * Parses and validates custom page string (e.g., "1-5, 8, 10-12") against total document pages.
 * @param {string} customRangeStr - Page range string entered by user
 * @param {number} totalPages - Actual number of pages in the document
 * @returns {{ isValid: boolean, error?: string, pages: number[], count: number }}
 */
function parseAndValidatePageRange(customRangeStr, totalPages) {
  if (!customRangeStr || typeof customRangeStr !== 'string') {
    return { isValid: false, error: 'Custom page range must be provided as a non-empty string.', pages: [], count: 0 };
  }

  const trimmed = customRangeStr.trim();
  if (trimmed.toLowerCase() === 'all') {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return { isValid: true, pages, count: totalPages };
  }

  const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { isValid: false, error: 'Page range cannot be empty.', pages: [], count: 0 };
  }

  const pageSet = new Set();

  for (const part of parts) {
    if (part.includes('-')) {
      const rangeParts = part.split('-').map((s) => s.trim());
      if (rangeParts.length !== 2) {
        return { isValid: false, error: `Invalid range format: "${part}". Example: 1-5`, pages: [], count: 0 };
      }
      const start = parseInt(rangeParts[0], 10);
      const end = parseInt(rangeParts[1], 10);

      if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0) {
        return { isValid: false, error: `Page numbers must be positive integers: "${part}"`, pages: [], count: 0 };
      }
      if (start > end) {
        return { isValid: false, error: `Start page cannot exceed end page in range: "${part}"`, pages: [], count: 0 };
      }
      if (end > totalPages) {
        return { isValid: false, error: `Page range "${part}" exceeds total document pages (${totalPages}).`, pages: [], count: 0 };
      }

      for (let i = start; i <= end; i++) {
        pageSet.add(i);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum) || pageNum <= 0) {
        return { isValid: false, error: `Invalid page number: "${part}"`, pages: [], count: 0 };
      }
      if (pageNum > totalPages) {
        return { isValid: false, error: `Page ${pageNum} exceeds total document pages (${totalPages}).`, pages: [], count: 0 };
      }
      pageSet.add(pageNum);
    }
  }

  const pages = Array.from(pageSet).sort((a, b) => a - b);
  if (pages.length === 0) {
    return { isValid: false, error: 'No valid pages selected.', pages: [], count: 0 };
  }

  return { isValid: true, pages, count: pages.length };
}

/**
 * Calculates physical sheets and cost for an item based on configuration and shop pricing.
 */
function calculateItemPricing(itemConfig, pricingRates) {
  const { totalPages, printType, printSides, copies = 1, pageSelection = 'ALL', customPages = '' } = itemConfig;

  let selectedPages = [];
  let selectedPagesCount = 0;

  if (pageSelection === 'CUSTOM' && customPages) {
    const validated = parseAndValidatePageRange(customPages, totalPages);
    if (!validated.isValid) {
      throw new Error(validated.error);
    }
    selectedPages = validated.pages;
    selectedPagesCount = validated.count;
  } else {
    selectedPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    selectedPagesCount = totalPages;
  }

  const validatedCopies = Math.max(1, Math.min(100, parseInt(copies, 10) || 1));

  // Physical sheets calculation
  // Single-sided: sheets = Selected pages × Copies
  // Double-sided: sheets = Ceiling(Selected pages / 2) × Copies
  let physicalSheets = 0;
  if (printSides === 'DOUBLE') {
    physicalSheets = Math.ceil(selectedPagesCount / 2) * validatedCopies;
  } else {
    physicalSheets = selectedPagesCount * validatedCopies;
  }

  // Rate lookup
  let ratePerSheet = 2.0;
  if (printType === 'COLOUR') {
    ratePerSheet = printSides === 'DOUBLE' ? pricingRates.colDouble : pricingRates.colSingle;
  } else {
    ratePerSheet = printSides === 'DOUBLE' ? pricingRates.bwDouble : pricingRates.bwSingle;
  }

  const itemTotal = Number((physicalSheets * ratePerSheet).toFixed(2));

  return {
    totalPages,
    selectedPagesList: selectedPages,
    selectedPagesCount,
    copies: validatedCopies,
    printType,
    printSides,
    physicalSheets,
    ratePerSheet,
    itemTotal,
  };
}

/**
 * Retrieves the current shop pricing rates from the database.
 */
async function getActivePricing() {
  let settings = await ShopSettings.findOne().lean();
  if (!settings || !settings.pricing) {
    return {
      bwSingle: 2.0,
      bwDouble: 2.0,
      colSingle: 10.0,
      colDouble: 10.0,
    };
  }
  return settings.pricing;
}

module.exports = {
  parseAndValidatePageRange,
  calculateItemPricing,
  getActivePricing,
};
