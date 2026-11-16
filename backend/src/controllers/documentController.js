const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { inspectPdfFile } = require('../services/pdfService');

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

    if (!fs.existsSync(doc.filePath)) {
      return res.status(404).json({ success: false, error: 'File data missing on storage server.' });
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalName)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const readStream = fs.createReadStream(doc.filePath);
    readStream.pipe(res);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  uploadDocuments,
  deleteDocument,
  getDocumentPreview,
};
