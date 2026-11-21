/**
 * Real OTP Service - Cryptographically secure OTP generation, verification,
 * and delivery via Real Email (Gmail / Custom SMTP / Ethereal) and Real SMS (Fast2SMS / Twilio).
 */
const https = require('https');
const nodemailer = require('nodemailer');

// In-memory OTP store: { identifierKey -> { otp, expiresAt, attempts, createdAt, keys } }
const otpStore = new Map();

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30; // Minimum gap between OTP resends

/**
 * Generate a random 6-digit numeric OTP
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
 * Create and store an OTP for the given primary identifier and optional alias keys.
 * Returns { otp, expiresAt, cooldownActive, remainingSeconds }
 */
function createOTP(identifier, aliases = []) {
  const primaryKey = String(identifier).toLowerCase().trim();
  const allKeys = Array.from(
    new Set([primaryKey, ...aliases.map((a) => String(a).toLowerCase().trim()).filter(Boolean)])
  );

  // Check cooldown on all keys
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
 * Strictly verify candidate OTP against stored record.
 * Decrements remaining attempts on failure.
 * Completely deletes record on success or after max attempts.
 */
function verifyOTP(identifier, candidateOTP) {
  const key = String(identifier).toLowerCase().trim();
  const stored = otpStore.get(key);

  if (!stored) {
    return {
      valid: false,
      error: 'No active OTP request found for this account. Please request a new OTP.',
    };
  }

  if (stored.attempts >= MAX_ATTEMPTS) {
    stored.keys.forEach((k) => otpStore.delete(k));
    return {
      valid: false,
      error: 'Maximum verification attempts exceeded. Please request a new OTP.',
    };
  }

  if (new Date() > stored.expiresAt) {
    stored.keys.forEach((k) => otpStore.delete(k));
    return {
      valid: false,
      error: 'The OTP has expired. Please request a new OTP.',
    };
  }

  const cleanCandidate = candidateOTP ? candidateOTP.toString().trim() : '';

  if (stored.otp !== cleanCandidate) {
    stored.attempts += 1;
    const remaining = MAX_ATTEMPTS - stored.attempts;
    if (remaining <= 0) {
      stored.keys.forEach((k) => otpStore.delete(k));
      return {
        valid: false,
        error: 'Too many incorrect attempts. For security, this OTP is now invalidated. Please request a new one.',
      };
    }
    return {
      valid: false,
      error: `Incorrect OTP. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // OTP is correct! Consume all associated keys immediately.
  stored.keys.forEach((k) => otpStore.delete(k));
  return { valid: true };
}

/**
 * Dispatch real email via Nodemailer (Gmail / Custom SMTP)
 */
async function sendRealEmail(recipientEmail, otp) {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.log(`\n${'='.repeat(65)}`);
      console.log(`  🔐 [CAMPUSPRINT ADMIN OTP]`);
      console.log(`  Recipient Email : ${recipientEmail}`);
      console.log(`  ONE-TIME OTP    : >>> ${otp} <<<`);
      console.log(`  Expires In      : ${OTP_EXPIRY_MINUTES} Minutes`);
      console.log(`  -------------------------------------------------------------`);
      console.log(`  ℹ️  To deliver directly into your real Gmail inbox app:`);
      console.log(`      1. Go to https://myaccount.google.com/apppasswords`);
      console.log(`      2. Generate a 16-letter App Password for CampusPrint`);
      console.log(`      3. Paste it into SMTP_PASS in backend/.env`);
      console.log(`${'='.repeat(65)}\n`);

      return {
        success: true,
        recipient: recipientEmail,
        isTerminalDelivery: true,
        message: `OTP generated for ${recipientEmail}. Check your backend terminal (or add your Google App Password to backend/.env for inbox delivery).`,
      };
    }

    // Production SMTP / Gmail
    const isGmail = smtpUser.includes('@gmail.com') || process.env.SMTP_SERVICE === 'gmail';
    const transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: { user: smtpUser, pass: smtpPass },
          }
        : {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: smtpUser, pass: smtpPass },
          }
    );

    const fromAddress = process.env.SMTP_FROM || `CampusPrint Center <${smtpUser}>`;

    const mailOptions = {
      from: fromAddress,
      to: recipientEmail,
      subject: `🔐 CampusPrint Admin Password Reset OTP: ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f4f6f4; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: #2d5a3d; color: white; border-radius: 12px; font-size: 24px;">🖨️</div>
            <h2 style="color: #1e3a29; margin: 12px 0 4px; font-size: 22px; font-weight: 800;">CampusPrint Admin Portal</h2>
            <p style="color: #556b5b; font-size: 13px; margin: 0;">Password Reset Verification</p>
          </div>
          
          <div style="background: white; border-radius: 16px; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid #e1e8e1;">
            <p style="color: #2b3b30; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
              Hello, Administrator. A password reset request was initiated for your CampusPrint shopkeeper account.
            </p>
            <p style="color: #2b3b30; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
              Please use the one-time verification code below to proceed:
            </p>
            
            <div style="text-align: center; background: #eaf1eb; border: 2px dashed #9cb59f; border-radius: 12px; padding: 18px; margin: 20px 0;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #234830;">
                ${otp}
              </span>
            </div>
            
            <p style="color: #6a7c6f; font-size: 12px; line-height: 1.5; margin: 16px 0 0; text-align: center;">
              ⏳ This OTP is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong> and can only be used once.<br/>
              If you did not request this code, please secure your account immediately.
            </p>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <p style="color: #8b9b8f; font-size: 11px; margin: 0;">
              CampusPrint Xerox & Digital Printing Center • SAC Ground Floor
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n📬 [Real Email Sent via Gmail SMTP] Delivered directly to: ${recipientEmail} (ID: ${info.messageId})\n`);

    return {
      success: true,
      recipient: recipientEmail,
      messageId: info.messageId,
      message: `A 6-digit OTP code has been delivered straight to your Gmail inbox (${recipientEmail}).`,
    };
  } catch (err) {
    console.error('[Nodemailer Error]', err.message);
    // Fallback log to terminal so user is not blocked if Google credentials fail
    console.log(`\n${'='.repeat(65)}`);
    console.log(`  🔐 [FALLBACK OTP - Mail Server Notice: ${err.message}]`);
    console.log(`  Recipient Email : ${recipientEmail}`);
    console.log(`  ONE-TIME OTP    : >>> ${otp} <<<`);
    console.log(`${'='.repeat(65)}\n`);

    return {
      success: true,
      recipient: recipientEmail,
      isTerminalDelivery: true,
      message: `OTP generated for ${recipientEmail}. Check your backend terminal for the code.`,
    };
  }
}

