import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { uploadService } from '@/services/upload.service';

interface PostCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string; imageUrl?: string }) => Promise<void> | void;
  isSubmitting?: boolean;
  initialContent?: string;
  initialImageUrl?: string;
}

export const PostCreateModal: React.FC<PostCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialContent = '',
  initialImageUrl = '',
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setImageUrl(initialImageUrl);
      setPreviewUrl(initialImageUrl || null);
      setUploadError(null);
    }
  }, [isOpen, initialContent, initialImageUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be under 5MB');
      return;
    }

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      const res = await uploadService.uploadImage(file, 'posts');
      const finalUrl = res.url || res.relativePath;
      setImageUrl(finalUrl);
      setPreviewUrl(finalUrl);
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      setUploadError(err?.response?.data?.message || 'Failed to upload image');
      setPreviewUrl(null);
      setImageUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isUploading || isSubmitting) return;

    await onSubmit({
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  const displayName = user?.society?.name || user?.fullName || 'Society Member';
  const displayAvatar = user?.society?.logoUrl || user?.avatarUrl;
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-xl rounded-[28px] p-6 shadow-2xl relative border border-slate-100 flex flex-col justify-between min-h-[300px] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div>
          {/* Top Bar: User / Society Profile Avatar & Name */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  {initialLetter}
                </div>
              )}
              <h3 className="text-base font-semibold text-slate-900 leading-tight">
                {displayName}
              </h3>
            </div>
          </div>

          {/* Upload Error Alert */}
          {uploadError && (
            <div className="text-red-500 text-xs my-2 font-medium bg-red-50 p-2.5 rounded-xl border border-red-100">
              {uploadError}
            </div>
          )}

          {/* Textarea Form */}
          <form
            id="post-create-dialog-form"
            onSubmit={handleSubmitForm}
            className="space-y-3"
          >
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full text-slate-800 text-base placeholder:text-slate-400 placeholder:font-normal font-normal bg-transparent border-none outline-none focus:ring-0 resize-none p-0 mt-2"
            />

            {/* Attached Image Preview */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group max-h-60 flex items-center justify-center my-2">
                <img
                  src={previewUrl}
                  alt="Attachment preview"
                  className="w-full h-auto max-h-60 object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-xs font-semibold gap-2 backdrop-blur-[2px]">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Uploading Image...</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white shadow-md transition-all active:scale-95"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100/80">
          {/* Left Action: Image Upload Icon */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
              title="Add Image"
            >
              <ImageIcon className="w-6 h-6 stroke-[1.75]" />
            </button>
          </div>

          {/* Right Actions: Cancel & Post Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[#F3F4F6] text-[#374151] hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="post-create-dialog-form"
              disabled={isSubmitting || isUploading || content.trim().length === 0}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-none disabled:bg-[#F0F0F0] disabled:text-[#B0B0B0] disabled:cursor-not-allowed bg-[#18181B] text-white hover:bg-slate-800"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
