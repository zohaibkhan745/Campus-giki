import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Link as LinkIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import { uploadService } from '@/services/upload.service';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: 'posts' | 'events' | 'avatars' | 'societies' | 'general';
  label?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  folder = 'general',
  label = 'Add Image',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [linkInput, setLinkInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal preview when value changes externally
  React.useEffect(() => {
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
      setError('File size must be less than 5MB');
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

  const handleClear = () => {
    setPreviewUrl(null);
    setError(null);
    setLinkInput('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;
    setPreviewUrl(linkInput.trim());
    onChange(linkInput.trim());
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg text-xs border border-slate-700/50">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              mode === 'upload'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('link')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              mode === 'link'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            URL Link
          </button>
        </div>
      </div>

      {previewUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900/80 shadow-md">
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => {
              setError('Failed to load image preview');
            }}
          />
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-full bg-red-500/90 text-white hover:bg-red-600 transition-transform active:scale-95 shadow-lg"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-blue-400 gap-2 backdrop-blur-sm">
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-xs font-semibold text-white">Compressing & Uploading...</span>
            </div>
          )}
        </div>
      ) : mode === 'upload' ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
              : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/80'
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
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-200">
                <span className="text-blue-400 underline underline-offset-2">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500">
                PNG, JPG, WebP or GIF (Max 5MB • Auto WebP Compression)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleLinkSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Apply
          </button>
        </form>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
