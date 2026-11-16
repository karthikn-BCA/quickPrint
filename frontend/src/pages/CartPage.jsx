import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Plus, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import DocumentConfigCard from '../components/DocumentConfigCard';
import PriceSummaryCard from '../components/PriceSummaryCard';

export default function CartPage() {
  const { items, updateItemConfig, removeItem, clearCart, pricingEstimate, loadingEstimate, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
          You haven't uploaded any documents to print yet. Upload your PDF assignments or notes to get started.
        </p>
        <div className="mt-6">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Documents Now</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
            Review Order
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'Document' : 'Documents'})
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More Documents</span>
          </Link>
          <button
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Document Cards */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const calculatedData = pricingEstimate?.items?.find(
              (calc) => calc.documentId === item.id
            );
            return (
              <DocumentConfigCard
                key={item.id}
                item={item}
                calculatedData={calculatedData}
                onUpdate={updateItemConfig}
                onRemove={removeItem}
              />
            );
          })}
        </div>

        {/* Pricing Summary */}
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
