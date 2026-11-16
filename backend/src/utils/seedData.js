const User = require('../models/User');
const ShopSettings = require('../models/ShopSettings');

async function seedInitialData() {
  try {
    // 1. Ensure Shop Settings exist
    let settings = await ShopSettings.findOne();
    if (!settings) {
      settings = await ShopSettings.create({
        shopName: 'CampusPrint Xerox & Digital Printing Center',
        campusLocation: 'Ground Floor, Student Activity Centre (SAC), Main Campus',
        contactPhone: '+91 98765 43210',
        contactEmail: 'support@campusprint.college.edu',
        operatingHours: 'Monday - Saturday: 8:30 AM to 7:00 PM (Closed on Sundays)',
        estimatedCollectionMinutes: 15,
        pricing: {
          bwSingle: 2.0,
          bwDouble: 2.0,
          colSingle: 10.0,
          colDouble: 10.0,
        },
        maxFileSizeMB: 25,
        documentRetentionDays: 7,
        printAgentApiKey: 'cp_agent_key_campusprint_secure_2026',
        agentStatus: {
          online: true,
          lastHeartbeat: new Date(),
          printerName: 'Campus HP LaserJet Enterprise',
          simulationMode: true,
        },
      });
      console.log('[Seed] Default Shop Settings created.');
    }

    // 2. Ensure Admin User exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'CampusPrint Admin',
        mobileNumber: '9876543210',
        email: 'admin@campusprint.edu',
        password: 'Admin@CampusPrint2026',
        role: 'admin',
      });
      console.log('[Seed] Default Admin User created: admin@campusprint.edu / Admin@CampusPrint2026');
    }
  } catch (err) {
    console.warn(`[Seed Warning] Could not complete auto-seeding: ${err.message}`);
  }
}

module.exports = { seedInitialData };
