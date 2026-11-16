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
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
        Payment Verified & Dispatched
      </span>

      <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-4">
        Print Order Confirmed!
      </h1>
      <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
        Your document has entered the automatic campus print queue. Our Windows Print Agent is processing your order.
      </p>

      {/* Order ID Box */}
      <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-indigo-200 shadow-sm max-w-sm mx-auto">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Your Unique Order ID
        </span>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-2xl font-black text-indigo-700 tracking-wide font-mono">
            {orderId}
          </span>
          <button
            onClick={copyOrderId}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Copy Order ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={`/track?orderId=${orderId}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all"
        >
          <span>Track Live Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/upload"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
        >
          <span>Print Another Document</span>
        </Link>
      </div>
    </div>
  );
}
