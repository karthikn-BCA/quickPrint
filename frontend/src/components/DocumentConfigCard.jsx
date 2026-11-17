import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Trash2, Eye, Copy, Layers, Palette, Sliders } from 'lucide-react';
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
    <div className="bg-cp-surface rounded-2xl border border-cp-border p-5 shadow-soft hover:shadow-card transition-all">
      {/* File Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-cp-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isPdf
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              : 'bg-cp-surface-alt text-sage dark:text-copper border border-cp-border'
          }`}>
            {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-cp-text truncate" title={item.originalName}>
              {item.originalName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-cp-text-secondary mt-0.5">
              <span>{formatFileSize(item.sizeBytes)}</span>
              <span>•</span>
              <span className="font-bold text-cp-text">
                {item.pageCount} {item.pageCount === 1 ? 'Page' : 'Pages'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="p-2 text-cp-text-secondary hover:text-cp-text hover:bg-cp-surface-alt rounded-lg transition-colors"
            title="Preview Document"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 text-cp-text-secondary hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
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
          <label className="block text-xs font-bold text-cp-text mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-sage dark:text-copper" />
            Color Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-cp-surface-alt rounded-xl border border-cp-border">
            <button
              type="button"
              onClick={() => onUpdate(item.id, { printType: 'BW' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                item.printType === 'BW'
                  ? 'bg-sage dark:bg-aquamarine text-white shadow-sm'
                  : 'text-cp-text-secondary hover:text-cp-text'
              }`}
            >
              B & W
            </button>
            <button
              type="button"
              onClick={() => onUpdate(item.id, { printType: 'COLOUR' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                item.printType === 'COLOUR'
                  ? 'bg-sage dark:bg-aquamarine text-white shadow-sm'
                  : 'text-cp-text-secondary hover:text-cp-text'
              }`}
            >
              Colour
            </button>
          </div>
        </div>

        {/* 2. Print Sides */}
        <div>
          <label className="block text-xs font-bold text-cp-text mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sage dark:text-copper" />
            Printing Sides
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-cp-surface-alt rounded-xl border border-cp-border">
            <button
              type="button"
              onClick={() => onUpdate(item.id, { printSides: 'SINGLE' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                item.printSides === 'SINGLE'
                  ? 'bg-sage dark:bg-aquamarine text-white shadow-sm'
                  : 'text-cp-text-secondary hover:text-cp-text'
              }`}
            >
              Single-sided
            </button>
            <button
              type="button"
              onClick={() => onUpdate(item.id, { printSides: 'DOUBLE' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                item.printSides === 'DOUBLE'
                  ? 'bg-sage dark:bg-aquamarine text-white shadow-sm'
                  : 'text-cp-text-secondary hover:text-cp-text'
              }`}
            >
              Double-sided
            </button>
          </div>
        </div>

        {/* 3. Number of Copies */}
        <div>
          <label className="block text-xs font-bold text-cp-text mb-1.5 flex items-center gap-1.5">
            <Copy className="w-3.5 h-3.5 text-sage dark:text-copper" />
            Copies
          </label>
          <div className="flex items-center border border-cp-border rounded-xl overflow-hidden bg-cp-surface-alt">
            <button
              type="button"
              onClick={() => onUpdate(item.id, { copies: Math.max(1, item.copies - 1) })}
              className="px-3 py-1.5 text-cp-text hover:bg-cp-border text-sm font-bold"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="100"
              value={item.copies}
              onChange={(e) => onUpdate(item.id, { copies: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full text-center bg-transparent text-sm font-black text-cp-text focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onUpdate(item.id, { copies: Math.min(100, item.copies + 1) })}
              className="px-3 py-1.5 text-cp-text hover:bg-cp-border text-sm font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. Page Selection */}
        <div>
          <label className="block text-xs font-bold text-cp-text mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sage dark:text-copper" />
            Page Range
          </label>
          <select
            value={item.pageSelection}
            onChange={(e) => onUpdate(item.id, { pageSelection: e.target.value })}
            className="w-full bg-cp-surface-alt border border-cp-border rounded-xl text-xs font-bold text-cp-text py-2 px-2.5 focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine"
          >
            <option value="ALL">All Pages (1 - {item.pageCount})</option>
            <option value="CUSTOM">Custom Range...</option>
          </select>
        </div>
      </div>

      {/* Custom Page Range Input (Visible only if CUSTOM) */}
      {item.pageSelection === 'CUSTOM' && (
        <div className="mt-3 p-3 bg-cp-surface-alt rounded-xl border border-cp-border flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-xs font-bold text-cp-text shrink-0">
            Specify Pages:
          </label>
          <input
            type="text"
            placeholder="e.g. 1-5, 8, 10-12"
            value={item.customPages || ''}
            onChange={(e) => onUpdate(item.id, { customPages: e.target.value })}
            className="flex-1 text-xs bg-cp-surface border border-cp-border rounded-lg px-2.5 py-1.5 text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine font-mono"
          />
          <span className="text-[11px] text-cp-text-secondary font-bold">
            Max page: {item.pageCount}
          </span>
        </div>
      )}

      {/* Calculated Breakdown Badge */}
      <div className="mt-4 pt-3 border-t border-cp-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-cp-text-secondary font-medium">
          <span>A4 • {item.orientation === 'LANDSCAPE' ? 'Landscape' : 'Portrait'}</span>
          <span>•</span>
          <span className="font-bold text-cp-text">
            {calculatedData?.physicalSheets ?? (item.pageCount * item.copies)} Physical {calculatedData?.physicalSheets === 1 ? 'Sheet' : 'Sheets'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-cp-text-secondary mr-1.5 font-bold">Subtotal:</span>
          <span className="text-base font-black text-sage dark:text-copper">
            ₹{calculatedData?.itemTotal ? calculatedData.itemTotal.toFixed(2) : '--'}
          </span>
        </div>
      </div>

      {/* Modal Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cp-surface rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-cp-border">
            <div className="px-5 py-4 border-b border-cp-border flex items-center justify-between bg-cp-surface-alt">
              <h3 className="font-bold text-cp-text text-sm truncate">{item.originalName}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-cp-text-secondary hover:text-cp-text p-1"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-cp-bg">
              {isPdf ? (
                <iframe
                  src={api.getDocumentPreviewUrl(item.id)}
                  className="w-full h-[65vh] border border-cp-border rounded-lg shadow-inner bg-cp-surface"
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
