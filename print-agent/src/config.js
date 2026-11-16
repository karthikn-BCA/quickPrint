require('dotenv').config();

module.exports = {
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  AGENT_API_KEY: process.env.PRINT_AGENT_API_KEY || 'cp_agent_key_campusprint_secure_2026',
  AGENT_ID: process.env.AGENT_ID || 'windows-sac-agent-01',
  PRINTER_NAME: process.env.PRINTER_NAME || 'Campus Xerox High-Speed Printer',
  POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS, 10) || 5000,
  HEARTBEAT_INTERVAL_MS: parseInt(process.env.HEARTBEAT_INTERVAL_MS, 10) || 15000,
  SIMULATION_MODE: process.argv.includes('--simulate') || process.env.SIMULATION_MODE === 'true',
};
