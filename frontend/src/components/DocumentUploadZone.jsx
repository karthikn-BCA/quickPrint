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
            ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/50 shadow-sm'
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
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {isUploading ? 'Validating and Uploading Documents...' : 'Drag & Drop Your Files Here'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              or <span className="text-indigo-600 font-semibold underline underline-offset-2">browse files</span> from your phone or laptop
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-700">PDF</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-700">JPG</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-700">JPEG</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-700">PNG</span>
            <span className="text-slate-400">• Up to 25 MB per file</span>
          </div>
        </div>
      </div>

      {/* Error Feedback */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Feedback */}
      {successMessage && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
