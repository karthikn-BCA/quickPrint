import React, { useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Printer, ArrowRight, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const order = location.state?.order;
  const isSimulated = location.state?.isSimulated;

  useEffect(() => {
    // Fire festive celebratory confetti on payment success!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#596B5D', '#A3B09F', '#E3E8E0', '#303830'],
    });
  }, []);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    alert('Order ID copied to clipboard: ' + orderId);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success Badge */}
      <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-500 dark:text-brand-300 flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce border border-brand-200 dark:border-brand-800/40">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <span className="text-xs font-black text-brand-700 dark:text-brand-300 tracking-wider uppercase bg-brand-50 dark:bg-brand-950/40 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-800/40">
        Payment Verified & Order Placed
      </span>

      <h1 className="text-3xl font-black text-charcoal dark:text-white tracking-tight mt-4">
        Your Print Order is Confirmed!
      </h1>
      <p className="text-charcoal-muted dark:text-dark-muted text-sm mt-2 max-w-md mx-auto">
        Your documents have been dispatched to the SAC campus printer spooler.
      </p>

      {/* Order ID Card */}
      <div className="mt-8 p-6 rounded-2xl bg-white dark:bg-dark-card border border-brand-100 dark:border-dark-border shadow-card max-w-md mx-auto">
        <span className="text-xs font-bold text-charcoal-light dark:text-dark-subtle uppercase tracking-wider block">
          Unique Order ID
        </span>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-2xl font-black text-brand-600 dark:text-brand-300 tracking-wide font-mono">
            {orderId}
          </span>
          <button
            onClick={copyOrderId}
            className="p-1.5 text-charcoal-light hover:text-charcoal dark:text-dark-muted dark:hover:text-white hover:bg-brand-50 dark:hover:bg-dark-surface rounded-lg transition-colors"
            title="Copy Order ID"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-charcoal-muted dark:text-dark-muted mt-2">
          Keep this ID handy to collect your sheets at the SAC counter.
        </p>

        {isSimulated && (
          <div className="mt-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs">
            ⚡ Simulated Test Mode Payment (Razorpay sandbox simulated)
          </div>
        )}
      </div>

      {/* Details Box */}
      <div className="mt-6 max-w-md mx-auto grid grid-cols-2 gap-4 text-left">
        <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-brand-100 dark:border-dark-border">
          <div className="flex items-center gap-2 text-xs font-bold text-charcoal-muted dark:text-dark-muted mb-1">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>Ready In</span>
          </div>
          <span className="text-sm font-black text-charcoal dark:text-white">~10 to 15 Mins</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-brand-100 dark:border-dark-border">
          <div className="flex items-center gap-2 text-xs font-bold text-charcoal-muted dark:text-dark-muted mb-1">
            <MapPin className="w-4 h-4 text-brand-500" />
            <span>Pickup Point</span>
          </div>
          <span className="text-sm font-black text-charcoal dark:text-white">SAC Ground Floor</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={`/track?id=${orderId}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-sm shadow-md shadow-brand-500/20 transition-all transform hover:-translate-y-0.5"
        >
          <span>Track Live Progress</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white dark:bg-dark-card hover:bg-brand-50 dark:hover:bg-dark-surface border border-brand-200 dark:border-dark-border text-charcoal dark:text-white font-bold text-sm shadow-sm transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
