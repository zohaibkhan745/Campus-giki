import React, { useState, useRef, useEffect } from 'react';
import { Video, UploadCloud, X, Loader2, AlertCircle } from 'lucide-react';
import { uploadService } from '@/services/upload.service';

interface VideoUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: 'posts' | 'events' | 'avatars' | 'societies' | 'general';
  label?: string;
  className?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  value,
  onChange,
  folder = 'events',
  label = 'Event Promotional Video (Optional)',
  className = '',
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
    setError(null);

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, WebM, MOV, MKV)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Video file size must be under 50MB');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const res = await uploadService.uploadMedia(file, folder);
      const finalUrl = res.url || res.relativePath;
      setPreviewUrl(finalUrl);
      onChange(finalUrl);
    } catch (err: any) {
      console.error('Video upload failed:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to upload video');
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
        <div className="relative group rounded-cards overflow-hidden border-2 border-vast-ink bg-black shadow-md max-h-60 flex items-center justify-center">
          <video
            src={previewUrl}
            controls
            className="w-full max-h-60 object-contain rounded-cards"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-vast-ink/90 text-white hover:bg-red-600 transition-all active:scale-95 shadow-lg flex items-center gap-1.5 text-xs font-bold z-10"
            title="Remove video"
          >
            <X className="w-4 h-4" />
            <span>Remove Video</span>
          </button>

          {isUploading && (
            <div className="absolute inset-0 bg-vast-ink/80 flex flex-col items-center justify-center text-white gap-2 z-20">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span className="text-xs font-bold">Uploading Video File (Max 50MB)...</span>
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
            accept="video/mp4, video/webm, video/quicktime, video/x-matroska"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="flex flex-col items-center gap-2.5">
            <div className="p-3 rounded-full bg-vast-ink text-white shadow-sm flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-vast-ink">
                <span className="underline underline-offset-2">Click to upload video</span> or drag and drop
              </p>
              <p className="text-xs text-fog font-medium">
                MP4, WebM, MOV or MKV (Max 50MB)
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
