const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { createOTP, verifyOTP, dispatchRealOTP, OTP_EXPIRY_MINUTES } = require('../services/otpService');

// In-memory store for verified reset sessions: { key -> { token, expiresAt, keys } }
const resetTokens = new Map();

/**
 * Helper to locate an admin or shopkeeper account by:
 * - email
 * - 10-digit mobile number
 * - username or role alias 'admin'
 */
async function findAdminUser(identifier, includePassword = false) {
  if (!identifier) return null;
  const clean = identifier.toString().trim();
  const cleanPhone = clean.replace(/\D/g, '').slice(-10);

  const orConditions = [{ email: clean.toLowerCase() }];
  if (cleanPhone && cleanPhone.length === 10) {
    orConditions.push({ mobileNumber: cleanPhone });
  }
  if (clean.toLowerCase() === 'admin') {
    orConditions.push({ role: 'admin' });
  }

  let query = User.findOne({ $or: orConditions });
  if (includePassword) {
    query = query.select('+password');
  }
  return await query;
}

/**
 * Admin / Shopkeeper Login
 */
async function loginAdmin(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both identifier (email or mobile) and password.',
      });
    }

    // Find by email, mobile, or 'admin'
    const user = await findAdminUser(identifier, true);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User not found.',
      });
    }

    if (user.role !== 'admin' && user.role !== 'shopkeeper') {
      return res.status(403).json({
        success: false,
        error: 'Access restricted to authorized shop administrators.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Server error during login: ${err.message}`,
    });
  }
}

/**
 * Get current authenticated user profile
 */
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Step 1: Request OTP for password reset
 * POST /api/auth/forgot-password/request
 * Body: { identifier } — email or mobile number
 */
async function forgotPasswordRequest(req, res) {
  try {
    const { identifier } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your registered email or mobile number.',
      });
    }

    const cleanIdentifier = identifier.trim();

    // Find admin user
    const user = await findAdminUser(cleanIdentifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No administrator account found with this email or mobile number.',
      });
    }

    if (user.role !== 'admin' && user.role !== 'shopkeeper') {
      return res.status(403).json({
        success: false,
        error: 'Password reset is only available for administrator accounts.',
      });
    }

    // If identifier is an email and user is admin, sync admin's email so they receive it at their requested email
    const cleanEmail = cleanIdentifier.toLowerCase();
    if (cleanEmail.includes('@') && user.email !== cleanEmail) {
      user.email = cleanEmail;
      await user.save();
    }

    const aliases = [
      user.email,
      user.mobileNumber,
      user._id.toString(),
      'admin',
    ].filter(Boolean);

    // Generate OTP keyed with aliases
    const otpResult = createOTP(user.email || user.mobileNumber, aliases);

    if (otpResult.cooldownActive) {
      return res.status(429).json({
        success: false,
        error: `Please wait ${otpResult.remainingSeconds} seconds before requesting another OTP.`,
      });
    }

    // Dispatch real OTP via Email and/or SMS
    const dispatchResult = await dispatchRealOTP({
      email: user.email,
      mobile: user.mobileNumber,
      otp: otpResult.otp,
    });

    if (dispatchResult.email && !dispatchResult.email.success) {
      return res.status(400).json({
        success: false,
        error: dispatchResult.email.error || 'Failed to send OTP email. Please check SMTP configuration in backend/.env.',
      });
    }

    // Mask email
    let maskedEmail = '';
    if (user.email) {
      const parts = user.email.split('@');
      const maskedLocal = parts[0].length <= 2
        ? parts[0][0] + '***'
        : parts[0][0] + '***' + parts[0].slice(-1);
      maskedEmail = maskedLocal + '@' + parts[1];
    }

    // Mask phone
    let maskedPhone = '';
    if (user.mobileNumber) {
      maskedPhone = '******' + user.mobileNumber.slice(-4);
    }

    return res.status(200).json({
      success: true,
      message: `A 6-digit OTP code has been sent directly to your email (${maskedEmail}). Please check your inbox.`,
      email: maskedEmail,
      mobile: maskedPhone,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Server error: ${err.message}`,
    });
  }
}

/**
 * Step 2: Verify OTP
 * POST /api/auth/forgot-password/verify
 * Body: { identifier, otp }
 */
async function forgotPasswordVerify(req, res) {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both your identifier and the OTP.',
      });
    }

    const user = await findAdminUser(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Administrator account not found.',
      });
    }

    if (user.role !== 'admin' && user.role !== 'shopkeeper') {
      return res.status(403).json({
        success: false,
        error: 'Access restricted to administrator accounts.',
      });
    }

    // Check OTP using any of user's keys
    const verification = verifyOTP(user.email || user.mobileNumber || identifier, otp);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        error: verification.error,
      });
    }

    // OTP verified — create a one-time reset token (valid for 15 minutes)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetKeys = [
      user.email,
      user.mobileNumber,
      user._id.toString(),
      'admin',
      identifier.toString().trim().toLowerCase(),
    ].filter(Boolean).map((k) => k.toLowerCase());

    const entry = {
      token: resetToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      keys: resetKeys,
    };

    for (const k of resetKeys) {
      resetTokens.set(k, entry);
    }

    // Auto-cleanup
    setTimeout(() => {
      for (const k of resetKeys) {
        const stored = resetTokens.get(k);
        if (stored && stored.token === resetToken) {
          resetTokens.delete(k);
        }
      }
    }, 15 * 60 * 1000 + 5000);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You may now create a new password.',
      resetToken,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Server error: ${err.message}`,
    });
  }
}

/**
 * Step 3: Reset password with verified reset token
 * POST /api/auth/forgot-password/reset
 * Body: { identifier, resetToken, newPassword }
 */
async function forgotPasswordReset(req, res) {
  try {
    const { identifier, resetToken, newPassword } = req.body;

    if (!identifier || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    const user = await findAdminUser(identifier, true);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Account not found.',
      });
    }

    if (user.role !== 'admin' && user.role !== 'shopkeeper') {
      return res.status(403).json({
        success: false,
        error: 'Access restricted to administrator accounts.',
      });
    }

    // Verify reset token across keys
    const lookupKey = (user.email || user.mobileNumber || identifier).toString().toLowerCase();
    const storedReset = resetTokens.get(lookupKey) || resetTokens.get(identifier.toString().toLowerCase());

    if (!storedReset || storedReset.token !== resetToken) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token. Please restart password reset.',
      });
    }

    if (new Date() > storedReset.expiresAt) {
      if (storedReset.keys) {
        storedReset.keys.forEach((k) => resetTokens.delete(k));
      }
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired. Please request a new OTP.',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save(); // pre-save hook hashes password

    // Consume all reset tokens for this user
    if (storedReset.keys) {
      storedReset.keys.forEach((k) => resetTokens.delete(k));
    } else {
      resetTokens.delete(lookupKey);
    }

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now sign in with your new password.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Server error: ${err.message}`,
    });
  }
}

module.exports = {
  loginAdmin,
  getMe,
  forgotPasswordRequest,
  forgotPasswordVerify,
  forgotPasswordReset,
};
