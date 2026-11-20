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

    // 2. Ensure Admin User exists (and sync real contact info from .env if provided)
    const targetEmail = (process.env.ADMIN_EMAIL || 'admin@campusprint.edu').toLowerCase().trim();
    const targetMobile = (process.env.ADMIN_MOBILE || '9876543210').trim();

    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'CampusPrint Admin',
        mobileNumber: targetMobile,
        email: targetEmail,
        password: 'Admin@CampusPrint2026',
        role: 'admin',
      });
      console.log(`[Seed] Default Admin User created: ${admin.email} / Admin@CampusPrint2026`);
    } else {
      let updated = false;
      if (process.env.ADMIN_EMAIL && admin.email !== targetEmail) {
        admin.email = targetEmail;
        updated = true;
      }
      if (process.env.ADMIN_MOBILE && admin.mobileNumber !== targetMobile) {
        admin.mobileNumber = targetMobile;
        updated = true;
      }
      if (updated) {
        await admin.save();
        console.log(`[Seed] Admin User synced with contact info: ${admin.email} / ${admin.mobileNumber}`);
      }
    }
  } catch (err) {
    console.warn(`[Seed Warning] Could not complete auto-seeding: ${err.message}`);
  }
}

module.exports = { seedInitialData };
