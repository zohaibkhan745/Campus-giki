import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getSocietyLogo, resolveImageUrl, cn } from '@/lib/utils';
import type { PostFeedItem } from '@/types/feed.types';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { globalNotification } from '@/contexts/NotificationContext';
const PostDetailModal = React.lazy(() =>
  import('./PostDetailModal').then((m) => ({ default: m.PostDetailModal })),
);

interface PostCardProps {
  item: PostFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PostCardComponent: React.FC<PostCardProps> = ({ item, onEdit, onDelete }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const canEditOrDelete = user?.role === 'DSA_ADMIN';
  const canEdit = user?.role === 'DSA_ADMIN';

  const isDsaPost = item.isAdminPost || item.society?.id === 'admin' || item.society?.id === 'giki-admin';
  const coverImage = resolveImageUrl(item.imageUrl);
  const logoImage = isDsaPost
    ? (item.society?.logoUrl ? resolveImageUrl(item.society.logoUrl) : '/default-dsa.png')
    : getSocietyLogo(item.society?.logoUrl);
  const authorName = isDsaPost
    ? (item.society?.name || 'Dean Student Affairs')
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

  const postTitle = item.title || (item.content ? item.content.slice(0, 45) + '...' : 'Announcement');

  // Close dropdown on outside click or global event
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    window.addEventListener('close-all-dropdowns', handleClickOutside);

    if (dropdownOpen) {
      setTimeout(() => window.addEventListener('click', handleClickOutside), 10);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('close-all-dropdowns', handleClickOutside);
    };
  }, [dropdownOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropdownOpen) {
      setDropdownOpen(false);
      return;
    }
    window.dispatchEvent(new CustomEvent('close-all-dropdowns'));
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 8, left: rect.left });
    setDropdownOpen(true);
  };

  const handleCardClick = () => {
    setIsDetailOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsDetailOpen(true);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(item.id);
      globalNotification.triggerSuccess('Post deleted successfully');
      setShowDeleteConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['campusFeed'] });
      queryClient.invalidateQueries({ queryKey: ['societyPosts'] });
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      if (onDelete) onDelete();
    } catch {
      globalNotification.triggerFailed('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <article
        className="card-wrapper post-card-wrapper group relative flex flex-col w-full h-full rounded-[28px] overflow-hidden border border-white/10 bg-gray-950 shadow-2xl transition-all duration-200 hover:-translate-y-1 hover:border-white/25 hover:shadow-blue-500/10 active:scale-[0.99] cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-white/30"
        data-type="post"
        data-card-id={item.id}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="article"
        aria-label={`Announcement: ${postTitle}`}
      >
        {/* Upper Bar Section */}
        <div className="bg-gray-950/95 border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3 w-full rounded-t-[24px] shrink-0 z-20 relative">
          <div className="flex flex-col min-w-0 flex-1 text-left">
            <span
              className="text-white text-[18px] font-black tracking-tight truncate leading-tight group-hover:text-blue-400 transition-colors"
              title={postTitle}
            >
              {postTitle}
            </span>
            <span className="text-gray-400 text-[11px] font-medium whitespace-nowrap mt-0.5">
              {formattedDate} • {formattedTime}
            </span>
          </div>
          <span className="card-tag !text-[9px] !py-1 !px-2 shrink-0">Post</span>
        </div>

        {/* Center Media & Description Body */}
        <div className={`relative w-full flex-1 min-h-0 overflow-hidden flex flex-col ${!coverImage ? 'bg-black/[0.4] backdrop-blur-[24px]' : 'bg-gray-900'}`}>
          {coverImage ? (
            <img
              src={coverImage}
              alt={postTitle}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="absolute inset-0 bg-black/30" />
          )}

          <div className={cn("relative z-10 text-left flex flex-col flex-1", !coverImage ? "p-4" : "absolute top-5 left-5 right-5")}>
            {!coverImage && (
              <div className="text-gray-300 text-[16px] leading-relaxed mt-3 line-clamp-6 whitespace-pre-wrap flex-1">
                {item.content}
              </div>
            )}
          </div>
        </div>

        {/* Lower Bar Section */}
        <div
          className="bg-gray-950/95 border-t border-white/10 p-4 flex items-center justify-between gap-3 shrink-0 rounded-b-[24px] relative z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {societyId ? (
              <Link
                to={`/societies/${societyId}`}
                className="w-9 h-9 rounded-full bg-[#007ebb] flex items-center justify-center border border-white/20 shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={logoImage}
                  alt={authorName}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = isDsaPost ? '/default-dsa.png' : '/default-society.jpg';
                  }}
                />
              </Link>
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#007ebb] flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
                <img
                  src={logoImage}
                  alt={authorName}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = isDsaPost ? '/default-dsa.png' : '/default-society.jpg';
                  }}
                />
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1 text-left">
              {societyId ? (
                <Link
                  to={`/societies/${societyId}`}
                  className="text-white text-[14px] font-bold leading-tight truncate hover:opacity-80 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {authorName}
                </Link>
              ) : (
                <span className="text-white text-[14px] font-bold leading-tight truncate">{authorName}</span>
              )}
              <span className="text-gray-400 text-[12px] font-medium leading-none mt-0.5 truncate">
                {isDsaPost ? '@dsa.giki' : `@${(item.society as any)?.username || item.society?.name?.toLowerCase().replace(/\s+/g, '') || 'society'}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 h-full">
            <button
              type="button"
              className="px-4 h-[32px] flex items-center justify-center bg-white hover:bg-gray-200 active:scale-95 text-black text-[12px] font-bold rounded-lg transition-all border-none shadow-sm pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDetailOpen(true);
              }}
            >
              View Details
            </button>

            {canEditOrDelete && (
              <div className="menu-container shrink-0 h-full flex items-center">
                <button
                  type="button"
                  className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all pointer-events-auto cursor-pointer"
                  aria-label="Options"
                  ref={buttonRef}
                  onClick={toggleDropdown}
                  style={{ height: '32px', width: '32px', borderRadius: '50%' }}
                >
                  <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                    <circle cx="5" cy="12" r="2.5" />
                    <circle cx="12" cy="12" r="2.5" />
                    <circle cx="19" cy="12" r="2.5" />
                  </svg>
                </button>

                {dropdownOpen &&
                  createPortal(
                    <div
                      className="card-dropdown-menu active"
                      style={{
                        position: 'fixed',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        zIndex: 99999,
                        margin: 0,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canEdit && (
                        <button
                          className="card-dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(false);
                            if (onEdit) onEdit();
                            else navigate(`/posts/${item.id}/edit`);
                          }}
                        >
                          Edit Post
                        </button>
                      )}
                      <button
                        className="card-dropdown-item delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(false);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        Delete Post
                      </button>
                    </div>,
                    document.body
                  )}
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Detail Modal */}
      {isDetailOpen && (
        <React.Suspense fallback={null}>
          <PostDetailModal item={item} onClose={() => setIsDetailOpen(false)} />
        </React.Suspense>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm &&
        createPortal(
          <div
            id="delete-confirm-modal"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDeleting) setShowDeleteConfirm(false);
            }}
          >
            <div
              style={{
                background: 'rgba(25, 27, 34, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '24px',
                borderRadius: '24px',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>
                Delete Post?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Are you sure you want to permanently delete this post? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#fff',
                    color: '#000',
                    fontWeight: 600,
                    border: 'none',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.6 : 1,
                  }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#ff4d4f',
                    border: '1px solid #ff4d4f',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  onClick={handleDelete}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export const PostCard = React.memo(PostCardComponent, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id;
});