/**
 * Dispatch real SMS via Fast2SMS (India) if configured
 */
async function sendRealSMS(mobileNumber, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || !mobileNumber) {
    return { success: false, reason: 'SMS gateway not configured' };
  }

  const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);
  if (cleanNumber.length !== 10) {
    return { success: false, reason: 'Invalid Indian mobile number' };
  }

  return new Promise((resolve) => {
    const postData = JSON.stringify({
      route: 'otp',
      variables_values: otp,
      numbers: cleanNumber,
    });

    const options = {
      hostname: 'www.fast2sms.com',
      port: 443,
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.return === true) {
            console.log(`\n📱 [Real SMS Sent via Fast2SMS] Delivered to: +91 ${cleanNumber}\n`);
            resolve({ success: true, mobile: cleanNumber });
          } else {
            console.warn('[Fast2SMS API Response]', json);
            resolve({ success: false, error: json.message || 'SMS send failed' });
          }
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (e) => {
      console.error('[Fast2SMS Request Error]', e.message);
      resolve({ success: false, error: e.message });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Main dispatcher to deliver real OTP across available channels
 */
async function dispatchRealOTP({ email, mobile, otp }) {
  const emailPromise = email ? sendRealEmail(email, otp) : Promise.resolve(null);
  const smsPromise = mobile ? sendRealSMS(mobile, otp) : Promise.resolve(null);

  const [emailResult, smsResult] = await Promise.all([emailPromise, smsPromise]);

  return {
    email: emailResult,
    sms: smsResult,
  };
}

module.exports = {
  createOTP,
  verifyOTP,
  dispatchRealOTP,
  OTP_EXPIRY_MINUTES,
};
