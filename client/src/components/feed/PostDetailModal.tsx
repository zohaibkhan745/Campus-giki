import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import { getSocietyLogo, resolveImageUrl } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { PostFeedItem } from '@/types/feed.types';

export interface PostDetailModalProps {
  item: PostFeedItem;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ item, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Hardware-accelerated CSS transition entry
    const raf = requestAnimationFrame(() => {
      setIsOpen(true);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const isDsaPost = item.isAdminPost || item.society?.id === 'admin' || item.society?.id === 'giki-admin';
  const coverImage = resolveImageUrl(item.imageUrl);
  const logoImage = isDsaPost
    ? (item.society?.logoUrl ? resolveImageUrl(item.society.logoUrl) : '/default-dsa.png')
    : getSocietyLogo(item.society?.logoUrl);
  const authorName = isDsaPost
    ? (item.society?.name || 'Dean Student Affairs (DSA)')
    : (item.society?.name || 'Society');
  const societyId = isDsaPost ? undefined : item.society?.id;

  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(item.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-200 ease-out ${
          isOpen && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog Window */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title || 'Announcement Details'}
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface-elevated border border-border-medium rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-200 ease-out z-10 select-text ${
          isOpen && !isClosing
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-[0.96] translate-y-2'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-surface/95 border-b border-border-subtle px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
            {societyId ? (
              <Link
                to={`/societies/${societyId}`}
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center border border-border-medium shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img
                  src={logoImage}
                  alt={authorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = isDsaPost ? '/default-dsa.png' : '/default-society.jpg';
                  }}
                />
              </Link>
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center border border-border-medium shrink-0 overflow-hidden">
                <img
                  src={logoImage}
                  alt={authorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = isDsaPost ? '/default-dsa.png' : '/default-society.jpg';
                  }}
                />
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              {societyId ? (
                <Link
                  to={`/societies/${societyId}`}
                  onClick={handleClose}
                  className="text-text-primary text-[15px] font-bold leading-tight truncate hover:text-brand-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{authorName}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                </Link>
              ) : (
                <span className="text-text-primary text-[15px] font-bold leading-tight truncate">{authorName}</span>
              )}
              <span className="text-text-secondary text-[11px] font-medium whitespace-nowrap mt-0.5">
                {formattedDate} • {formattedTime}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="card-tag !text-[9px] !py-1 !px-2.5">Announcement</span>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-full transition-all active:scale-90"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto overscroll-contain flex-1 p-6 space-y-5 text-left text-text-primary">
          {/* Post Title */}
          {item.title && (
            <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-snug">
              {item.title}
            </h2>
          )}

          {/* Cover Media Image if exists */}
          {coverImage && (
            <div className="relative w-full max-h-[360px] rounded-2xl overflow-hidden border border-border-subtle bg-black/40 flex items-center justify-center">
              <img
                src={coverImage}
                alt={item.title || 'Announcement Media'}
                loading="lazy"
                decoding="async"
                className="w-full h-full max-h-[360px] object-contain rounded-2xl"
              />
            </div>
          )}

          {/* Post Full Text Content */}
          <div className="text-[15px] sm:text-[16px] text-text-secondary leading-relaxed whitespace-pre-wrap font-normal">
            {item.content}
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-surface/95 border-t border-border-subtle px-6 py-3.5 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-text-primary text-text-inverse font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
