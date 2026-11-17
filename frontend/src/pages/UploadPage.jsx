import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, PlusCircle, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import DocumentUploadZone from '../components/DocumentUploadZone';
import DocumentConfigCard from '../components/DocumentConfigCard';
import PriceSummaryCard from '../components/PriceSummaryCard';

export default function UploadPage() {
  const { items, addDocuments, updateItemConfig, removeItem, pricingEstimate, loadingEstimate, itemCount } = useCart();

  const handleUploadSuccess = (newDocs) => {
    addDocuments(newDocs);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-black text-brand-600 dark:text-brand-400 tracking-wider uppercase">
          Step 1 of 3: Upload & Configure
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Upload Documents for Printing
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Upload PDF assignments or image files, configure color and duplex preferences, then proceed to checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Upload Zone & Document List */}
        <div className="lg:col-span-2 space-y-6">
          <DocumentUploadZone onUploadSuccess={handleUploadSuccess} />

          {/* Configured Documents */}
          {items.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Uploaded Documents</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800/50">
                    {items.length}
                  </span>
                </h2>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Configure preferences for each file below
                </span>
              </div>

              <div className="space-y-4">
                {items.map((item, idx) => {
                  const calculatedData = pricingEstimate?.items?.find(
                    (calc) => calc.documentId === item.id
                  );
                  return (
                    <DocumentConfigCard
                      key={item.id || idx}
                      item={item}
                      calculatedData={calculatedData}
                      onUpdate={updateItemConfig}
                      onRemove={removeItem}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Price Summary & Checkout Action */}
        <div className="lg:col-span-1">
          <PriceSummaryCard
            itemCount={itemCount}
            totalSheets={pricingEstimate.totalPhysicalSheets}
            grandTotal={pricingEstimate.grandTotal}
            isLoading={loadingEstimate}
          />
        </div>
      </div>
    </div>
  );
}
