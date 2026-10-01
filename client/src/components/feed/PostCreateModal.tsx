import { resolveImageUrl, getSocietyLogo } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Image as ImageIcon, Loader2, Shield } from 'lucide-react';
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

  const isAdmin = user?.role === 'DSA_ADMIN';
  const displayName = isAdmin
    ? (user?.fullName || 'Dean Student Affairs')
    : (user?.society?.name || user?.fullName || 'Society Member');
  const displayAvatar = isAdmin
    ? (user?.avatarUrl ? resolveImageUrl(user.avatarUrl) : '/default-dsa.png')
    : (user?.society?.logoUrl ? getSocietyLogo(user.society.logoUrl) : (user?.avatarUrl ? resolveImageUrl(user.avatarUrl) : '/default-society.jpg'));
  const fallbackAvatar = isAdmin ? '/default-dsa.png' : '/default-society.jpg';

  return typeof document !== "undefined" ? createPortal(
    <div className="modal-overlay active">
      <div
        className="modal-box max-w-xl w-full"
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
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
            <div className="flex items-center gap-3">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-11 h-11 rounded-full object-cover border border-border-subtle shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = fallbackAvatar;
                }}
              />
              <div className="flex flex-col text-left">
                <h3 className="text-base font-semibold text-text-primary leading-tight">
                  {displayName}
                </h3>
                {isAdmin ? (
                  <span className="text-xs text-brand-primary font-semibold flex items-center gap-1 mt-0.5">
                    <Shield className="w-3 h-3" /> Directorate of Student Affairs
                  </span>
                ) : (
                  <span className="text-xs text-text-muted font-medium mt-0.5">
                    {(user?.society as any)?.category?.name || 'Society Announcement'}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {uploadError && (
            <div className="text-red-600 dark:text-red-400 text-xs my-2 font-medium bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
              {uploadError}
            </div>
          )}

          <form
            id="post-create-dialog-form"
            onSubmit={handleSubmitForm}
            className="space-y-3"
          >
            <div className="mb-3">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Heading <span className="text-red-400">*</span>
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Heading/Title..."
                className="w-full text-text-primary text-lg font-bold placeholder:text-text-muted bg-transparent border-b border-border-subtle outline-none focus:ring-0 px-0 pb-2 mb-2"
                required
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full text-text-primary text-base placeholder:text-text-muted placeholder:font-normal font-normal bg-transparent border-none outline-none focus:ring-0 resize-none p-0 mt-2"
            />

            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-border-subtle bg-black group aspect-square flex items-center justify-center my-2">
                <img
                  src={getMediaUrl(previewUrl)}
                  alt="Attachment preview"
                  className="w-full h-full object-cover"
                />

                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-xs font-semibold gap-2 backdrop-blur-[2px]">
                    <Loader2 className="w-7 h-7 animate-spin text-white" />
                    <span>Uploading Image...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/80 hover:bg-red-600 text-white shadow-md transition-all active:scale-95 z-10 cursor-pointer"
                  title="Remove media"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center justify-between pt-3 mt-4 border-t border-border-subtle">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 text-text-muted hover:bg-surface-hover hover:text-text-primary rounded-full transition-all active:scale-90 flex items-center justify-center cursor-pointer"
              title="Add Image"
            >
              <ImageIcon className="w-6 h-6 stroke-[1.75]" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-surface-elevated hover:bg-surface-hover active:scale-95 text-text-primary border border-border-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="post-create-dialog-form"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

