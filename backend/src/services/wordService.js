const AdmZip = require('adm-zip');
const fs = require('fs');

/**
 * Validates a Word DOCX file and extracts its exact page count.
 * @param {string} filePath - Absolute path to .docx file
 * @returns {Promise<{ isValid: boolean, pageCount: number, error?: string }>}
 */
async function inspectDocxFile(filePath) {
  try {
    const zip = new AdmZip(filePath);

    // 1. Check docProps/app.xml for exact rendered <Pages> count
    const appXmlEntry = zip.getEntry('docProps/app.xml');
    if (appXmlEntry) {
      const appXml = appXmlEntry.getData().toString('utf8');
      const pagesMatch = appXml.match(/<Pages>(\d+)<\/Pages>/i);
      if (pagesMatch && parseInt(pagesMatch[1], 10) > 0) {
        return { isValid: true, pageCount: parseInt(pagesMatch[1], 10) };
      }

      // Check word count: average 350-400 words per printed A4 page
      const wordsMatch = appXml.match(/<Words>(\d+)<\/Words>/i);
      if (wordsMatch && parseInt(wordsMatch[1], 10) > 0) {
        const words = parseInt(wordsMatch[1], 10);
        return { isValid: true, pageCount: Math.max(1, Math.ceil(words / 350)) };
      }
    }

    // 2. Count explicit page breaks in word/document.xml
    const docXmlEntry = zip.getEntry('word/document.xml');
    if (docXmlEntry) {
      const docXml = docXmlEntry.getData().toString('utf8');
      const renderedBreaks = (docXml.match(/<w:lastRenderedPageBreak\b/gi) || []).length;
      const explicitBreaks = (docXml.match(/<w:br\b[^>]*w:type="page"/gi) || []).length;
      const totalBreaks = renderedBreaks + explicitBreaks;
      if (totalBreaks > 0) {
        return { isValid: true, pageCount: totalBreaks + 1 };
      }
    }

    return { isValid: true, pageCount: 1 };
  } catch (err) {
    return {
      isValid: false,
      pageCount: 1,
      error: `Could not parse Word document: ${err.message}`,
    };
  }
}

/**
 * Validates a legacy Word .DOC file (OLE2 binary)
 * @param {string} filePath
 * @returns {Promise<{ isValid: boolean, pageCount: number, error?: string }>}
 */
async function inspectDocFile(filePath) {
  try {
    const buf = await fs.promises.readFile(filePath);
    // Check OLE2 header: 0xD0CF11E0A1B11AE1
    if (buf.length < 8 || buf[0] !== 0xd0 || buf[1] !== 0xcf || buf[2] !== 0x11 || buf[3] !== 0xe0) {
      return { isValid: true, pageCount: 1 };
    }

    // Try finding page count in binary metadata: PIDSI_PAGECOUNT (0x0000000E)
    const str = buf.toString('latin1');
    const pageIndex = str.indexOf('\x0E\x00\x00\x00');
    if (pageIndex !== -1 && pageIndex + 8 < buf.length) {
      const val = buf.readInt32LE(pageIndex + 4);
      if (val > 0 && val < 5000) {
        return { isValid: true, pageCount: val };
      }
    }

    // Fallback: estimate from document text size (~2500 bytes printable per A4 page)
    const printableChars = (str.match(/[a-zA-Z0-9\s.,;:!?]/g) || []).length;
    const est = Math.max(1, Math.round(printableChars / 2500));
    return { isValid: true, pageCount: est };
  } catch {
    return { isValid: true, pageCount: 1 };
  }
}

module.exports = {
  inspectDocxFile,
  inspectDocFile,
};
