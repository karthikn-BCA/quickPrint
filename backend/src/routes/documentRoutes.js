const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/fileUpload');
const { uploadDocuments, deleteDocument, getDocumentPreview } = require('../controllers/documentController');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Upload up to 10 files
router.post('/upload', uploadLimiter, upload.array('documents', 10), uploadDocuments);

// Secure stream preview
router.get('/preview/:id', getDocumentPreview);

// Delete file before checkout
router.delete('/:id', deleteDocument);

module.exports = router;
