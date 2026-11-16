import React from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PriceSummaryCard({
  itemCount,
  totalSheets,
  grandTotal,
  isLoading,
  actionButton,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm sticky top-24">
      <h3 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center justify-between">
        <span>Order Summary</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
          {itemCount} {itemCount === 1 ? 'Doc' : 'Docs'}
        </span>
      </h3>

      <div className="py-4 space-y-3 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Total Documents</span>
          <span className="font-semibold text-slate-800">{itemCount}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Total Physical Sheets</span>
          <span className="font-semibold text-slate-800">
            {isLoading ? 'Calculating...' : `${totalSheets} Sheets`}
          </span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Est. Pickup Time</span>
          <span className="font-semibold text-emerald-600">~15 Mins</span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="text-base font-bold text-slate-900 block">Total Payable</span>
            <span className="text-[11px] text-slate-400">Inclusive of college Xerox rates</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-indigo-600">
              ₹{isLoading ? '...' : grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-4">
        {actionButton || (
          <Link
            to="/checkout"
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all ${
              itemCount > 0 && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'
                : 'bg-slate-300 cursor-not-allowed pointer-events-none'
            }`}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Safe Guarantee Badges */}
      <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Automatic Print Spooler upon payment</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Encrypted payment verified server-side</span>
        </div>
      </div>
    </div>
  );
}
