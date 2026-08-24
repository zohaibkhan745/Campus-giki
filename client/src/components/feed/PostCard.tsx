import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getSocietyLogo } from '@/lib/utils';
import type { PostFeedItem } from '@/types/feed.types';
import { useCardFlip } from '@/hooks/useCardFlip';
import { useAuth } from '@/context/AuthContext';

interface PostCardProps {
  item: PostFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ item, onEdit, onDelete }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const frontDescRef = useRef<HTMLParagraphElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);
  const [showButton, setShowButton] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dropdownOpen) {
      setDropdownOpen(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 8, left: rect.left });
    setDropdownOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) {
      setTimeout(() => window.addEventListener('click', handleClickOutside), 10);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  
  const { isActive, openCard, closeCard } = useCardFlip(wrapperRef);
  const { user } = useAuth();
  const canEditOrDelete = user?.role === 'DSA_ADMIN' || (user?.role === 'SOCIETY' && user.society?.id === item.society.id);

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
            {canEditOrDelete && (
            <div className="menu-container">
              
              <button 
                type="button" 
                className="three-dots-btn" 
                aria-label="Options"
                ref={buttonRef}
                onClick={toggleDropdown}
              >

                <svg viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="2.5"></circle>
                  <circle cx="12" cy="12" r="2.5"></circle>
                  <circle cx="19" cy="12" r="2.5"></circle>
                </svg>
              </button>
            </div>
            )}
            <span className="card-tag">Post</span>
            {dropdownOpen && createPortal(
              <div 
                className="dropdown-menu active" 
                style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999, margin: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="dropdown-item" onClick={() => { if(onEdit) onEdit(); setDropdownOpen(false); }}>Edit Post</button>
                <button className="dropdown-item delete" onClick={() => { if(onDelete) onDelete(); setDropdownOpen(false); }}>Delete Post</button>
              </div>,
              document.body
            )}
          </div>

          <div className="glass-overlay">
            <div className="user-profile">
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

              <div className="front-text-content" ref={textContentRef}>
                {item.title && <h3 className="card-title">{item.title}</h3>}
                <p className="front-description" ref={frontDescRef}>{item.content}</p>
              </div>
            </div>

            {showButton && (
              <button 
                type="button" 
                className="card-button open-details-btn visible"
                onClick={(e) => { e.stopPropagation(); openCard(false); }}
              >
                View Details
              </button>
            )}
          </div>
        </div>

        {/* BACK FACE */}
        <div className="card-face card-back">
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
                <p className="card-description back-description">{item.content}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
