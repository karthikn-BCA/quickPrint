import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';

const STEPS = {
  REQUEST: 'request',
  VERIFY: 'verify',
  RESET: 'reset',
  SUCCESS: 'success',
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.REQUEST);
  const [identifier, setIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef([]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ─── Step 1: Request OTP ───────────────────────────────────
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your registered email or mobile number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.forgotPasswordRequest(identifier.trim());
      if (res.success) {
        setMaskedEmail(res.email || '');
        setExpiresIn(res.expiresInMinutes || 10);
        setResendCooldown(45);
        setStep(STEPS.VERIFY);
        setSuccessMsg(res.message);
        setEmailPreviewUrl(res.emailPreviewUrl || '');
      } else {
        setError(res.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ───────────────────────────────────
  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.forgotPasswordVerify(identifier.trim(), otpString);
      if (res.success) {
        setResetToken(res.resetToken);
        setStep(STEPS.RESET);
        setSuccessMsg('OTP verified successfully! You can now set your new password.');
      } else {
        setError(res.error || 'Incorrect OTP.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Reset Password ───────────────────────────────
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.forgotPasswordReset(identifier.trim(), resetToken, newPassword);
      if (res.success) {
        setStep(STEPS.SUCCESS);
        setSuccessMsg(res.message);
      } else {
        setError(res.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Input Handlers ───────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newOtp.every((d) => d !== '')) {
      setTimeout(() => handleVerifyOTP(), 200);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pasted.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  };

  // ─── Password strength indicator ──────────────────────────
  const getPasswordStrength = () => {
    if (!newPassword) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 10) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', width: '20%' };
    if (score <= 2) return { label: 'Fair', color: 'bg-amber-500', width: '40%' };
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: '60%' };
    if (score <= 4) return { label: 'Strong', color: 'bg-lime-500', width: '80%' };
    return { label: 'Very Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getPasswordStrength();

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-cp-surface rounded-3xl border border-cp-border p-8 shadow-card transition-colors">

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-cp-surface-alt text-sage dark:text-copper flex items-center justify-center mx-auto mb-6 shadow-inner border border-cp-border">
          {step === STEPS.SUCCESS ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          ) : step === STEPS.VERIFY ? (
            <KeyRound className="w-7 h-7" />
          ) : step === STEPS.RESET ? (
            <Lock className="w-7 h-7" />
          ) : (
            <ShieldCheck className="w-7 h-7" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-center text-cp-text tracking-tight">
          {step === STEPS.SUCCESS
            ? 'Password Reset Complete'
            : step === STEPS.RESET
            ? 'Set New Password'
            : step === STEPS.VERIFY
            ? 'Verify OTP'
            : 'Forgot Password'}
        </h1>
        <p className="text-xs text-center text-cp-text-secondary mt-1 font-medium">
          {step === STEPS.SUCCESS
            ? 'Your password has been updated successfully.'
            : step === STEPS.RESET
            ? 'Choose a strong password for your admin account.'
            : step === STEPS.VERIFY
            ? `Enter the 6-digit OTP sent to ${maskedEmail}`
            : 'Enter your registered email or mobile to receive a reset OTP.'}
        </p>

        {/* Step Indicator */}
        {step !== STEPS.SUCCESS && (
          <div className="flex items-center justify-center gap-2 mt-5">
            {['request', 'verify', 'reset'].map((s, idx) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    step === s
                      ? 'bg-sage dark:bg-aquamarine text-white shadow-md'
                      : ['request', 'verify', 'reset'].indexOf(step) > idx
                      ? 'bg-sage/20 dark:bg-aquamarine/20 text-sage dark:text-aquamarine'
                      : 'bg-cp-surface-alt text-cp-text-muted border border-cp-border'
                  }`}
                >
                  {['request', 'verify', 'reset'].indexOf(step) > idx ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 2 && (
                  <div
                    className={`w-8 h-0.5 rounded-full transition-colors ${
                      ['request', 'verify', 'reset'].indexOf(step) > idx
                        ? 'bg-sage dark:bg-aquamarine'
                        : 'bg-cp-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Success Message */}
        {successMsg && step !== STEPS.REQUEST && (
          <div className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Live Ethereal Mailbox Access Link (when testing without personal Gmail credentials) */}
        {emailPreviewUrl && step === STEPS.VERIFY && (
          <div className="mt-4 p-3.5 rounded-2xl bg-sage/10 dark:bg-aquamarine/10 border border-sage/30 dark:border-aquamarine/30 text-xs animate-fade-in">
            <div className="flex items-center gap-1.5 font-bold text-cp-text">
              <Mail className="w-4 h-4 text-sage dark:text-copper shrink-0" />
              <span>Real Email Sent via Test Mailbox</span>
            </div>
            <p className="text-[11px] text-cp-text-secondary mt-1">
              A real email containing your 6-digit OTP code was delivered. Open the message to view it:
            </p>
            <a
              href={emailPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white text-[11px] font-bold shadow-sm transition-all"
            >
              <span>Open Delivered Email in Web Mailbox</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── STEP 1: Request OTP ─── */}
        {step === STEPS.REQUEST && (
          <form onSubmit={handleRequestOTP} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-cp-text mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-sage dark:text-copper" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine"
                  placeholder="admin@campusprint.edu or 9876543210"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send OTP
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                to="/admin/login"
                className="text-xs font-bold text-sage dark:text-copper hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* ─── STEP 2: Verify OTP ─── */}
        {step === STEPS.VERIFY && (
          <form onSubmit={handleVerifyOTP} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-cp-text mb-3 text-center">
                Enter 6-Digit OTP
              </label>
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-mono font-bold rounded-xl border border-cp-border bg-cp-surface text-cp-text focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine focus:border-sage dark:focus:border-aquamarine transition-all"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Verify OTP
                </>
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center space-y-2">
              {resendCooldown > 0 ? (
                <p className="text-xs text-cp-text-muted">
                  Resend OTP in{' '}
                  <span className="font-bold text-sage dark:text-copper font-mono">
                    {resendCooldown}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={loading}
                  className="text-xs font-bold text-sage dark:text-copper hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend OTP
                </button>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(STEPS.REQUEST);
                    setOtp(['', '', '', '', '', '']);
                    setError('');
                    setSuccessMsg('');
                    setEmailPreviewUrl('');
                  }}
                  className="text-xs font-bold text-cp-text-muted hover:text-cp-text hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Change email/mobile
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ─── STEP 3: Reset Password ─── */}
        {step === STEPS.RESET && (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-cp-text mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-sage dark:text-copper" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine"
                  placeholder="Minimum 6 characters"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-cp-text-muted hover:text-cp-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Bar */}
              {newPassword && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-cp-surface-alt rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-[10px] font-bold mt-1 ${strength.color.replace('bg-', 'text-')}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-cp-text mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-sage dark:text-copper" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-rose-400'
                      : confirmPassword && confirmPassword === newPassword
                      ? 'border-emerald-400'
                      : 'border-cp-border'
                  }`}
                  placeholder="Re-enter new password"
                />
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[10px] text-rose-500 font-bold mt-1">Passwords don't match</p>
              )}
              {confirmPassword && confirmPassword === newPassword && (
                <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                newPassword.length < 6 ||
                newPassword !== confirmPassword
              }
              className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── STEP 4: Success ─── */}
        {step === STEPS.SUCCESS && (
          <div className="mt-8 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-sm text-cp-text font-medium">{successMsg}</p>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
