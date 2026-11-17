import React, { useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, ArrowRight, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const isSimulated = location.state?.isSimulated;

  useEffect(() => {
    // Fire festive celebratory confetti on payment success!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#30525C', '#DCAA89', '#C35627', '#4C848D', '#7B9669'],
    });
  }, []);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    alert('Order ID copied to clipboard: ' + orderId);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success Badge */}
      <div className="w-20 h-20 rounded-full bg-cp-surface-alt text-aquamarine dark:text-sage-pale flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce border border-cp-border">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <span className="text-xs font-black text-aquamarine dark:text-sage-pale tracking-wider uppercase bg-cp-surface-alt px-3.5 py-1.5 rounded-full border border-cp-border">
        Payment Verified & Order Placed
      </span>

      <h1 className="text-3xl font-black text-cp-text tracking-tight mt-4">
        Your Print Order is Confirmed!
      </h1>
      <p className="text-cp-text-secondary text-sm mt-2 max-w-md mx-auto">
        Your documents have been dispatched to the SAC campus printer spooler.
      </p>

      {/* Order ID Card */}
      <div className="mt-8 p-6 rounded-2xl bg-cp-surface border border-cp-border shadow-card max-w-md mx-auto">
        <span className="text-xs font-bold text-cp-text-muted uppercase tracking-wider block">
          Unique Order ID
        </span>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-2xl font-black text-aquamarine dark:text-sage-pale tracking-wide font-mono">
            {orderId}
          </span>
          <button
            onClick={copyOrderId}
            className="p-1.5 text-cp-text-secondary hover:text-cp-text hover:bg-cp-surface-alt rounded-lg transition-colors"
            title="Copy Order ID"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-cp-text-secondary mt-2">
          Keep this ID handy to collect your sheets at the SAC counter.
        </p>

        {isSimulated && (
          <div className="mt-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
            ⚡ Simulated Test Mode Payment (Razorpay sandbox simulated)
          </div>
        )}
      </div>

      {/* Details Box */}
      <div className="mt-6 max-w-md mx-auto grid grid-cols-2 gap-4 text-left">
        <div className="p-4 rounded-xl bg-cp-surface border border-cp-border">
          <div className="flex items-center gap-2 text-xs font-bold text-cp-text-secondary mb-1">
            <Clock className="w-4 h-4 text-aquamarine dark:text-sage" />
            <span>Ready In</span>
          </div>
          <span className="text-sm font-black text-cp-text">~10 to 15 Mins</span>
        </div>

        <div className="p-4 rounded-xl bg-cp-surface border border-cp-border">
          <div className="flex items-center gap-2 text-xs font-bold text-cp-text-secondary mb-1">
            <MapPin className="w-4 h-4 text-aquamarine dark:text-sage" />
            <span>Pickup Point</span>
          </div>
          <span className="text-sm font-black text-cp-text">SAC Ground Floor</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={`/track?id=${orderId}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-aquamarine hover:bg-aquamarine-hover dark:bg-sage dark:hover:bg-sage-hover text-white font-black text-sm shadow-md transition-all transform hover:-translate-y-0.5"
        >
          <span>Track Live Progress</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-cp-surface hover:bg-cp-surface-alt border border-cp-border text-cp-text font-bold text-sm shadow-sm transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
