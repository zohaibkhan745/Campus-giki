import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMediaUrl } from '@/lib/api';
import { X, Edit2, Trash2 } from 'lucide-react';
import type { PostFeedItem } from '@/types/feed.types';

interface PostCardProps {
  item: PostFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ item, onEdit, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showReadMore, setShowReadMore] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const backTextRef = useRef<HTMLParagraphElement>(null);
  const frontDescRef = useRef<HTMLParagraphElement>(null);

  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedTime = new Date(item.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const coverImage = getMediaUrl(item.imageUrl);
  const isGlass = !coverImage;
  const defaultHeight = 490;
  
  const logoImage = item.society?.logoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const authorName = item.society?.name || 'Admin';

  // Sync text to back face and check overflow
  useLayoutEffect(() => {
    if (isGlass && frontDescRef.current && backTextRef.current) {
      backTextRef.current.textContent = frontDescRef.current.textContent?.trim() || '';
      
      // Check overflow for Read More button
      if (frontDescRef.current.scrollHeight > frontDescRef.current.offsetHeight + 2) {
        setShowReadMore(true);
      } else {
        setShowReadMore(false);
      }
    } else if (!isGlass) {
      // For image cards, we always show View Details button
      setShowReadMore(true);
    }
  }, [item.content, isGlass]);

  // Handle document body class for blur effect
  useEffect(() => {
    if (isFlipped) {
      document.body.classList.add('is-focused');
      
      const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          // It's an outside click, simulate handleClose
          setIsFlipped(false);
          if (wrapperRef.current) {
            wrapperRef.current.style.height = `${defaultHeight}px`;
          }
          document.body.classList.remove('is-focused');
        }
      };
      
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick, { passive: true });
      
      return () => {
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
        document.body.classList.remove('is-focused');
      };
    }
  }, [isFlipped]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFlipped || !wrapperRef.current || isGlass) return; 

    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    wrapperRef.current.style.transform = `rotateX(\${rotateX}deg) rotateY(\${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!isFlipped && wrapperRef.current && !isGlass) {
      wrapperRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(true);
    
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
      
      // Calculate dynamic height
      let calculatedHeight = defaultHeight;
      if (isGlass) {
        const header = wrapperRef.current.querySelector(".glass-back-header") as HTMLElement;
        const scrollArea = wrapperRef.current.querySelector(".glass-back-scroll-area") as HTMLElement;
        if (header && scrollArea) {
          const neededHeight = header.offsetHeight + scrollArea.scrollHeight + 56;
          calculatedHeight = Math.min(620, Math.max(defaultHeight, neededHeight));
        }
      } else {
        const backContent = wrapperRef.current.querySelector(".back-content-section") as HTMLElement;
        const imageSectionHeight = 150;
        const contentHeight = backContent ? backContent.scrollHeight : 280;
        calculatedHeight = Math.min(620, Math.max(defaultHeight, imageSectionHeight + contentHeight));
      }
      
      wrapperRef.current.style.height = `\${calculatedHeight}px`;
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    if (wrapperRef.current) {
      wrapperRef.current.style.height = `\${defaultHeight}px`;
    }
    document.body.classList.remove('is-focused');
  };

  if (isGlass) {
    return (
      <div 
        ref={wrapperRef}
        className={`card-wrapper glass-card-wrapper glass-no-meta \${isFlipped ? 'in-focus' : ''}`}
        style={{ height: `${defaultHeight}px` }}
      >
        <div className={`card-flipper \${isFlipped ? 'flipped' : ''}`}>
          
          <div className="card-face glass-face-front">
            <span className="card-corner-tag">Post</span>
            <div className="glass-front-content">
              <div className="glass-header-area">
                <span className="post-timestamp">Posted: {formattedDate} • {formattedTime}</span>
                <div className="flex justify-between items-start w-full">
                  <h3 className="glass-title">{authorName}</h3>
                  {(onEdit || onDelete) && (
                    <div className="flex items-center gap-1 z-30">
                      {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-white/70 hover:text-white transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>}
                      {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-white/70 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  )}
                </div>
              </div>
              
              <p ref={frontDescRef} className="glass-description">
                {item.content}
              </p>
            </div>
            {showReadMore && (
              <button type="button" onClick={handleOpen} className="details-btn open-details-btn">Read More</button>
            )}
          </div>

          <div className="card-face glass-face-back">
            <div className="glass-back-header">
              <div>
                <span className="post-timestamp">Posted: {formattedDate} • {formattedTime}</span>
                <h4 className="glass-back-heading">{authorName}</h4>
              </div>
              <button type="button" onClick={handleClose} className="glass-close-btn" aria-label="Close details">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="glass-back-scroll-area">
              <p ref={backTextRef} className="glass-back-text"></p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // IMAGE POST
  return (
    <div 
      ref={wrapperRef}
      className={`card-wrapper event-card-wrapper \${isFlipped ? 'in-focus' : ''}`}
      style={{ height: `${defaultHeight}px` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`card-flipper \${isFlipped ? 'flipped' : ''}`}>
        
        <div className="card-face card-front">
          <span className="card-corner-tag">Post</span>
          <img src={coverImage} alt="Post Cover" className="card-image" />
          
          <div className="card-overlay">
            <div className="user-profile">
              <div className="profile-header w-full flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src={logoImage} alt={authorName} className="avatar" />
                  <div className="author-name-group">
                    <span className="author-name">{authorName}</span>
                    <span className="post-timestamp">Posted: {formattedDate} • {formattedTime}</span>
                  </div>
                </div>
                
                {(onEdit || onDelete) && (
                  <div className="flex items-center gap-1 z-30 mr-12">
                    {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-white/70 hover:text-white transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>}
                    {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-white/70 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={handleOpen} className="details-btn open-details-btn">View Details</button>
          </div>
        </div>

        <div className="card-face card-back">
          <div className="back-image-section">
            <img src={coverImage} alt="Post Cover" />
            <button type="button" onClick={handleClose} className="close-btn" aria-label="Close details">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="back-content-section">
            <div className="society-header">
              <img src={logoImage} alt={authorName} className="society-avatar" />
              <div className="society-text">
                <h3>{authorName}</h3>
                <p>Posted: {formattedDate} • {formattedTime}</p>
              </div>
            </div>

            <div className="event-back-scroll-area">
              <div className="about-event">
                <h4>About Post</h4>
                <p>{item.content}</p>
              </div>
            </div>

            <Link to={`/posts/${item.id}`} className="register-btn" style={{marginTop: 'auto'}}>
              <span>Read Full Details</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
