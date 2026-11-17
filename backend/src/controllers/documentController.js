const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { inspectPdfFile } = require('../services/pdfService');
const { inspectDocxFile, inspectDocFile } = require('../services/wordService');

/**
 * Handles uploaded files from Multer
 */
async function uploadDocuments(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded. Please select at least one document.',
      });
    }

    const sessionToken = req.headers['x-session-token'] || req.body.sessionToken || 'guest_session';
    let clientPageCounts = {};
    if (req.body.clientPageCounts) {
      try {
        clientPageCounts = typeof req.body.clientPageCounts === 'string'
          ? JSON.parse(req.body.clientPageCounts)
          : req.body.clientPageCounts;
      } catch (e) {}
    }

    const uploadedDocs = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      let pageCount = 1;
      let isCorrupted = false;

      if (ext === '.pdf') {
        const inspection = await inspectPdfFile(file.path);
        if (!inspection.isValid) {
          // Remove invalid file from disk
          try {
            await fs.promises.unlink(file.path);
          } catch (e) {}

          return res.status(400).json({
            success: false,
            error: `File "${file.originalname}" is corrupted or invalid: ${inspection.error}`,
          });
        }
        pageCount = inspection.pageCount;
      } else if (ext === '.docx') {
        const inspection = await inspectDocxFile(file.path);
        pageCount = inspection.pageCount || 1;
      } else if (ext === '.doc') {
        const inspection = await inspectDocFile(file.path);
        pageCount = inspection.pageCount || 1;
      }

      // Check if client browser pre-detected higher valid page count
      if (clientPageCounts && clientPageCounts[file.originalname]) {
        const clientReported = parseInt(clientPageCounts[file.originalname], 10);
        if (!isNaN(clientReported) && clientReported > pageCount) {
          pageCount = clientReported;
        }
      }

      const docRecord = await Document.create({
        originalName: file.originalname,
        storageFilename: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        fileExtension: ext,
        sizeBytes: file.size,
        pageCount: pageCount,
        uploadedBySession: sessionToken,
        isCorrupted: false,
      });

      uploadedDocs.push({
        id: docRecord._id,
        originalName: docRecord.originalName,
        fileExtension: docRecord.fileExtension,
        sizeBytes: docRecord.sizeBytes,
        pageCount: docRecord.pageCount,
        mimeType: docRecord.mimeType,
        uploadedAt: docRecord.createdAt,
      });
    }

    return res.status(201).json({
      success: true,
      message: `${uploadedDocs.length} document(s) uploaded and validated successfully.`,
      documents: uploadedDocs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `File upload processing failed: ${err.message}`,
    });
  }
}

/**
 * Remove an uploaded document by ID
 */
async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    // Remove from disk
    try {
      if (fs.existsSync(doc.filePath)) {
        await fs.promises.unlink(doc.filePath);
      }
    } catch (e) {
      console.warn(`Could not remove file from disk: ${e.message}`);
    }

    await Document.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Securely stream document file for preview (Admin or authorized session)
 */
async function getDocumentPreview(req, res) {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const resolvedPath = path.resolve(doc.filePath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, error: 'File data missing on storage server.' });
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalName)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const readStream = fs.createReadStream(resolvedPath);
    readStream.pipe(res);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Force file download with attachment Content-Disposition header
 */
async function downloadDocument(req, res) {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const resolvedPath = path.resolve(doc.filePath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, error: 'File data missing on storage server.' });
    }

    // res.download sets Content-Disposition: attachment; filename="<originalName>"
    return res.download(resolvedPath, doc.originalName);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  uploadDocuments,
  deleteDocument,
  getDocumentPreview,
  downloadDocument,
};
