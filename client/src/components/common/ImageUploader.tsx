import { resolveImageUrl } from '@/lib/utils';
import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, X, AlertCircle, Camera, User } from 'lucide-react';
import { uploadService } from '@/services/upload.service';

interface ImageUploaderProps {
  onChange: (url: string) => void;
  value?: string;
  label?: string;
  folder?: 'posts' | 'events' | 'avatars' | 'societies' | 'general';
  shape?: 'rectangle' | 'circle';
  className?: string;
  fallbackImage?: string;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onChange,
  value,
  label,
  folder = 'general',
  shape = 'rectangle',
  className = '',
  fallbackImage,
  helperText,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);
    setError(null);

    try {
      const res = await uploadService.uploadMedia(file, folder);
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

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewUrl(null);
    setError(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  // Hidden File Input
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/png, image/jpeg, image/webp, image/gif"
      className="hidden"
      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
    />
  );

  // CIRCULAR AVATAR VARIANT
  if (shape === 'circle') {
    const defaultCircleClass = 'w-32 h-32 sm:w-36 sm:h-36';
    const circleSizeClass = className || defaultCircleClass;
    const activeImage = previewUrl ? resolveImageUrl(previewUrl) : fallbackImage || null;

    return (
      <div className="flex flex-col items-center">
        {label && (
          <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 text-center">
            {label}
          </label>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded-lg border border-red-500/20 mb-2 max-w-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="relative group shrink-0">
          <div
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 border shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${
              dragActive
                ? 'bg-white/[0.18] border-white/60 scale-[1.02]'
                : 'bg-white/[0.08] border-white/20 hover:border-white/50'
            } backdrop-blur-[20px] rounded-full ${circleSizeClass}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {activeImage ? (
              <>
                <img
                  src={activeImage}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                  onError={() => {
                    setError('Failed to load image preview');
                    setPreviewUrl(null);
                  }}
                />

                {/* Hover overlay with quick actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full backdrop-blur-[2px]">
                  <div className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all shadow-sm">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
              </>
            ) : (
              /* Minimal, clean placeholder when no image exists */
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-white/[0.08] to-white/[0.03] group-hover:from-white/[0.12] group-hover:to-white/[0.06] transition-all">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all mb-1 shadow-inner">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-white/75 group-hover:text-white tracking-wide">
                  Add Photo
                </span>
              </div>
            )}

            {/* Dragging over state */}
            {dragActive && (
              <div className="absolute inset-0 bg-indigo-500/30 backdrop-blur-sm rounded-full flex flex-col items-center justify-center text-white border-2 border-dashed border-white animate-pulse">
                <UploadCloud className="w-6 h-6 mb-1" />
                <span className="text-[11px] font-bold">Drop here</span>
              </div>
            )}

            {/* Spinner */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center z-20">
                <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Floating Remove Button Badge (Top-Right) */}
          {previewUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-0 right-0 sm:top-0.5 sm:right-0.5 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center border-2 border-surface hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 opacity-0 group-hover:opacity-100"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          )}

          {/* Floating Camera Button Badge (Bottom-Right) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="absolute bottom-0 right-0 sm:bottom-0.5 sm:right-0.5 w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-black shadow-lg flex items-center justify-center border-2 border-surface hover:scale-110 active:scale-95 transition-transform cursor-pointer z-10"
            aria-label="Upload photo"
          >
            <Camera className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Optional helper text outside the circle (rendered only if explicitly provided) */}
        {helperText && (
          <p className="text-[11px] text-text-secondary font-medium tracking-wide mt-2 text-center">
            {helperText}
          </p>
        )}

        {fileInput}
      </div>
    );
  }

  // RECTANGLE BANNER VARIANT
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
          {label}
        </label>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div
        className={`relative group overflow-hidden flex-shrink-0 ${
          className || 'w-full h-48 rounded-[18px]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div
          className={`absolute inset-0 transition-all duration-300 border ${
            dragActive ? 'bg-white/[0.15] border-white/40' : 'bg-white/[0.08] border-white/20'
          } backdrop-blur-[20px] rounded-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center p-4`}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
          style={{ cursor: previewUrl ? 'default' : 'pointer' }}
        >
          {previewUrl ? (
            <>
              <img
                src={resolveImageUrl(previewUrl)}
                alt="Uploaded preview"
                className="w-full h-full object-cover rounded-[14px]"
                onError={() => {
                  setError('Failed to load image preview');
                  setPreviewUrl(null);
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 rounded-[18px]">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all active:scale-95 shadow-md flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md"
                  aria-label="Change banner"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Change Banner</span>
                </button>
                <button
                  onClick={handleClear}
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-red-500/30 hover:bg-red-500/50 border border-red-500/50 text-red-200 hover:text-white transition-all active:scale-95 shadow-md flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md"
                  aria-label="Remove banner"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-2.5">
              <div className="p-3 bg-white/10 rounded-full text-white/70 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">
                  Click to upload <span className="font-normal text-white/70">or drag and drop</span>
                </p>
                <p className="text-xs text-white/50">
                  {helperText || 'PNG, JPG, WebP or GIF (Max 5MB)'}
                </p>
              </div>
            </div>
          )}
        </div>

        {fileInput}

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-[18px]">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};
