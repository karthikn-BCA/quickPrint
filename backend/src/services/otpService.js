/**
 * OTP Service - In-memory OTP store with optional email delivery
 *
 * In development mode (or when email is not configured), the OTP is logged
 * to the console and returned in the API response so you can test.
 *
 * To enable real email delivery:
 *   1. npm install nodemailer
 *   2. Set these in .env:
 *      SMTP_HOST=smtp.gmail.com
 *      SMTP_PORT=587
 *      SMTP_USER=your-email@gmail.com
 *      SMTP_PASS=your-app-password
 *      SMTP_FROM=CampusPrint <your-email@gmail.com>
 */

// In-memory OTP store: { email -> { otp, expiresAt, attempts } }
const otpStore = new Map();

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60; // minimum gap between OTP requests

/**
 * Generate a random numeric OTP
 */
function generateOTP() {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Create and store an OTP for the given identifier (and optional aliases)
 * Returns { otp, expiresAt, cooldownActive }
 */
function createOTP(identifier, aliases = []) {
  const primaryKey = String(identifier).toLowerCase().trim();
  const allKeys = [primaryKey, ...aliases.map((a) => String(a).toLowerCase().trim()).filter(Boolean)];

  // Check cooldown on any key
  for (const k of allKeys) {
    const existing = otpStore.get(k);
    if (existing && existing.createdAt) {
      const elapsed = (Date.now() - existing.createdAt) / 1000;
      if (elapsed < COOLDOWN_SECONDS) {
        return {
          cooldownActive: true,
          remainingSeconds: Math.ceil(COOLDOWN_SECONDS - elapsed),
        };
      }
    }
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const entry = {
    otp,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
    keys: allKeys,
  };

  for (const k of allKeys) {
    otpStore.set(k, entry);
  }

  // Auto-cleanup after expiry
  setTimeout(() => {
    for (const k of allKeys) {
      const stored = otpStore.get(k);
      if (stored && stored.otp === otp) {
        otpStore.delete(k);
      }
    }
  }, OTP_EXPIRY_MINUTES * 60 * 1000 + 5000);

  return { otp, expiresAt, cooldownActive: false };
}

/**
 * Verify an OTP for the given identifier
 * Returns { valid, error }
 */
function verifyOTP(identifier, candidateOTP) {
  const key = String(identifier).toLowerCase().trim();
  const stored = otpStore.get(key);

  if (!stored) {
    return { valid: false, error: 'No OTP found for this account. Please request a new one.' };
  }

  if (stored.attempts >= MAX_ATTEMPTS) {
    if (stored.keys) {
      stored.keys.forEach((k) => otpStore.delete(k));
    } else {
      otpStore.delete(key);
    }
    return { valid: false, error: 'Too many failed attempts. Please request a new OTP.' };
  }

  if (new Date() > stored.expiresAt) {
    if (stored.keys) {
      stored.keys.forEach((k) => otpStore.delete(k));
    } else {
      otpStore.delete(key);
    }
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (stored.otp !== candidateOTP.toString().trim()) {
    stored.attempts += 1;
    const remaining = MAX_ATTEMPTS - stored.attempts;
    return {
      valid: false,
      error: remaining > 0
        ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many failed attempts. Please request a new OTP.',
    };
  }

  // OTP is valid — consume all associated keys
  if (stored.keys) {
    stored.keys.forEach((k) => otpStore.delete(k));
  } else {
    otpStore.delete(key);
  }
  return { valid: true };
}

/**
 * Send OTP via email (optional — requires nodemailer + SMTP config)
 * Returns { sent, message }
 */
async function sendOTPEmail(email, otp, mobile) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // If SMTP is not configured, log clearly in console for dev / simulated mode
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`\n${'='.repeat(55)}`);
    console.log(`  🔑 CAMPUSPRINT ADMIN PASSWORD RESET OTP`);
    if (email) console.log(`  Registered Email : ${email}`);
    if (mobile) console.log(`  Registered Mobile: +91 ${mobile}`);
    console.log(`  OTP CODE         : >>> ${otp} <<<`);
    console.log(`  Valid For        : ${OTP_EXPIRY_MINUTES} Minutes`);
    console.log(`${'='.repeat(55)}\n`);
    return {
      sent: false,
      message: 'OTP generated and dispatched.',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  // Try to load nodemailer
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (e) {
    console.log(`\n[OTP] nodemailer not installed. OTP for ${email}: ${otp}\n`);
    return {
      sent: false,
      message: 'Email delivery unavailable (nodemailer not installed). OTP displayed in server console.',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const fromAddress = process.env.SMTP_FROM || `CampusPrint <${smtpUser}>`;

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `🔐 CampusPrint Password Reset OTP: ${otp}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8faf8; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2d5a3d; font-size: 24px; margin: 0;">🖨️ CampusPrint</h1>
            <p style="color: #666; font-size: 13px; margin-top: 4px;">Password Reset Request</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e0e8e0;">
            <p style="color: #333; font-size: 14px; margin: 0 0 16px;">
              You requested a password reset for your CampusPrint admin account. Use the OTP below to verify your identity:
            </p>
            <div style="text-align: center; background: #f0f5f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2d5a3d;">
                ${otp}
              </span>
            </div>
            <p style="color: #888; font-size: 12px; margin: 16px 0 0; text-align: center;">
              This OTP expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>. Do not share it with anyone.
            </p>
          </div>
          <p style="color: #aaa; font-size: 11px; text-align: center; margin-top: 20px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    return { sent: true, message: 'OTP sent to your registered email address.' };
  } catch (err) {
    console.error('[OTP Email Error]', err.message);
    console.log(`[OTP Fallback] OTP for ${email}: ${otp}`);
    return {
      sent: false,
      message: 'Could not send email. OTP displayed in server console.',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }
}

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
  sendOTPEmail,
  OTP_EXPIRY_MINUTES,
};
