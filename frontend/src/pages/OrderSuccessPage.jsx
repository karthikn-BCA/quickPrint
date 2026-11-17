import React, { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Printer, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Fire celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce border border-emerald-200 dark:border-emerald-800/40">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
        Payment Verified & Dispatched
      </span>

      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-4">
        Print Order Confirmed!
      </h1>
      <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 max-w-md mx-auto">
        Your document has entered the automatic campus print queue. Our Windows Print Agent is processing your order.
      </p>

      {/* Order ID Box */}
      <div className="mt-8 p-6 bg-white dark:bg-dark-card rounded-2xl border-2 border-brand-300 dark:border-brand-700/60 shadow-sm max-w-sm mx-auto">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
          Your Unique Order ID
        </span>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-2xl font-black text-brand-600 dark:text-brand-400 tracking-wide font-mono">
            {orderId}
          </span>
          <button
            onClick={copyOrderId}
            className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-dark-surface rounded-lg transition-colors"
            title="Copy Order ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={`/track?orderId=${orderId}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white font-black text-sm shadow-md shadow-brand-500/20 transition-all transform hover:-translate-y-0.5"
        >
          <span>Track Live Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/upload"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-dark-card hover:bg-slate-200 dark:hover:bg-dark-surface text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-dark-border transition-colors"
        >
          <span>Print Another Document</span>
        </Link>
      </div>
    </div>
  );
}
