import React from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PriceSummaryCard({
  itemCount,
  totalSheets,
  grandTotal,
  isLoading,
  actionButton,
}) {
  return (
    <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 shadow-soft sticky top-24 transition-colors">
      <h3 className="text-base font-bold text-cp-text pb-4 border-b border-cp-border flex items-center justify-between">
        <span>Order Summary</span>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cp-surface-alt text-aquamarine dark:text-sage-pale border border-cp-border">
          {itemCount} {itemCount === 1 ? 'Doc' : 'Docs'}
        </span>
      </h3>

      <div className="py-4 space-y-3 text-sm">
        <div className="flex justify-between text-cp-text-secondary font-medium">
          <span>Total Documents</span>
          <span className="font-bold text-cp-text">{itemCount}</span>
        </div>
        <div className="flex justify-between text-cp-text-secondary font-medium">
          <span>Total Physical Sheets</span>
          <span className="font-bold text-cp-text">
            {isLoading ? 'Calculating...' : `${totalSheets} Sheets`}
          </span>
        </div>
        <div className="flex justify-between text-cp-text-secondary font-medium">
          <span>Est. Pickup Time</span>
          <span className="font-bold text-aquamarine dark:text-sage-pale">~15 Mins</span>
        </div>

        <div className="pt-3 border-t border-cp-border flex items-baseline justify-between">
          <div>
            <span className="text-base font-bold text-cp-text block">Total Payable</span>
            <span className="text-[11px] text-cp-text-muted font-medium">Inclusive of college Xerox rates</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-aquamarine dark:text-sage-pale">
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
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm shadow-md transition-all ${
              itemCount > 0 && !isLoading
                ? 'bg-aquamarine hover:bg-aquamarine-hover dark:bg-sage dark:hover:bg-sage-hover text-white transform hover:-translate-y-0.5'
                : 'bg-cp-surface-alt text-cp-text-muted border border-cp-border cursor-not-allowed pointer-events-none'
            }`}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        )}
      </div>

      {/* Safe Guarantee Badges */}
      <div className="mt-5 pt-4 border-t border-cp-border space-y-2 text-xs text-cp-text-secondary font-medium">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-aquamarine dark:text-sage shrink-0" />
          <span>Automatic Print Spooler upon payment</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-aquamarine dark:text-sage shrink-0" />
          <span>Encrypted payment verified server-side</span>
        </div>
      </div>
    </div>
  );
}
