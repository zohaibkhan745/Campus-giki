import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, AlertCircle } from 'lucide-react';
import { uploadService } from '@/services/upload.service';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: 'posts' | 'events' | 'avatars' | 'societies' | 'general';
  label?: string;
  className?: string;
  hideLinkOption?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  folder = 'general',
  label,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal preview when value changes externally
  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // File validation
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const res = await uploadService.uploadImage(file, folder);
      const finalUrl = res.url || res.relativePath;
      setPreviewUrl(finalUrl);
      onChange(finalUrl);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to upload image');
      setPreviewUrl(null);
      onChange('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setError(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 text-left ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-vast-ink">
          {label}
        </label>
      )}

      {previewUrl ? (
        <div className="relative group rounded-cards overflow-hidden border-2 border-vast-ink bg-pure-white shadow-md max-h-56 flex items-center justify-center">
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            onError={() => {
              setError('Failed to load image preview');
            }}
          />
          <div className="absolute inset-0 bg-vast-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="p-2.5 rounded-full bg-vast-ink text-white hover:bg-red-600 transition-all active:scale-95 shadow-lg flex items-center gap-1.5 text-xs font-bold"
              title="Remove image"
            >
              <X className="w-4 h-4" />
              <span>Remove Image</span>
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-vast-ink/75 flex flex-col items-center justify-center text-white gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-white" />
              <span className="text-xs font-bold">Compressing & Uploading Banner...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-cards p-6 text-center cursor-pointer transition-all duration-200 bg-pure-white ${
            dragActive
              ? 'border-vast-ink bg-slate-100 scale-[0.99]'
              : 'border-vast-ink/30 hover:border-vast-ink hover:bg-slate-50/80 shadow-sm'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="flex flex-col items-center gap-2.5">
            <div className="p-3 rounded-full bg-vast-ink text-white shadow-sm flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-vast-ink">
                <span className="underline underline-offset-2">Click to upload banner</span> or drag and drop
              </p>
              <p className="text-xs text-fog font-medium">
                PNG, JPG, WebP or GIF (Max 5MB • Auto WebP Compression)
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5 bg-red-50 border border-red-200 p-2.5 rounded-inputs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
