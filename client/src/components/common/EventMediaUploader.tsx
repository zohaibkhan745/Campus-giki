import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Video, X, Loader2, AlertCircle, Film } from 'lucide-react';
import { resolveImageUrl } from '@/lib/utils';
import { uploadService } from '@/services/upload.service';

interface EventMediaUploaderProps {
  coverImageUrl?: string | null;
  videoUrl?: string | null;
  onImageChange: (url: string) => void;
  onVideoChange: (url: string) => void;
  folder?: 'events' | 'posts' | 'general';
  label?: string;
  disabled?: boolean;
  theme?: 'light' | 'dark';
}

export const EventMediaUploader: React.FC<EventMediaUploaderProps> = ({
  coverImageUrl,
  videoUrl,
  onImageChange,
  onVideoChange,
  folder = 'events',
  label = 'Event Cover Banner or Promotional Video (Optional)',
  disabled = false,
  theme = 'light',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'image' | 'video' | null>(
    videoUrl ? 'video' : coverImageUrl ? 'image' : null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    videoUrl || coverImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if props change externally
  useEffect(() => {
    if (videoUrl) {
      setActiveType('video');
      setPreviewUrl(videoUrl);
    } else if (coverImageUrl) {
      setActiveType('image');
      setPreviewUrl(coverImageUrl);
    } else {
      setActiveType(null);
      setPreviewUrl(null);
    }
  }, [coverImageUrl, videoUrl]);

  const handleFileSelect = async (file: File) => {
    setError(null);

    const isImage = file.type.startsWith('image/');

    if (!isImage) {
      setError('Only image files (PNG, JPG, WebP, GIF) are allowed for events.');
      return;
    }

    if (isImage && file.size > 8 * 1024 * 1024) {
      setError('Image file size must be under 8MB');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    const selectedType = isImage ? 'image' : 'video';
    setPreviewUrl(localPreview);
    setActiveType(selectedType);
    setIsUploading(true);

    try {
      if (isImage) {
        const res = await uploadService.uploadImage(file, folder);
        const finalUrl = res.url || res.relativePath;
        setPreviewUrl(finalUrl);
        onImageChange(finalUrl);
        onVideoChange('');
      } else {
        const res = await uploadService.uploadMedia(file, folder);
        const finalUrl = res.url || res.relativePath;
        setPreviewUrl(finalUrl);
        onVideoChange(finalUrl);
        onImageChange('');
      }
    } catch (err: any) {
      console.error('Media upload failed:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to upload media file');
      setPreviewUrl(null);
      setActiveType(null);
      onImageChange('');
      onVideoChange('');
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
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setActiveType(null);
    setError(null);
    onImageChange('');
    onVideoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 text-left">
      {label && <label className="block text-sm font-bold text-text-primary">{label}</label>}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {previewUrl ? (
        <div className="relative rounded-2xl border border-border-subtle overflow-hidden bg-black group shadow-sm aspect-square">
          {activeType === 'video' ? (
            <video
              src={resolveImageUrl(previewUrl)}
              controls
              className="w-full h-full object-contain mx-auto"
            />
          ) : (
            <img
              src={resolveImageUrl(previewUrl)}
              alt="Event Media Preview"
              className="w-full h-full object-cover"
              onError={() => {
                setError('Failed to display preview image');
              }}
            />
          )}

          {/* Media Type Badge & Status */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-white rounded-full text-xs font-bold shadow-lg border border-white/20">
              {activeType === 'video' ? (
                <>
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  Promo Video
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  Poster Preview
                </>
              )}
            </span>
            {isUploading && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-md animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading...
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {!disabled && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 bg-surface-glass hover:bg-surface-hover backdrop-blur-md border border-border-subtle text-text-primary rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={isUploading}
                className="p-1.5 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md border border-red-500/30 text-white rounded-xl transition-all shadow-md cursor-pointer"
                title="Remove Media"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 aspect-square bg-surface-card hover:bg-surface-elevated ${
            disabled
              ? 'opacity-50 cursor-not-allowed border-border-subtle'
              : 'cursor-pointer border-border-subtle hover:border-brand-primary'
          } ${
            dragActive
              ? 'border-brand-primary bg-brand-primary/5 scale-[0.99]'
              : 'shadow-sm'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4 font-bold text-sm text-text-primary">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
              <span>Uploading media file...</span>
            </div>
          ) : (
            <>
              <div className="p-3.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-text-primary text-sm">Click to upload or drag &amp; drop</p>
                <p className="text-xs text-text-muted mt-1 font-medium">JPEG, PNG, GIF (Max 8MB)</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        disabled={disabled || isUploading}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
};
