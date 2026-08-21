import React, { useState, useRef, useEffect } from 'react';

import { X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { uploadService } from '@/services/upload.service';

interface PostCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string; imageUrl?: string; videoUrl?: string }) => Promise<void> | void;
  isSubmitting?: boolean;
  initialContent?: string;
  initialImageUrl?: string;
  initialVideoUrl?: string;
}

export const PostCreateModal: React.FC<PostCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialContent = '',
  initialImageUrl = '',
  initialVideoUrl = '',
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || initialVideoUrl || null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(
    initialVideoUrl ? 'video' : initialImageUrl ? 'image' : null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setImageUrl(initialImageUrl);
      setVideoUrl(initialVideoUrl);
      setPreviewUrl(initialImageUrl || initialVideoUrl || null);
      setMediaType(initialVideoUrl ? 'video' : initialImageUrl ? 'image' : null);
      setUploadError(null);
    }
  }, [isOpen, initialContent, initialImageUrl, initialVideoUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (type === 'image' && !file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    if (type === 'video' && !file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, WebM, MOV)');
      return;
    }

    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File size must be under ${type === 'video' ? '50MB' : '5MB'}`);
      return;
    }

    // Local Preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setMediaType(type);
    setIsUploading(true);

    try {
      const res = await uploadService.uploadMedia(file, 'posts');
      const finalUrl = res.url || res.relativePath;
      if (type === 'image') {
        setImageUrl(finalUrl);
        setVideoUrl('');
      } else {
        setVideoUrl(finalUrl);
        setImageUrl('');
      }
      setPreviewUrl(finalUrl);
    } catch (err: any) {
      console.error('Failed to upload file:', err);
      setUploadError(err?.response?.data?.message || 'Failed to upload media file');
      setPreviewUrl(null);
      setImageUrl('');
      setVideoUrl('');
      setMediaType(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setImageUrl('');
    setVideoUrl('');
    setPreviewUrl(null);
    setMediaType(null);
    setUploadError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isUploading || isSubmitting) return;

    await onSubmit({
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  const displayName = user?.society?.name || user?.fullName || 'Society Member';
  const displayAvatar = user?.society?.logoUrl || user?.avatarUrl;
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="modal-overlay active">
      <div
        className="modal-box" style={{ maxWidth: "550px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'image')}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4, video/webm, video/quicktime, video/x-matroska"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'video')}
        />

        <div>
          {/* Top Bar: User / Society Profile Avatar & Name */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
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
              className="w-full text-white text-base placeholder:text-gray-400 placeholder:font-normal font-normal bg-transparent border-none outline-none focus:ring-0 resize-none p-0 mt-2"
            />

            {/* Attached Media Preview */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-vast-ink/20 bg-black group max-h-64 flex items-center justify-center my-2">
                {mediaType === 'video' || videoUrl ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-h-64 object-contain rounded-2xl"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Attachment preview"
                    className="w-full h-auto max-h-64 object-cover"
                  />
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white text-xs font-semibold gap-2 backdrop-blur-[2px]">
                    <Loader2 className="w-7 h-7 animate-spin text-white" />
                    <span>Uploading {mediaType === 'video' ? 'Video...' : 'Image...'}</span>
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

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-3 mt-4 border-t border-white/20">
          {/* Left Actions: Image & Video Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 text-slate-700 hover:text-white hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
              title="Add Image"
            >
              <ImageIcon className="w-6 h-6 stroke-[1.75]" />
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="p-2.5 text-slate-700 hover:text-white hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
              title="Add Video"
            >
              <Video className="w-6 h-6 stroke-[1.75]" />
            </button>
          </div>

          {/* Right Actions: Cancel & Post Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel" style={{width: "auto"}}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="post-create-dialog-form"
              disabled={isSubmitting || isUploading || content.trim().length === 0}
              className="btn-cancel" style={{width: "auto", background: "rgba(255,255,255,0.9)", color: "#000"}}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
