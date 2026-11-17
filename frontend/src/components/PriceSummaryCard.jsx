import React from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PriceSummaryCard({
  itemCount,
  totalSheets,
  grandTotal,
  isLoading,
  actionButton,
}) {
  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-brand-100 dark:border-dark-border p-6 shadow-sm sticky top-24 transition-colors">
      <h3 className="text-base font-bold text-charcoal dark:text-white pb-4 border-b border-brand-100 dark:border-dark-border flex items-center justify-between">
        <span>Order Summary</span>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/50">
          {itemCount} {itemCount === 1 ? 'Doc' : 'Docs'}
        </span>
      </h3>

      <div className="py-4 space-y-3 text-sm">
        <div className="flex justify-between text-charcoal-muted dark:text-dark-muted font-medium">
          <span>Total Documents</span>
          <span className="font-bold text-charcoal dark:text-white">{itemCount}</span>
        </div>
        <div className="flex justify-between text-charcoal-muted dark:text-dark-muted font-medium">
          <span>Total Physical Sheets</span>
          <span className="font-bold text-charcoal dark:text-white">
            {isLoading ? 'Calculating...' : `${totalSheets} Sheets`}
          </span>
        </div>
        <div className="flex justify-between text-charcoal-muted dark:text-dark-muted font-medium">
          <span>Est. Pickup Time</span>
          <span className="font-bold text-brand-600 dark:text-brand-300">~15 Mins</span>
        </div>

        <div className="pt-3 border-t border-brand-100 dark:border-dark-border flex items-baseline justify-between">
          <div>
            <span className="text-base font-bold text-charcoal dark:text-white block">Total Payable</span>
            <span className="text-[11px] text-charcoal-light dark:text-dark-subtle font-medium">Inclusive of college Xerox rates</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-brand-600 dark:text-brand-300">
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
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25 hover:shadow-brand-500/40 transform hover:-translate-y-0.5'
                : 'bg-brand-100 dark:bg-dark-surface text-charcoal-light dark:text-dark-subtle border border-brand-200 dark:border-dark-border cursor-not-allowed pointer-events-none'
            }`}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Safe Guarantee Badges */}
      <div className="mt-5 pt-4 border-t border-brand-100 dark:border-dark-border space-y-2 text-xs text-charcoal-muted dark:text-dark-muted font-medium">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          <span>Automatic Print Spooler upon payment</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          <span>Encrypted payment verified server-side</span>
        </div>
      </div>
    </div>
  );
}
