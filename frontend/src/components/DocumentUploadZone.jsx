import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { api } from '../services/api';

export default function DocumentUploadZone({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const maxSizeBytes = 25 * 1024 * 1024; // 25 MB

  const validateFiles = (files) => {
    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return `File "${file.name}" has an unsupported format. Only PDF, JPG, JPEG, and PNG are allowed.`;
      }
      if (file.size > maxSizeBytes) {
        return `File "${file.name}" exceeds the maximum 25 MB file size limit.`;
      }
    }
    return null;
  };

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage('');
    setSuccessMessage('');

    const filesArray = Array.from(fileList);
    const validationError = validateFiles(filesArray);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      filesArray.forEach((file) => {
        formData.append('documents', file);
      });

      const res = await api.uploadDocuments(formData);
      if (res.success && res.documents) {
        setSuccessMessage(`${res.documents.length} document(s) uploaded and verified!`);
        onUploadSuccess(res.documents);
      } else {
        setErrorMessage(res.error || 'Failed to upload documents.');
      }
    } catch (err) {
      setErrorMessage(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 scale-[1.01]'
            : 'border-brand-200 dark:border-dark-border hover:border-brand-500 dark:hover:border-brand-400 bg-white dark:bg-dark-card hover:bg-brand-50/40 dark:hover:bg-dark-surface shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 dark:text-brand-300 flex items-center justify-center shadow-inner border border-brand-200 dark:border-brand-800/40">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            ) : (
              <UploadCloud className="w-8 h-8 text-brand-500" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-charcoal dark:text-white">
              {isUploading ? 'Validating and Uploading Documents...' : 'Drag & Drop Your Files Here'}
            </h3>
            <p className="text-sm text-charcoal-muted dark:text-dark-muted mt-1 font-medium">
              or <span className="text-brand-500 dark:text-brand-300 font-bold underline underline-offset-2">browse files</span> from your phone or laptop
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-charcoal-muted dark:text-dark-muted">
            <span className="px-2.5 py-1 rounded-md bg-brand-50 dark:bg-dark-surface font-bold text-charcoal dark:text-white border border-brand-200 dark:border-dark-border">PDF</span>
            <span className="px-2.5 py-1 rounded-md bg-brand-50 dark:bg-dark-surface font-bold text-charcoal dark:text-white border border-brand-200 dark:border-dark-border">JPG</span>
            <span className="px-2.5 py-1 rounded-md bg-brand-50 dark:bg-dark-surface font-bold text-charcoal dark:text-white border border-brand-200 dark:border-dark-border">JPEG</span>
            <span className="px-2.5 py-1 rounded-md bg-brand-50 dark:bg-dark-surface font-bold text-charcoal dark:text-white border border-brand-200 dark:border-dark-border">PNG</span>
            <span className="text-charcoal-light dark:text-dark-subtle font-semibold">• Up to 25 MB per file</span>
          </div>
        </div>
      </div>

      {/* Error Feedback */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Feedback */}
      {successMessage && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
