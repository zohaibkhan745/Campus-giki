import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, X } from 'lucide-react';
import type { PostFeedItem } from '@/types/feed.types';

import { Edit2, Trash2 } from 'lucide-react';

interface PostCardProps {
  item: PostFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ item, onEdit, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);
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

  const coverImage = item.imageUrl;
  
  // Extract society info, defaulting to author info if not a society post (like DSA admin)
  const isSociety = !!item.society;
  const logoImage = item.society?.logoUrl || item.society?.logoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const authorName = item.society?.name || item.society?.name || 'Admin';
  
  const hasMeta = false; // Posts don't have meta rows like Events

  useEffect(() => {
    if (frontDescRef.current && backTextRef.current) {
      backTextRef.current.textContent = frontDescRef.current.textContent?.trim() || '';
    }
  }, [item.content]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFlipped || !wrapperRef.current || !coverImage) return; // Only parallax for image cards

    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    wrapperRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!isFlipped && wrapperRef.current && coverImage) {
      wrapperRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(true);
    if (wrapperRef.current && coverImage) {
      wrapperRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
  };

  if (!coverImage) {
    // TEXT ONLY POST (GLASSMORPHISM)
    return (
      <div 
        ref={wrapperRef}
        className={`card-wrapper glass-card-wrapper glass-no-meta ${isFlipped ? 'in-focus' : ''}`}
        style={{ height: isFlipped ? '620px' : '490px' }} // Simplify height calculation to max
      >
        <div className={`card-flipper ${isFlipped ? 'flipped' : ''}`}>
          
          {/* Front Side */}
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
            <button type="button" onClick={handleOpen} className="details-btn open-details-btn">Read More</button>
          </div>

          {/* Back Side */}
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
      className={`card-wrapper event-card-wrapper ${isFlipped ? 'in-focus' : ''}`}
      style={{ height: isFlipped ? '620px' : '490px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`card-flipper ${isFlipped ? 'flipped' : ''}`}>
        
        {/* Front Side */}
        <div className="card-face card-front">
          <span className="card-corner-tag">Post</span>
          <img src={coverImage} alt="Post Cover" className="card-image" />
          
          <div className="card-overlay">
            <div className="user-profile">
              <div className="profile-header flex justify-between w-full">
                <div className="flex items-center gap-3">
                  <img src={logoImage} alt={authorName} className="avatar" />
                  <div className="author-name-group">
                    <span className="author-name">{authorName}</span>
                    <span className="post-timestamp">Posted: {formattedDate}</span>
                  </div>
                </div>
                {(onEdit || onDelete) && (
                  <div className="flex items-center gap-1 z-30 mr-2">
                    {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-white/80 hover:text-white bg-black/20 rounded-full transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>}
                    {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-white/80 hover:text-red-400 bg-black/20 rounded-full transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={handleOpen} className="details-btn open-details-btn">View Details</button>
          </div>
        </div>

        {/* Back Side */}
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

            {isSociety && (
              <Link to={`/societies/${item.society!.id}`} className="register-btn">
                <span>View Society Profile</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
