'use client';

import React, { useRef, useState } from 'react';
import { Upload, Camera, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  disabled?: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileSelect,
  isProcessing = false,
  disabled = false,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is 10MB (${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }

    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Invalid file type. Please upload PNG, JPG, or PDF files.`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isProcessing}
        aria-label="Upload document"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isProcessing}
        aria-label="Take photo with camera"
      />

      {/* Drag and drop area (desktop only) */}
      <div
        role="button"
        tabIndex={disabled || isProcessing ? -1 : 0}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isProcessing) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          'hidden sm:flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50',
          disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'
        )}
        onClick={() => {
          if (!disabled && !isProcessing) {
            fileInputRef.current?.click();
          }
        }}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Processing document...</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop your document here
            </p>
            <p className="text-xs text-gray-500">
              or click to browse (PNG, JPG, PDF - max 10MB)
            </p>
          </>
        )}
      </div>

      {/* Mobile buttons */}
      <div className="flex gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled || isProcessing}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors',
            disabled || isProcessing
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-700 active:bg-blue-800'
          )}
          aria-label="Take photo with camera"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
          <span>Take Photo</span>
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessing}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium text-sm transition-colors',
            disabled || isProcessing
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-50 active:bg-gray-100'
          )}
          aria-label="Upload document from files"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span>Upload File</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Upload Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
