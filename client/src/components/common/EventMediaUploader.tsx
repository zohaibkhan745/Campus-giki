import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Video, X, Loader2, AlertCircle, Film } from 'lucide-react';
import { uploadService } from '@/services/upload.service';

interface EventMediaUploaderProps {
  coverImageUrl?: string | null;
  videoUrl?: string | null;
  onImageChange: (url: string) => void;
  onVideoChange: (url: string) => void;
  folder?: 'events' | 'posts' | 'general';
  label?: string;
  disabled?: boolean;
}

export const EventMediaUploader: React.FC<EventMediaUploaderProps> = ({
  coverImageUrl,
  videoUrl,
  onImageChange,
  onVideoChange,
  folder = 'events',
  label = 'Event Cover Banner or Promotional Video (Optional)',
  disabled = false,
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
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please select a valid image (PNG, JPG, WebP, GIF) or video (MP4, WebM, MOV, MKV)');
      return;
    }

    if (isImage && file.size > 5 * 1024 * 1024) {
      setError('Image file size must be under 5MB');
      return;
    }

    if (isVideo && file.size > 50 * 1024 * 1024) {
      setError('Video file size must be under 50MB');
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
      {label && <label className="block text-sm font-bold text-vast-ink">{label}</label>}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-inputs text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {previewUrl ? (
        <div className="relative rounded-cards border-2 border-vast-ink overflow-hidden bg-black/90 group shadow-sm">
          {activeType === 'video' ? (
            <video
              src={previewUrl}
              controls
              className="w-full max-h-[320px] object-contain mx-auto"
            />
          ) : (
            <img
              src={previewUrl}
              alt="Event Media Preview"
              className="w-full max-h-[320px] object-cover"
              onError={() => {
                setError('Failed to display preview image');
              }}
            />
          )}

          {/* Media Type Badge & Status */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-vast-ink/90 backdrop-blur text-pure-white rounded-full text-xs font-bold shadow-md border border-pure-white/20">
              {activeType === 'video' ? (
                <>
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  Promo Video
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  Banner Image
                </>
              )}
            </span>
            {isUploading && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-pure-white rounded-full text-xs font-bold shadow-md animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading...
              </span>
            )}
          </div>

          {/* Action buttons */}
          {!disabled && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 bg-pure-white/90 hover:bg-pure-white text-vast-ink rounded-inputs text-xs font-bold transition-all shadow-md backdrop-blur border border-vast-ink"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={isUploading}
                className="p-1.5 bg-red-500/90 hover:bg-red-600 text-pure-white rounded-inputs transition-all shadow-md backdrop-blur border border-pure-white/20"
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
          className={`relative border-2 border-dashed rounded-cards p-6 text-center transition-all flex flex-col items-center justify-center gap-3 ${
            disabled ? 'opacity-50 cursor-not-allowed border-fog' : 'cursor-pointer'
          } ${
            dragActive
              ? 'border-forest-ink bg-forest-ink/5 scale-[0.99]'
              : 'border-vast-ink bg-pure-white hover:bg-lumen-stone'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4 text-vast-ink font-bold text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-forest-ink" />
              <span>Uploading media file...</span>
            </div>
          ) : (
            <>
              <div className="p-3.5 bg-lumen-cream border-2 border-vast-ink rounded-full text-vast-ink shadow-sm">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <p className="font-extrabold text-sm text-vast-ink">
                  Click to upload media or drag and drop
                </p>
                <p className="text-xs font-medium text-fog mt-1">
                  Upload an <span className="font-bold text-vast-ink">Image</span> (PNG, JPG, WebP • Max 5MB) or <span className="font-bold text-vast-ink">Video</span> (MP4, WebM, MOV • Max 50MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
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
