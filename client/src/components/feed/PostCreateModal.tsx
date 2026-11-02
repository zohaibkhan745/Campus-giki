import { resolveImageUrl, getSocietyLogo } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Image as ImageIcon, Loader2, Shield, AlertCircle, UploadCloud } from 'lucide-react';
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

  // Keyboard accessibility and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const processFile = async (file: File) => {
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, GIF)');
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
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
    <div
      className="modal-overlay active"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-announcement-title"
    >
      <div
        className="modal-box max-w-xl w-full max-h-[90vh] flex flex-col !p-0 overflow-hidden shadow-2xl border border-border-medium bg-surface-elevated animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Modal Fixed Header */}
        <header className="px-6 py-4 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface/50">
          <div className="flex items-center gap-3">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border border-border-subtle shadow-sm ring-1 ring-border-subtle"
              onError={(e) => {
                e.currentTarget.src = fallbackAvatar;
              }}
            />
            <div className="flex flex-col text-left">
              <h3 id="modal-announcement-title" className="text-sm sm:text-base font-bold text-text-primary leading-tight">
                {displayName}
              </h3>
              {isAdmin ? (
                <span className="text-xs text-brand-primary font-semibold flex items-center gap-1 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-brand-primary" /> Directorate of Student Affairs
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
            className="text-text-muted hover:text-text-primary p-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {uploadError && (
            <div className="flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{uploadError}</div>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form
            id="post-create-dialog-form"
            onSubmit={handleSubmitForm}
            className="space-y-4"
          >
            {/* Title / Heading */}
            <div className="space-y-1.5">
              <label
                htmlFor="announcement-heading"
                className="block text-[11px] font-bold text-text-muted uppercase tracking-wider"
              >
                Heading <span className="text-red-500">*</span>
              </label>
              <input
                id="announcement-heading"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GIKI Annual Tech Fest Announced"
                className="w-full text-text-primary text-base sm:text-lg font-bold placeholder:text-text-muted/60 bg-surface/40 hover:bg-surface/60 focus:bg-surface border border-border-subtle focus:border-brand-primary rounded-xl px-3.5 py-2.5 outline-none transition-all"
                required
              />
            </div>

            {/* Content / Body */}
            <div className="space-y-1.5">
              <label
                htmlFor="announcement-content"
                className="block text-[11px] font-bold text-text-muted uppercase tracking-wider"
              >
                Details <span className="text-text-muted font-normal lowercase">(optional if photo attached)</span>
              </label>
              <textarea
                id="announcement-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What details would you like to share with the campus community?"
                rows={4}
                className="w-full text-text-primary text-sm sm:text-base placeholder:text-text-muted/60 bg-surface/40 hover:bg-surface/60 focus:bg-surface border border-border-subtle focus:border-brand-primary rounded-xl p-3.5 outline-none resize-none transition-all leading-relaxed"
              />
            </div>

            {/* Media Attachment Preview */}
            {previewUrl ? (
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  Attached Photo / Poster
                </span>
                <div className="relative rounded-2xl overflow-hidden border border-border-medium bg-neutral-950 max-h-[260px] h-56 sm:h-64 flex items-center justify-center group shadow-inner">
                  {/* Ambient backdrop blur */}
                  <img
                    src={getMediaUrl(previewUrl)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none select-none"
                  />
                  {/* Main image */}
                  <img
                    src={getMediaUrl(previewUrl)}
                    alt="Announcement attachment"
                    className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain rounded-lg shadow-md"
                  />

                  {/* Actions overlay */}
                  <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/10 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Change image"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      disabled={isUploading}
                      className="p-1.5 rounded-xl bg-black/75 hover:bg-red-600 text-white backdrop-blur-md border border-white/10 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Loading spinner overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white text-xs font-semibold gap-2">
                      <Loader2 className="w-7 h-7 animate-spin text-brand-primary" />
                      <span>Uploading image...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Drag-and-drop / Click-to-upload area */
              <div
                onClick={() => imageInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) void processFile(file);
                }}
                className="border-2 border-dashed border-border-subtle hover:border-brand-primary/50 hover:bg-brand-primary/5 rounded-2xl p-4 flex items-center justify-center gap-3.5 cursor-pointer transition-all group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    imageInputRef.current?.click();
                  }
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-muted group-hover:text-brand-primary group-hover:scale-105 transition-all border border-border-subtle group-hover:border-brand-primary/30">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
                    Add banner or photo <span className="text-text-muted font-normal">(optional)</span>
                  </p>
                  <p className="text-[11px] text-text-muted">
                    PNG, JPG, WebP up to 5MB • Drag & drop or click
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Fixed Footer */}
        <footer className="px-6 py-3.5 border-t border-border-subtle bg-surface/80 backdrop-blur-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploading || isSubmitting}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-all cursor-pointer border border-border-subtle/50 hover:border-border-subtle disabled:opacity-50"
              title={previewUrl ? "Change attached image" : "Attach image"}
            >
              <ImageIcon className="w-4 h-4 text-brand-primary" />
              <span>{previewUrl ? 'Change Image' : 'Attach Image'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm bg-surface hover:bg-surface-hover active:scale-95 text-text-primary border border-border-subtle transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="post-create-dialog-form"
              disabled={isSubmitting || isUploading || title.trim().length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white transition-all shadow-md shadow-brand-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Announcement</span>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  ) : null;
};
