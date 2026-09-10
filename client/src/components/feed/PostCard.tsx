import { getSocietyLogo, resolveImageUrl, cn } from '@/lib/utils';
import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { PostFeedItem } from '@/types/feed.types';
import { useCardFlip } from '@/hooks/useCardFlip';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { postService } from '@/services/post.service';
import { globalNotification } from '@/contexts/NotificationContext';

interface PostCardProps {
  item: PostFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PostCardComponent: React.FC<PostCardProps> = ({ item, onEdit, onDelete }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const coverImage = resolveImageUrl(item.imageUrl);
  const isLengthy = (item.content || '').length > 150;
  const needsFlip = !!coverImage || isLengthy;
  const { isActive, openCard, closeCard } = useCardFlip(wrapperRef, !needsFlip);
  const { user } = useAuth();
  const canEditOrDelete = user?.role === 'DSA_ADMIN' || (user?.role === 'SOCIETY' && user.society?.id === item.society?.id);
  const canEdit = user?.role === 'SOCIETY' && user.society?.id === item.society?.id;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

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

  const logoImage = getSocietyLogo(item.society.logoUrl);
  const authorName = item.isAdminPost ? 'Dean Student Affairs' : item.society.name;

  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedTime = new Date(item.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  useEffect(() => {
    if (isActive) {
      if (dropdownOpen) setDropdownOpen(false);
      if (showDeleteConfirm) setShowDeleteConfirm(false);
    }
  }, [isActive, dropdownOpen, showDeleteConfirm]);

  const postTitle = item.title || (item.content ? item.content.slice(0, 40) + '...' : 'Announcement');

  return (
    <div 
      ref={wrapperRef}
      className="card-wrapper post-card-wrapper"
      data-type="post"
      data-card-id={item.id}
    >
      <div className="card-flipper">
        
        {/* FRONT FACE */}
        <div 
          className={cn("card-face card-front flex flex-col", needsFlip && "cursor-pointer")}
          onClick={() => needsFlip && openCard(false)}
        >
          {/* Upper Bar Section */}
          <div className="bg-gray-950/95 border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3 w-full rounded-t-[24px] shrink-0 z-20 relative">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-white text-[18px] font-black tracking-tight truncate leading-tight" title={postTitle}>{postTitle}</span>
              <span className="text-gray-400 text-[11px] font-medium whitespace-nowrap mt-0.5">{formattedDate} • {formattedTime}</span>
            </div>
            <span className="card-tag !text-[9px] !py-1 !px-2 shrink-0">Post</span>
          </div>

          <div className={`relative w-full flex-1 overflow-hidden flex flex-col ${!coverImage ? 'bg-black/[0.4] backdrop-blur-[24px]' : 'bg-gray-900'}`}>
            {coverImage && (
              <img src={coverImage} alt="Post Cover" className="absolute inset-0 w-full h-full object-cover" />
            )}
            {!coverImage && <div className="absolute inset-0 bg-black/30"></div>}
            
            <div className={cn("relative z-10 text-left flex flex-col flex-1", !coverImage ? "p-4" : "absolute top-5 left-5 right-5")}>
              {!coverImage && (
                <div className="text-gray-300 text-[16px] leading-relaxed mt-3 line-clamp-6 whitespace-pre-wrap flex-1">
                  {item.content}
                </div>
              )}
            </div>
          </div>

                        {showDeleteConfirm && createPortal(
                <div id="delete-confirm-modal" style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}>
                  <div style={{ background: 'rgba(25, 27, 34, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '24px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Delete Post?</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '24px' }}>Are you sure you want to permanently delete this post? This action cannot be undone.</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#fff', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                      <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ff4d4f', border: '1px solid #ff4d4f', color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={async () => {
                        try {
                          await postService.deletePost(item.id);
                          globalNotification.triggerSuccess('Post deleted successfully');
                          window.location.reload();
                        } catch (err) {
                          globalNotification.triggerFailed('Failed to delete post');
                        }
                      }}>Delete</button>
                    </div>
                  </div>
                </div>, document.body
              )}
          {/* Lower Bar Section */}
          <div 
             className="bg-gray-950/95 border-t border-white/10 p-4 flex items-center justify-between gap-3 shrink-0 rounded-b-[24px] relative z-20"
             onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-[#007ebb] flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
                <img src={logoImage} alt={authorName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} />
              </div>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-white text-[14px] font-bold leading-tight truncate">{authorName}</span>
                <span className="text-gray-400 text-[12px] font-medium leading-none mt-0.5 truncate">@{(item.society as any)?.username || item.society.name.toLowerCase().replace(/\s+/g, '')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 h-full">
              {needsFlip && (
                <button type="button" className="px-4 h-[32px] flex items-center justify-center bg-white hover:bg-gray-200 text-black text-[12px] font-bold rounded-lg transition-colors border-none shadow-sm pointer-events-auto" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCard(false); }}>
                  View Details
                </button>
              )}
              {canEditOrDelete && (
                <div className="menu-container shrink-0 h-full flex items-center">
                  <button type="button" className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors pointer-events-auto" aria-label="Options" ref={buttonRef} onClick={toggleDropdown} style={{ height: '32px', width: '32px', borderRadius: '50%' }}>
                    <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><circle cx="5" cy="12" r="2.5"></circle><circle cx="12" cy="12" r="2.5"></circle><circle cx="19" cy="12" r="2.5"></circle></svg>
                  </button>
                  {dropdownOpen && createPortal(
                    <div className="card-dropdown-menu active" style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 99999, margin: 0 }} onClick={(e) => e.stopPropagation()}>
                      {canEdit && <button className="card-dropdown-item" onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); if(onEdit) onEdit(); else navigate(`/posts/${item.id}/edit`); }}>Edit Post</button>}
                      <button className="card-dropdown-item delete" onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); setShowDeleteConfirm(true); }}>Delete Post</button>
                    </div>,
                    document.body
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="card-face card-back">
          <div className="card-back-inner">
            
            <div className="relative h-[300px] w-full flex-shrink-0 bg-gray-950 flex items-center justify-center overflow-hidden">
              <img 
                src={coverImage || logoImage} 
                onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} 
                alt="Cover" 
                className={`drop-shadow-xl ${!coverImage ? 'object-cover rounded-full' : 'object-contain p-2'}`}
                style={{ 
                  border: "1px solid rgba(255,255,255,0.12)", 
                  borderRadius: !coverImage ? '50%' : '20px', 
                  margin: "16px", 
                  height: !coverImage ? '160px' : 'calc(100% - 32px)', 
                  width: !coverImage ? '160px' : 'calc(100% - 32px)', 
                  background: "rgba(0,0,0,0.4)" 
                }} 
              />
              <button type="button" className="close-btn" aria-label="Close details" onClick={(e) => { e.stopPropagation(); closeCard(); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="p-8 bg-[#111827] flex flex-col flex-1 min-h-0 rounded-b-[28px] text-left">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-700">
                <div className="w-11 h-11 rounded-full bg-[#007ebb] flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
                  <img src={logoImage} alt={authorName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-base leading-tight">{authorName}</span>
                  <span className="text-gray-400 text-xs mt-0.5">{formattedDate} • {formattedTime}</span>
                </div>
              </div>

              <div className="scroll-area flex-1 min-h-0">
                <div className="flex flex-col gap-2.5 mb-4">
                  {item.title && <h4 className="text-xl font-bold text-white">{item.title}</h4>}
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              </div>

              <button type="button" onClick={(e) => { e.stopPropagation(); closeCard(); }} className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                <span>Close Details</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export const PostCard = React.memo(PostCardComponent, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id;
});
