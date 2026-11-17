import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.error || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-cp-surface rounded-3xl border border-cp-border p-8 shadow-card transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-cp-surface-alt text-cp-primary flex items-center justify-center mx-auto mb-6 shadow-inner border border-cp-border">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-black text-center text-cp-text tracking-tight">
          Shopkeeper Portal
        </h1>
        <p className="text-xs text-center text-cp-text-secondary mt-1 font-medium">
          CampusPrint Xerox Administration & Print Spooler Control
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-bold text-cp-text mb-1">
              Email or Mobile Number
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-cp-primary" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-cp-primary"
                placeholder="Enter admin email or mobile"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cp-text mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-cp-primary" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-cp-primary"
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-cp-primary hover:bg-cp-primary-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Sign In as Administrator'}
          </button>
        </form>
      </div>
    </div>
  );
}
