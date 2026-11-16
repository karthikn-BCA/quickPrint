const express = require('express');
const router = express.Router();
const { authenticatePrintAgent } = require('../middleware/auth');
const {
  getPendingPrintJobs,
  downloadDocumentForPrinting,
  updatePrintJobStatus,
  reportHeartbeat,
} = require('../controllers/printAgentController');

// All print-agent routes require API Key authentication
router.use(authenticatePrintAgent);

router.get('/jobs', getPendingPrintJobs);
router.get('/download/:documentId', downloadDocumentForPrinting);
router.post('/jobs/status', updatePrintJobStatus);
router.post('/heartbeat', reportHeartbeat);

module.exports = router;
