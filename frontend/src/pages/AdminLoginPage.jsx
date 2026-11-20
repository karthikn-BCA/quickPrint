import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  Loader2,
  KeyRound,
  Mail,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const FP_STEPS = {
  REQUEST: 'request',
  VERIFY: 'verify',
  RESET: 'reset',
  SUCCESS: 'success',
};

export default function AdminLoginPage({ defaultMode }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  // Mode: 'login' | 'forgot'
  const initialMode = defaultMode === 'forgot' || searchParams.get('mode') === 'forgot' ? 'forgot' : 'login';
  const [activeTab, setActiveTab] = useState(initialMode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Forgot password flow state
  const [fpStep, setFpStep] = useState(FP_STEPS.REQUEST);
  const [fpIdentifier, setFpIdentifier] = useState('');
  const [fpMaskedEmail, setFpMaskedEmail] = useState('');
  const [fpMaskedMobile, setFpMaskedMobile] = useState('');
  const [fpOtp, setFpOtp] = useState(['', '', '', '', '', '']);
  const [fpResetToken, setFpResetToken] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpShowPassword, setFpShowPassword] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccessMsg, setFpSuccessMsg] = useState('');
  const [fpDevOtp, setFpDevOtp] = useState('');
  const [fpResendCooldown, setFpResendCooldown] = useState(0);

  const otpRefs = useRef([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Sync mode with URL if needed
  useEffect(() => {
    if (searchParams.get('mode') === 'forgot' && activeTab !== 'forgot') {
      setActiveTab('forgot');
    }
  }, [searchParams]);

  // Resend OTP cooldown timer
  useEffect(() => {
    if (fpResendCooldown <= 0) return;
    const timer = setInterval(() => {
      setFpResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [fpResendCooldown]);

  // Switch tabs
  const handleSwitchTab = (tab) => {
    setActiveTab(tab);
    setLoginError('');
    setFpError('');
    if (tab === 'forgot' && loginIdentifier && !fpIdentifier) {
      setFpIdentifier(loginIdentifier);
    }
  };

  // ─── LOGIN HANDLER ──────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await login(loginIdentifier.trim(), loginPassword);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setLoginError(res.error || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── FORGOT PASSWORD: STEP 1 (REQUEST OTP) ──────────────────
  const handleFpRequestOTP = async (e) => {
    if (e) e.preventDefault();
    const cleanId = fpIdentifier.trim();
    if (!cleanId) {
      setFpError('Please enter your registered email or phone number.');
      return;
    }

    setFpLoading(true);
    setFpError('');
    setFpDevOtp('');

    try {
      const res = await api.forgotPasswordRequest(cleanId);
      if (res.success) {
        setFpMaskedEmail(res.email || '');
        setFpMaskedMobile(res.mobile || '');
        setFpResendCooldown(60);
        setFpStep(FP_STEPS.VERIFY);
        setFpSuccessMsg(res.message);
        if (res.devOtp) {
          setFpDevOtp(res.devOtp);
        }
      } else {
        setFpError(res.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setFpError(err.message || 'Network error.');
    } finally {
      setFpLoading(false);
    }
  };

  // ─── FORGOT PASSWORD: STEP 2 (VERIFY OTP) ───────────────────
  const handleFpVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    const otpString = fpOtp.join('');
    if (otpString.length !== 6) {
      setFpError('Please enter the complete 6-digit OTP.');
      return;
    }

    setFpLoading(true);
    setFpError('');

    try {
      const res = await api.forgotPasswordVerify(fpIdentifier.trim(), otpString);
      if (res.success) {
        setFpResetToken(res.resetToken);
        setFpStep(FP_STEPS.RESET);
        setFpSuccessMsg('OTP verified! Enter your new password below.');
        setFpDevOtp('');
      } else {
        setFpError(res.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setFpError(err.message || 'Network error.');
    } finally {
      setFpLoading(false);
    }
  };

  // ─── FORGOT PASSWORD: STEP 3 (RESET PASSWORD) ───────────────
  const handleFpResetPassword = async (e) => {
    if (e) e.preventDefault();

    if (!fpNewPassword || fpNewPassword.length < 6) {
      setFpError('Password must be at least 6 characters long.');
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      setFpError('Passwords do not match.');
      return;
    }

    setFpLoading(true);
    setFpError('');

    try {
      const res = await api.forgotPasswordReset(fpIdentifier.trim(), fpResetToken, fpNewPassword);
      if (res.success) {
        setFpStep(FP_STEPS.SUCCESS);
        setFpSuccessMsg(res.message || 'Password reset successfully!');
      } else {
        setFpError(res.error || 'Failed to reset password.');
      }
    } catch (err) {
      setFpError(err.message || 'Network error.');
    } finally {
      setFpLoading(false);
    }
  };

  // ─── OTP DIGIT INPUT HELPERS ────────────────────────────────
  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...fpOtp];
    newOtp[index] = value.slice(-1);
    setFpOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    if (value && index === 5 && newOtp.every((d) => d !== '')) {
      setTimeout(() => handleFpVerifyOTP(), 150);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !fpOtp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...fpOtp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setFpOtp(newOtp);
      const focusIndex = Math.min(pasted.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  };

  const handleAutoFillDevOtp = () => {
    if (!fpDevOtp || fpDevOtp.length !== 6) return;
    const digits = fpDevOtp.split('');
    setFpOtp(digits);
    setTimeout(() => {
      otpRefs.current[5]?.focus();
    }, 100);
  };

  // ─── PASSWORD STRENGTH METER ────────────────────────────────
  const getStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-transparent', width: '0%' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', width: '25%' };
    if (score <= 2) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getStrength(fpNewPassword);

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-cp-surface rounded-3xl border border-cp-border p-6 sm:p-8 shadow-card transition-colors">
        
        {/* Top Header Badge */}
        <div className="w-14 h-14 rounded-2xl bg-cp-surface-alt text-sage dark:text-copper flex items-center justify-center mx-auto mb-5 shadow-inner border border-cp-border">
          {activeTab === 'forgot' ? (
            fpStep === FP_STEPS.SUCCESS ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            ) : (
              <KeyRound className="w-7 h-7" />
            )
          ) : (
            <ShieldCheck className="w-7 h-7" />
          )}
        </div>

        <h1 className="text-2xl font-black text-center text-cp-text tracking-tight">
          {activeTab === 'forgot' ? 'Admin Password Recovery' : 'Shopkeeper Portal'}
        </h1>
        <p className="text-xs text-center text-cp-text-secondary mt-1 font-medium">
          {activeTab === 'forgot'
            ? 'Reset your password securely via OTP sent to email or phone'
            : 'CampusPrint Xerox Administration & Print Spooler Control'}
        </p>

        {/* Tab Switcher: Sign In vs Forgot Password */}
        <div className="mt-6 p-1 bg-cp-surface-alt rounded-2xl border border-cp-border grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleSwitchTab('login')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-cp-surface text-cp-text shadow-sm border border-cp-border'
                : 'text-cp-text-muted hover:text-cp-text'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('forgot')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'forgot'
                ? 'bg-cp-surface text-cp-text shadow-sm border border-cp-border'
                : 'text-cp-text-muted hover:text-cp-text'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Forgot Password</span>
          </button>
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* TAB 1: LOGIN FORM                                         */}
        {/* ───────────────────────────────────────────────────────── */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-cp-text mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-sage dark:text-copper" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine"
                  placeholder="admin@campusprint.edu or 9876543210"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-cp-text">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => handleSwitchTab('forgot')}
                  className="text-xs font-bold text-sage dark:text-copper hover:underline transition-colors flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-sage dark:text-copper" />
                <input
                  type={loginShowPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setLoginShowPassword(!loginShowPassword)}
                  className="absolute right-3 top-2.5 text-cp-text-muted hover:text-cp-text"
                  tabIndex={-1}
                >
                  {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                'Sign In as Administrator'
              )}
            </button>

            {/* Bottom Forgot Password Prompt */}
            <div className="pt-3 border-t border-cp-border text-center">
              <button
                type="button"
                onClick={() => handleSwitchTab('forgot')}
                className="text-xs text-cp-text-secondary hover:text-cp-text inline-flex items-center gap-1.5 transition-colors font-medium"
              >
                <span>Forgot password or lost access?</span>
                <span className="font-bold text-sage dark:text-copper underline flex items-center gap-1">
                  Reset with OTP
                </span>
              </button>
            </div>
          </form>
        )}

        {/* ───────────────────────────────────────────────────────── */}
        {/* TAB 2: FORGOT PASSWORD FLOW (INLINE ON LOGIN PAGE)        */}
        {/* ───────────────────────────────────────────────────────── */}
        {activeTab === 'forgot' && (
          <div className="mt-6 space-y-4 animate-fade-in">
            {/* Step Breadcrumb Indicator */}
            {fpStep !== FP_STEPS.SUCCESS && (
              <div className="flex items-center justify-center gap-2 pb-2">
                {[
                  { id: FP_STEPS.REQUEST, num: 1, label: 'Identify' },
                  { id: FP_STEPS.VERIFY, num: 2, label: 'OTP' },
                  { id: FP_STEPS.RESET, num: 3, label: 'Password' },
                ].map((s, idx) => {
                  const stepIndex = [FP_STEPS.REQUEST, FP_STEPS.VERIFY, FP_STEPS.RESET].indexOf(fpStep);
                  const isPassed = stepIndex > idx;
                  const isCurrent = fpStep === s.id;

                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                          isCurrent
                            ? 'bg-sage dark:bg-aquamarine text-white shadow-sm'
                            : isPassed
                            ? 'bg-sage/20 dark:bg-aquamarine/20 text-sage dark:text-copper'
                            : 'bg-cp-surface-alt text-cp-text-muted border border-cp-border'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                      </div>
                      {idx < 2 && (
                        <div
                          className={`w-6 h-0.5 rounded-full ${
                            stepIndex > idx ? 'bg-sage dark:bg-aquamarine' : 'bg-cp-border'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error Message */}
            {fpError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fpError}</span>
              </div>
            )}

            {/* Success Message Banner */}
            {fpSuccessMsg && fpStep !== FP_STEPS.REQUEST && fpStep !== FP_STEPS.SUCCESS && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{fpSuccessMsg}</span>
              </div>
            )}

            {/* Development OTP Banner with 1-Click Auto Fill */}
            {fpDevOtp && fpStep === FP_STEPS.VERIFY && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Dev OTP Code:</span>
                    <span className="font-mono text-sm tracking-wider font-black ml-1 text-amber-900 dark:text-amber-200">
                      {fpDevOtp}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                    (Console simulated OTP mode)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDevOtp}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-bold text-[11px] transition-colors border border-amber-500/40"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* ─── STEP 1: REQUEST OTP ─── */}
            {fpStep === FP_STEPS.REQUEST && (
              <form onSubmit={handleFpRequestOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-cp-text mb-1">
                    Registered Email or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-sage dark:text-copper" />
                    <input
                      type="text"
                      required
                      value={fpIdentifier}
                      onChange={(e) => setFpIdentifier(e.target.value)}
                      className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine"
                      placeholder="admin@campusprint.edu or 9876543210"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-cp-text-secondary mt-1">
                    We will send a 6-digit verification OTP to your registered email and phone.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={fpLoading}
                  className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {fpLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Verification OTP</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('login')}
                    className="text-xs font-bold text-cp-text-secondary hover:text-cp-text inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {/* ─── STEP 2: VERIFY OTP ─── */}
            {fpStep === FP_STEPS.VERIFY && (
              <form onSubmit={handleFpVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-cp-text mb-2 text-center">
                    Enter the 6-Digit OTP Code
                  </label>
                  <p className="text-xs text-cp-text-secondary text-center mb-3">
                    Sent to{' '}
                    <strong className="text-cp-text font-mono">
                      {fpMaskedEmail || fpMaskedMobile || fpIdentifier}
                    </strong>
                  </p>

                  {/* 6 Digit Inputs */}
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {fpOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 sm:w-11 h-12 text-center text-lg font-mono font-bold rounded-xl border border-cp-border bg-cp-surface text-cp-text focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine transition-all"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={fpLoading || fpOtp.join('').length !== 6}
                  className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {fpLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Verify OTP</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFpStep(FP_STEPS.REQUEST);
                      setFpOtp(['', '', '', '', '', '']);
                      setFpError('');
                      setFpDevOtp('');
                    }}
                    className="text-cp-text-secondary hover:text-cp-text inline-flex items-center gap-1 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change details</span>
                  </button>

                  {fpResendCooldown > 0 ? (
                    <span className="text-cp-text-muted font-mono font-semibold">
                      Resend in {fpResendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFpRequestOTP}
                      disabled={fpLoading}
                      className="font-bold text-sage dark:text-copper hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* ─── STEP 3: RESET PASSWORD ─── */}
            {fpStep === FP_STEPS.RESET && (
              <form onSubmit={handleFpResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-cp-text mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-sage dark:text-copper" />
                    <input
                      type={fpShowPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={fpNewPassword}
                      onChange={(e) => setFpNewPassword(e.target.value)}
                      className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine"
                      placeholder="Minimum 6 characters"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setFpShowPassword(!fpShowPassword)}
                      className="absolute right-3 top-2.5 text-cp-text-muted hover:text-cp-text"
                      tabIndex={-1}
                    >
                      {fpShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength meter */}
                  {fpNewPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full bg-cp-surface-alt rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-cp-text-secondary">
                        Strength: {strength.label}
                      </span>
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
                      type={fpShowPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={fpConfirmPassword}
                      onChange={(e) => setFpConfirmPassword(e.target.value)}
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine ${
                        fpConfirmPassword && fpConfirmPassword !== fpNewPassword
                          ? 'border-rose-400'
                          : fpConfirmPassword && fpConfirmPassword === fpNewPassword
                          ? 'border-emerald-400'
                          : 'border-cp-border'
                      }`}
                      placeholder="Re-enter your new password"
                    />
                  </div>

                  {fpConfirmPassword && fpConfirmPassword !== fpNewPassword && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1">Passwords do not match.</p>
                  )}
                  {fpConfirmPassword && fpConfirmPassword === fpNewPassword && (
                    <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match!
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    fpLoading ||
                    fpNewPassword.length < 6 ||
                    fpNewPassword !== fpConfirmPassword
                  }
                  className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {fpLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Set New Password</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ─── STEP 4: SUCCESS ─── */}
            {fpStep === FP_STEPS.SUCCESS && (
              <div className="text-center space-y-4 py-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-cp-text">Password Reset Successful!</h3>
                  <p className="text-xs text-cp-text-secondary mt-1">
                    Your admin account password has been updated. You can now sign in using your new credentials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier(fpIdentifier);
                    setLoginPassword('');
                    setFpStep(FP_STEPS.REQUEST);
                    setFpOtp(['', '', '', '', '', '']);
                    setFpNewPassword('');
                    setFpConfirmPassword('');
                    setFpSuccessMsg('');
                    handleSwitchTab('login');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proceed to Sign In</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
