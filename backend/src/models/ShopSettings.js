const mongoose = require('mongoose');

const shopSettingsSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: 'CampusPrint Xerox & Digital Printing Center',
      trim: true,
    },
    campusLocation: {
      type: String,
      default: 'Ground Floor, Student Activity Centre (SAC), Main Campus',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'support@campusprint.college.edu',
      trim: true,
    },
    operatingHours: {
      type: String,
      default: 'Monday - Saturday: 8:30 AM to 7:00 PM (Closed on Sundays)',
      trim: true,
    },
    estimatedCollectionMinutes: {
      type: Number,
      default: 15,
      min: 1,
      max: 120,
    },
    // Pricing configurations (in INR per physical sheet)
    pricing: {
      bwSingle: {
        type: Number,
        default: 2.0, // ₹2 per sheet
        min: 0.1,
      },
      bwDouble: {
        type: Number,
        default: 2.0, // ₹2 per physical sheet
        min: 0.1,
      },
      colSingle: {
        type: Number,
        default: 10.0, // ₹10 per sheet
        min: 0.1,
      },
      colDouble: {
        type: Number,
        default: 10.0, // ₹10 per physical sheet
        min: 0.1,
      },
    },
    // File upload settings
    maxFileSizeMB: {
      type: Number,
      default: 25,
      min: 1,
      max: 100,
    },
    allowedExtensions: {
      type: [String],
      default: ['.pdf', '.jpg', '.jpeg', '.png'],
    },
    documentRetentionDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 30,
    },
    // Print Agent security
    printAgentApiKey: {
      type: String,
      default: 'cp_agent_key_campusprint_secure_2026',
      select: false,
    },
    autoPrintEnabled: {
      type: Boolean,
      default: true,
    },
    agentStatus: {
      online: { type: Boolean, default: false },
      lastHeartbeat: { type: Date, default: null },
      printerName: { type: String, default: 'Simulated Shop Printer' },
      simulationMode: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShopSettings', shopSettingsSchema);
