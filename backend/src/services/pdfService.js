const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

/**
 * Extracts page count from raw PDF binary by inspecting /Count and /Type /Page
 * @param {Buffer} buffer
 * @returns {number}
 */
function extractPageCountFromBinary(buffer) {
  try {
    const content = buffer.toString('latin1');

    // 1. Check Root /Pages dictionary /Count
    const countMatches = [...content.matchAll(/\/Count\s+(\d+)/gi)];
    let maxCount = 0;
    for (const m of countMatches) {
      const count = parseInt(m[1], 10);
      if (!isNaN(count) && count > maxCount) {
        maxCount = count;
      }
    }

    // 2. Count individual /Type /Page objects (excluding /Type /Pages)
    const pageTokens = content.match(/\/Type\s*\/Page\b(?!\s*s)/g);
    const leafCount = pageTokens ? pageTokens.length : 0;

    return Math.max(maxCount, leafCount);
  } catch {
    return 0;
  }
}

/**
 * Validates a PDF file and extracts its exact page count using multiple fallback strategies.
 * @param {string} filePath - Absolute path to the PDF on disk
 * @returns {Promise<{ isValid: boolean, pageCount: number, error?: string }>}
 */
async function inspectPdfFile(filePath) {
  try {
    const fileBytes = await fs.promises.readFile(filePath);
    // Check PDF magic bytes (%PDF)
    if (fileBytes.length < 5 || fileBytes.toString('utf8', 0, 4) !== '%PDF') {
      return { isValid: false, pageCount: 0, error: 'File header does not match valid PDF structure.' };
    }

    let pdfLibCount = 0;
    try {
      const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      pdfLibCount = pdfDoc.getPageCount();
    } catch (loadErr) {
      console.warn(`[PDF Inspection] pdf-lib load warning for ${filePath}: ${loadErr.message}`);
    }

    const binaryCount = extractPageCountFromBinary(fileBytes);
    const finalPageCount = Math.max(pdfLibCount, binaryCount, 1);

    return { isValid: true, pageCount: finalPageCount };
  } catch (err) {
    return {
      isValid: false,
      pageCount: 0,
      error: `Corrupt or unreadable PDF document: ${err.message}`,
    };
  }
}

/**
 * Creates a sliced PDF containing only the requested 1-based page indices.
 * @param {string} sourcePath - Path to source PDF
 * @param {string} targetPath - Path to save slice
 * @param {number[]} pageNumbers - 1-based page numbers array e.g. [1, 2, 5]
 */
async function slicePdfPages(sourcePath, targetPath, pageNumbers) {
  const sourceBytes = await fs.promises.readFile(sourcePath);
  const srcDoc = await PDFDocument.load(sourceBytes);
  const destDoc = await PDFDocument.create();

  // Convert 1-based indices to 0-based
  const zeroBasedIndices = pageNumbers
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < srcDoc.getPageCount());

  const copiedPages = await destDoc.copyPages(srcDoc, zeroBasedIndices);
  for (const page of copiedPages) {
    destDoc.addPage(page);
  }

  const destBytes = await destDoc.save();
  await fs.promises.writeFile(targetPath, destBytes);
  return targetPath;
}

module.exports = {
  inspectPdfFile,
  slicePdfPages,
};
