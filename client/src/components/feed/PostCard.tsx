import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getSocietyLogo } from '@/lib/utils';
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
  const frontDescRef = useRef<HTMLParagraphElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);
  const [showButton, setShowButton] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const toggleDropdown = (e: React.MouseEvent) => {
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

  
  const { isActive, openCard, closeCard } = useCardFlip(wrapperRef);
  const { user } = useAuth();
  const canEditOrDelete = user?.role === 'DSA_ADMIN' || (user?.role === 'SOCIETY' && user.society?.id === item.society.id);
  const canEdit = user?.role === 'SOCIETY' && user.society?.id === item.society.id;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const coverImage = item.imageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80';
  const logoImage = getSocietyLogo(item.society.logoUrl);
  const authorName = item.society.name;

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
    // Check overflow to show the View Details button dynamically
    const checkOverflow = () => {
      const desc = frontDescRef.current;
      const textContainer = textContentRef.current;
      const wrapper = wrapperRef.current;
      if (!desc || !textContainer || !wrapper) return;
      
      const overlay = wrapper.querySelector('.glass-overlay') as HTMLElement;
      const profileHeader = wrapper.querySelector('.profile-header') as HTMLElement;
      
      if (!overlay || !profileHeader) return;
      
      // Reset
      desc.classList.remove('clamped');
      desc.style.webkitLineClamp = '';
      setShowButton(false);
      
      void desc.offsetHeight; // force reflow
      
      const overlayStyle = window.getComputedStyle(overlay);
      const paddingTop = parseFloat(overlayStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(overlayStyle.paddingBottom) || 0;
      const availableHeight = overlay.clientHeight - paddingTop - paddingBottom;
      const headerHeight = profileHeader.offsetHeight;
      const textMarginTop = 14;
      const fullDescriptionHeight = desc.scrollHeight;
      const requiredHeight = headerHeight + textMarginTop + fullDescriptionHeight;
      
      if (requiredHeight > availableHeight) {
        setShowButton(true);
        // Let React render the button, then next frame we calculate clamp
        requestAnimationFrame(() => {
          const btn = wrapper.querySelector('.open-details-btn') as HTMLElement;
          if (!btn) return;
          const buttonHeight = btn.offsetHeight;
          const buttonMarginTop = 16;
          const descriptionAvailableHeight = availableHeight - headerHeight - textMarginTop - buttonHeight - buttonMarginTop;
          
          const descriptionStyle = window.getComputedStyle(desc);
          const lineHeight = parseFloat(descriptionStyle.lineHeight) || 20;
          const numberOfLines = Math.max(1, Math.floor(descriptionAvailableHeight / lineHeight));
          
          desc.style.webkitLineClamp = numberOfLines.toString();
          desc.classList.add('clamped');
        });
      }
    };
    
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [item.content]);

  useEffect(() => {
    if (isActive) {
      if (dropdownOpen) setDropdownOpen(false);
      if (showDeleteConfirm) setShowDeleteConfirm(false);
    }
  }, [isActive, dropdownOpen, showDeleteConfirm]);

  return (
    <div 
      ref={wrapperRef}
      className="card-wrapper post-card-wrapper"
      data-card-id={item.id}
    >
      <div className="card-flipper">
        
        {/* FRONT FACE */}
        <div className="card-face card-front">
          <div className="glass-card-bg"></div>

          <div className="card-top-bar">
              <div className="profile-header">
                <img 
                  src={logoImage} 
                  alt={authorName} 
                  className="avatar" 
                  onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} 
                />
                <div className="author-name-group">
                  <span className="author-name">{authorName}</span>
                  <span className="post-timestamp">Posted: {formattedDate} • {formattedTime}</span>
                </div>
              </div>
              <span className="card-tag">Post</span>
            </div>

          <div className="glass-overlay">
              <div className="user-profile">

              <div className="front-text-content" ref={textContentRef}>
                {item.title && <h3 className="card-title">{item.title}</h3>}
                <p className="front-description" ref={frontDescRef}>{item.content}</p>
              </div>
            </div>

            {showButton && (
              <div className="flex items-center gap-2 mt-auto w-full">
              {canEditOrDelete && (
                <div className="menu-container shrink-0 h-full flex items-center">
                  <button 
                    type="button" 
                    className="card-button flex items-center justify-center p-0" aria-label="Options" ref={buttonRef} onClick={toggleDropdown} style={{ height: '48px', width: '48px', borderRadius: '9999px' }}
                  >
                    <svg viewBox="0 0 24 24" fill="white"><circle cx="5" cy="12" r="2.5"></circle><circle cx="12" cy="12" r="2.5"></circle><circle cx="19" cy="12" r="2.5"></circle></svg>
                  </button>
                  {dropdownOpen && createPortal(
                    <div 
                      className="card-dropdown-menu active" 
                      style={{ position: 'fixed', bottom: window.innerHeight - dropdownPos.top + 50, left: dropdownPos.left, zIndex: 9999, margin: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canEdit && <button className="card-dropdown-item" onClick={(e) => { 
                        e.stopPropagation(); setDropdownOpen(false); 
                        if(onEdit) onEdit(); else navigate(`/society/posts`);
                      }}>Edit Post</button>}
                      <button className="card-dropdown-item delete" onClick={(e) => { 
                        e.stopPropagation(); setDropdownOpen(false); 
                        setShowDeleteConfirm(true);
                      }}>Delete Post</button>
                    </div>,
                    document.body
                  )}
                </div>
              )}
              {showDeleteConfirm && createPortal(
                <div id="delete-confirm-modal" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}>
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
                        } catch(err) {
                          globalNotification.triggerFailed('Failed to delete post');
                        }
                      }}>Delete</button>
                    </div>
                  </div>
                </div>, document.body
              )}
              <button 
                type="button" 
                className="card-button open-details-btn visible flex-1" style={{ height: "48px", borderRadius: "9999px" }}
                onClick={(e) => { e.stopPropagation(); openCard(false); }}
              >
                View Details
              </button>
            </div>
            )}
          </div>
        </div>

        {/* BACK FACE */}
        <div className="card-face card-back">
          <img src={coverImage} alt="Post Background" className="back-bg-image" />
          <div className="card-back-inner">
            <button 
              type="button" 
              className="close-btn" 
              style={{ background: 'rgba(255, 255, 255, 0.1)' }} 
              aria-label="Close details"
              onClick={(e) => { e.stopPropagation(); closeCard(); }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="back-content-section" style={{ paddingTop: '24px', marginTop: '48px' }}>
              <div className="profile-header pb-4 mb-5 border-b border-gray-700">
                <img 
                  src={logoImage} 
                  alt={authorName} 
                  className="avatar" 
                  style={{ width: '48px', height: '48px' }}
                  onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} 
                />
                <div className="author-name-group">
                  <span className="author-name" style={{ fontSize: '1.05rem' }}>{authorName}</span>
                  <span className="post-timestamp">Posted: {formattedDate} • {formattedTime}</span>
                </div>
              </div>

              <div className="scroll-area">
                <div className="flex flex-col gap-3 mb-6">
                  {item.title && <h4 className="card-title back-title">{item.title}</h4>}
                  <p className="card-description back-description whitespace-pre-wrap">{item.content}</p>
                </div>
              </div>
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
