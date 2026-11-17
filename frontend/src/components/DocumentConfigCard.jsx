import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Trash2, Eye, Copy, Layers, Palette, Sliders, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function DocumentConfigCard({ item, calculatedData, onUpdate, onRemove }) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isPdf = item.fileExtension === '.pdf';

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200/90 dark:border-dark-border p-5 shadow-sm hover:shadow-md transition-all">
      {/* File Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isPdf
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
          }`}>
            {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate" title={item.originalName}>
              {item.originalName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{formatFileSize(item.sizeBytes)}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {item.pageCount} {item.pageCount === 1 ? 'Page' : 'Pages'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-dark-surface rounded-lg transition-colors"
            title="Preview Document"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            title="Remove Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {/* 1. Print Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-brand-500" />
            Color Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-dark-surface rounded-xl border border-slate-200/60 dark:border-dark-border">
            <button
              type="button"
              onClick={() => onUpdate(item.id, { printType: 'BW' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                item.printType === 'BW'
                  ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              B & W
            </button>
            <button
              type="button"
              onClick={() => onUpdate(item.id, { printType: 'COLOUR' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                item.printType === 'COLOUR'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Colour
            </button>
          </div>
        </div>

        {/* 2. Print Sides */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-500" />
            Printing Sides
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-dark-surface rounded-xl border border-slate-200/60 dark:border-dark-border">
            <button
              type="button"
              onClick={() => onUpdate(item.id, { printSides: 'SINGLE' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                item.printSides === 'SINGLE'
                  ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Single-sided
            </button>
            <button
              type="button"
              onClick={() => onUpdate(item.id, { printSides: 'DOUBLE' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                item.printSides === 'DOUBLE'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Double-sided
            </button>
          </div>
        </div>

        {/* 3. Number of Copies */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Copy className="w-3.5 h-3.5 text-brand-500" />
            Copies
          </label>
          <div className="flex items-center border border-slate-200 dark:border-dark-border rounded-xl overflow-hidden bg-slate-50 dark:bg-dark-surface">
            <button
              type="button"
              onClick={() => onUpdate(item.id, { copies: Math.max(1, item.copies - 1) })}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-card text-sm font-bold"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="100"
              value={item.copies}
              onChange={(e) => onUpdate(item.id, { copies: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full text-center bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onUpdate(item.id, { copies: Math.min(100, item.copies + 1) })}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-card text-sm font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. Page Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-brand-500" />
            Page Range
          </label>
          <select
            value={item.pageSelection}
            onChange={(e) => onUpdate(item.id, { pageSelection: e.target.value })}
            className="w-full bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 py-2 px-2.5 focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Pages (1 - {item.pageCount})</option>
            <option value="CUSTOM">Custom Range...</option>
          </select>
        </div>
      </div>

      {/* Custom Page Range Input (Visible only if CUSTOM) */}
      {item.pageSelection === 'CUSTOM' && (
        <div className="mt-3 p-3 bg-brand-50/50 dark:bg-brand-950/30 rounded-xl border border-brand-200 dark:border-brand-900/40 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-xs font-bold text-brand-900 dark:text-brand-300 shrink-0">
            Specify Pages:
          </label>
          <input
            type="text"
            placeholder="e.g. 1-5, 8, 10-12"
            value={item.customPages || ''}
            onChange={(e) => onUpdate(item.id, { customPages: e.target.value })}
            className="flex-1 text-xs bg-white dark:bg-dark-surface border border-brand-300 dark:border-dark-border rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
          />
          <span className="text-[11px] text-brand-700 dark:text-brand-400 font-semibold">
            Max page: {item.pageCount}
          </span>
        </div>
      )}

      {/* Calculated Breakdown Badge */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <span>A4 • {item.orientation === 'LANDSCAPE' ? 'Landscape' : 'Portrait'}</span>
          <span>•</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {calculatedData?.physicalSheets ?? (item.pageCount * item.copies)} Physical {calculatedData?.physicalSheets === 1 ? 'Sheet' : 'Sheets'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-slate-400 mr-1.5 font-medium">Subtotal:</span>
          <span className="text-base font-black text-brand-600 dark:text-brand-400">
            ₹{calculatedData?.itemTotal ? calculatedData.itemTotal.toFixed(2) : '--'}
          </span>
        </div>
      </div>

      {/* Modal Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up border border-slate-200 dark:border-dark-border">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50 dark:bg-dark-surface">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{item.originalName}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-dark-bg">
              {isPdf ? (
                <iframe
                  src={api.getDocumentPreviewUrl(item.id)}
                  className="w-full h-[65vh] border rounded-lg shadow-inner bg-white dark:bg-dark-surface"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={api.getDocumentPreviewUrl(item.id)}
                  alt="Document Preview"
                  className="max-h-[65vh] object-contain rounded-lg shadow"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
