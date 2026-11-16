const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { io } = require('socket.io-client');
const config = require('./config');
const { preparePdfForPrinting, printDocument } = require('./printer');

// Ensure local temporary directory for spooling downloads
const tempDir = path.resolve(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// In-memory duplicate protection set
const processedOrders = new Set();
let isJobRunning = false;

console.log(`====================================================`);
console.log(`  CampusPrint Windows Print Agent - Version 1.0.0   `);
console.log(`  Backend: ${config.BACKEND_URL}                     `);
console.log(`  Printer: ${config.PRINTER_NAME}                    `);
console.log(`  Mode: ${config.SIMULATION_MODE ? 'Simulation Enabled (Safe Dev Mode)' : 'Physical Spooler'} `);
console.log(`====================================================\n`);

// Setup Axios client with authenticated headers
const apiClient = axios.create({
  baseURL: config.BACKEND_URL,
  headers: {
    'x-agent-api-key': config.AGENT_API_KEY,
  },
  timeout: 30000,
});

/**
 * Downloads document from backend private storage
 */
async function downloadDocument(documentId, filename) {
  const downloadUrl = `/api/print-agent/download/${documentId}`;
  const localFilePath = path.join(tempDir, `job_${Date.now()}_${filename}`);

  const response = await apiClient.get(downloadUrl, {
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(localFilePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(localFilePath));
    writer.on('error', reject);
  });
}

/**
 * Process a single print job
 */
async function processPrintJob(job) {
  const { orderId, items } = job;

  if (processedOrders.has(orderId)) {
    console.log(`[Duplicate Guard] Order ${orderId} has already been processed. Skipping.`);
    return;
  }

  console.log(`\n📥 [New Job Received] Order: ${orderId} (${items.length} file(s))`);

  try {
    // 1. Notify Backend: Printing in Progress
    await apiClient.post('/api/print-agent/jobs/status', {
      orderId,
      status: 'PRINTING',
      agentId: config.AGENT_ID,
    });

    // 2. Process each document in the order
    for (const item of items) {
      console.log(`[Downloading] Fetching "${item.originalName}"...`);
      const downloadedPath = await downloadDocument(item.documentId, item.originalName);

      // Slice custom pages if requested
      const readyToPrintPath = await preparePdfForPrinting(downloadedPath, item);

      // Send to printer
      await printDocument(readyToPrintPath, item);

      // Clean up temporary slice if created
      try {
        if (readyToPrintPath !== downloadedPath && fs.existsSync(readyToPrintPath)) {
          await fs.promises.unlink(readyToPrintPath);
        }
        if (fs.existsSync(downloadedPath)) {
          await fs.promises.unlink(downloadedPath);
        }
      } catch (cleanErr) {}
    }

    // 3. Notify Backend: Job Completed Successfully
    await apiClient.post('/api/print-agent/jobs/status', {
      orderId,
      status: 'PRINTED',
      agentId: config.AGENT_ID,
    });

    processedOrders.add(orderId);
    console.log(`🎉 [Job Finished] Order ${orderId} successfully printed and marked READY!\n`);
  } catch (err) {
    console.error(`❌ [Job Error] Failed printing Order ${orderId}:`, err.message);
    try {
      await apiClient.post('/api/print-agent/jobs/status', {
        orderId,
        status: 'FAILED',
        agentId: config.AGENT_ID,
        failureReason: err.message,
      });
    } catch (e) {}
  }
}

/**
 * Polling Fallback Queue Checker
 */
async function pollPrintQueue() {
  if (isJobRunning) return;

  try {
    const res = await apiClient.get('/api/print-agent/jobs');
    if (res.data?.success && res.data.jobs?.length > 0) {
      isJobRunning = true;
      for (const job of res.data.jobs) {
        if (!processedOrders.has(job.orderId)) {
          await processPrintJob(job);
        }
      }
    }
  } catch (err) {
    // Backend unreachable or offline
  } finally {
    isJobRunning = false;
  }
}

/**
 * Agent Heartbeat Reporter
 */
async function sendHeartbeat() {
  try {
    await apiClient.post('/api/print-agent/heartbeat', {
      printerName: config.PRINTER_NAME,
      simulationMode: config.SIMULATION_MODE,
      status: 'online',
    });
  } catch (err) {}
}

// -------------------------------------------------------------
// Connect via WebSockets for Real-Time Instant Dispatch
// -------------------------------------------------------------
const socket = io(config.BACKEND_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
});

socket.on('connect', () => {
  console.log(`[Socket Connected] Connected to CampusPrint real-time hub.`);
  socket.emit('register_agent', {
    agentId: config.AGENT_ID,
    printerName: config.PRINTER_NAME,
    simulationMode: config.SIMULATION_MODE,
  });
  sendHeartbeat();
});

socket.on('new_print_job', async (job) => {
  console.log(`⚡ [Real-Time Trigger] Received instant print job for Order ${job.orderId}`);
  await processPrintJob(job);
});

socket.on('disconnect', () => {
  console.log(`[Socket Disconnected] Will attempt reconnection...`);
});

// Periodic Timers for Polling Fallback & Heartbeat
setInterval(pollPrintQueue, config.POLL_INTERVAL_MS);
setInterval(sendHeartbeat, config.HEARTBEAT_INTERVAL_MS);

// Initial immediate poll & heartbeat
sendHeartbeat();
pollPrintQueue();
