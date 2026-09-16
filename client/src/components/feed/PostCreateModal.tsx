import { resolveImageUrl } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getMediaUrl } from '@/lib/api';
import { uploadService } from '@/services/upload.service';

interface PostCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; imageUrl?: string }) => Promise<void> | void;
  isSubmitting?: boolean;
  initialContent?: string;
  initialImageUrl?: string;
  initialTitle?: string;
}

export const PostCreateModal: React.FC<PostCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialContent = '',
    initialImageUrl = '',
    initialTitle = '',
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
      setImageUrl(initialImageUrl);
      setPreviewUrl(initialImageUrl || null);
      setUploadError(null);
    }
  }, [isOpen, initialContent, initialImageUrl, initialTitle]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size must be under 5MB');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      const res = await uploadService.uploadMedia(file, 'posts');
      const finalUrl = res.url || res.relativePath;
      setImageUrl(finalUrl);
      setPreviewUrl(finalUrl);
    } catch (err: any) {
      console.error('Failed to upload file:', err);
      setUploadError(err?.response?.data?.message || 'Failed to upload media file');
      setPreviewUrl(null);
      setImageUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setImageUrl('');
    setPreviewUrl(null);
    setUploadError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading || isSubmitting) return;
    if (title.trim().length === 0) {
      setUploadError('Heading is required');
      return;
    }
    if (content.trim().length === 0 && !imageUrl) {
      setUploadError('Please provide some text content or upload an image');
      return;
    }

    setUploadError(null);
    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  const displayName = user?.society?.name || user?.fullName || 'Society Member';
  const displayAvatar = user?.society?.logoUrl || user?.avatarUrl;
  const initialLetter = displayName.charAt(0).toUpperCase();

  return typeof document !== "undefined" ? createPortal(
    <div className="modal-overlay active">
      <div
        className="modal-box" style={{ maxWidth: "550px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              {displayAvatar ? (
                <img
                  src={resolveImageUrl(displayAvatar)}
                  alt={displayName}
                  className="w-11 h-11 rounded-full object-cover border border-vast-ink/20 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  {initialLetter}
                </div>
              )}
              <h3 className="text-base font-semibold text-white leading-tight">
                {displayName}
              </h3>
            </div>
          </div>

          {uploadError && (
            <div className="text-red-500 text-xs my-2 font-medium bg-red-50 p-2.5 rounded-xl border border-red-100">
              {uploadError}
            </div>
          )}

          <form
            id="post-create-dialog-form"
            onSubmit={handleSubmitForm}
            className="space-y-3"
          >
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Heading <span className="text-red-400">*</span>
              </label>
              <input
                autoFocus
                value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Heading/Title..."
              className="w-full text-white text-lg font-bold placeholder:text-gray-400 bg-transparent border-b border-vast-ink/20 outline-none focus:ring-0 px-0 pb-2 mb-2"
              required
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full text-white text-base placeholder:text-gray-400 placeholder:font-normal font-normal bg-transparent border-none outline-none focus:ring-0 resize-none p-0 mt-2"
            />

            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-vast-ink/20 bg-black group aspect-square flex items-center justify-center my-2">
                <img
                    src={getMediaUrl(previewUrl)}
                  alt="Attachment preview"
                  className="w-full h-full object-cover"
                />

                {isUploading && (
                  <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white text-xs font-semibold gap-2 backdrop-blur-[2px]">
                    <Loader2 className="w-7 h-7 animate-spin text-white" />
                    <span>Uploading Image...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white shadow-md transition-all active:scale-95 z-10"
                  title="Remove media"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center justify-between pt-3 mt-4 border-t border-white/20">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 text-white/70 hover:bg-white/10 hover:text-white rounded-full transition-all active:scale-90 flex items-center justify-center cursor-pointer"
              title="Add Image"
            >
              <ImageIcon className="w-6 h-6 stroke-[1.75]" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="post-create-dialog-form"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-white text-gray-950 hover:bg-gray-200 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <span>Post Announcement</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
};

