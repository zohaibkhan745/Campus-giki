import { resolveImageUrl } from '@/lib/utils';
import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { uploadService } from '@/services/upload.service';

interface ImageUploaderProps {
  onChange: (url: string) => void;
  value?: string;
  label?: string;
  folder?: 'posts' | 'events' | 'avatars' | 'societies' | 'general';
  shape?: 'rectangle' | 'circle';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onChange, value, label, folder = 'general', shape = 'rectangle' }) => {
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

  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">{label}</label>}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className={`relative group overflow-hidden flex-shrink-0 ${shape === 'circle' ? 'w-48 h-48 rounded-full mx-auto' : 'w-full h-48 rounded-[18px]'}`} 
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
        
        {/* Background / Base Container */}
        <div className={`absolute inset-0 transition-all duration-300 border ${
          dragActive ? 'bg-white/[0.15] border-white/40' : 'bg-white/[0.08] border-white/20'
        } backdrop-blur-[20px] ${shape === 'circle' ? 'rounded-full' : 'rounded-[18px]'} shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center p-4`}
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        style={{ cursor: previewUrl ? 'default' : 'pointer' }}
        >
          {previewUrl ? (
            <>
              <img
                src={resolveImageUrl(previewUrl)}
                alt="Uploaded preview"
                className={`w-full h-full object-cover ${shape === 'circle' ? 'rounded-full' : 'rounded-[14px]'}`}
                onError={() => {
                  setError('Failed to load image preview');
                }}
              />
              <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${shape === 'circle' ? 'rounded-full' : 'rounded-[18px]'}`}>
                 <button
                   onClick={handleClear}
                   type="button"
                   className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-200 hover:text-white transition-all active:scale-95 shadow-[0_4px_15px_rgba(239,68,68,0.4)] flex items-center gap-2 text-sm font-bold backdrop-blur-md"
                 >
                   <X className="w-4 h-4" />
                   Remove Image
                 </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 bg-white/10 rounded-full">
                <UploadCloud className="w-8 h-8 text-white/70" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">
                  Click to upload <span className="font-normal text-white/70">or drag and drop</span>
                </p>
                <p className="text-xs text-white/50">
                  PNG, JPG, WebP or GIF (Max 5MB)
                </p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
        
        {isUploading && (
          <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 ${shape === 'circle' ? 'rounded-full' : 'rounded-[18px]'}`}>
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};



