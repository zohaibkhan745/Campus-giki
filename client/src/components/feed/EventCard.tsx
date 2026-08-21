import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, X, Edit2, Trash2 } from 'lucide-react';
import type { EventFeedItem } from '@/types/feed.types';

interface EventCardProps {
  item: EventFeedItem;
}

export const EventCard: React.FC<EventCardProps> = ({ item }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showReadMore, setShowReadMore] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const backTextRef = useRef<HTMLParagraphElement>(null);
  const frontDescRef = useRef<HTMLParagraphElement>(null);
  
  const coverImage = item.coverImageUrl;
  const isGlass = !coverImage;
  const defaultHeight = 490;

  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  
  const eventDateObj = new Date(item.eventDate || item.createdAt);
  const eventDate = eventDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  // startTime might be an ISO string or just "HH:mm"
  let eventTime = item.startTime;
  if (item.startTime && item.startTime.includes('T')) {
    eventTime = new Date(item.startTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  
  const isOfficial = item.isAdminPost || !item.society;
  const logoImage = isOfficial ? '/giki-logo.png' : item.society?.logoUrl || '/giki-logo.png';
  const authorName = item.society?.name || 'Society';

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
  }, [item.description, isGlass]);

  // Handle document body class for blur effect
  useEffect(() => {
    if (isFlipped) {
      document.body.classList.add('is-focused');
      const backdrop = document.getElementById('global-focus-backdrop');
      if (backdrop) backdrop.classList.add('active');
    } else {
      document.body.classList.remove('is-focused');
      const backdrop = document.getElementById('global-focus-backdrop');
      if (backdrop) backdrop.classList.remove('active');
    }
    
    return () => {
      // Only remove if this was the last flipped card
      // A simple approach: we could just remove it, but it might un-blur if rapidly clicking another.
      // For this isolated component, we just remove it on unmount or unflip.
      if (isFlipped) {
        document.body.classList.remove('is-focused');
        const backdrop = document.getElementById('global-focus-backdrop');
        if (backdrop) backdrop.classList.remove('active');
      }
    };
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
        className={`card-wrapper glass-card-wrapper glass-with-meta \${isFlipped ? 'in-focus' : ''}`}
        style={{ height: `${defaultHeight}px` }}
      >
        <div className={`card-flipper \${isFlipped ? 'flipped' : ''}`}>
          
          <div className="card-face glass-face-front">
            <span className="card-corner-tag">Event</span>
            <div className="glass-front-content">
              <div className="glass-header-area">
                <span className="post-timestamp">Posted: {formattedDate}</span>
                <h3 className="glass-title">{item.title}</h3>
              </div>

              <div className="glass-meta-group">
                <div className="meta-row">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{eventDate} • {eventTime}</span>
                </div>
                {item.venue && (
                  <div className="meta-row">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{item.venue}</span>
                  </div>
                )}
              </div>
              
              <p ref={frontDescRef} className="glass-description">
                {item.description}
              </p>
            </div>
            {showReadMore && (
              <button type="button" onClick={handleOpen} className="details-btn open-details-btn">View Details</button>
            )}
          </div>

          <div className="card-face glass-face-back">
            <div className="glass-back-header">
              <div>
                <span className="post-timestamp">Posted: {formattedDate}</span>
                <h4 className="glass-back-heading">{item.title}</h4>
              </div>
              <button type="button" onClick={handleClose} className="glass-close-btn" aria-label="Close details">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="glass-back-scroll-area">
              <div className="glass-meta-group mb-2">
                <div className="meta-row">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{eventDate} • {eventTime}</span>
                </div>
                {item.venue && (
                  <div className="meta-row">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{item.venue}</span>
                  </div>
                )}
              </div>
              <p ref={backTextRef} className="glass-back-text"></p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // IMAGE EVENT
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
          <span className="card-corner-tag">Event</span>
          <img src={coverImage} alt="Event Cover" className="card-image" />
          
          <div className="card-overlay">
            <div className="user-profile">
              <div className="profile-header">
                <img src={logoImage} alt={authorName} className="avatar" />
                <div className="author-name-group">
                  <span className="author-name">{authorName}</span>
                  <span className="post-timestamp">Posted: {formattedDate}</span>
                </div>
              </div>
              
              <div className="event-meta">
                <div className="meta-row">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{eventDate} • {eventTime}</span>
                </div>
                {item.venue && (
                  <div className="meta-row">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{item.venue}</span>
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={handleOpen} className="details-btn open-details-btn">View Details</button>
          </div>
        </div>

        <div className="card-face card-back">
          <div className="back-image-section">
            <img src={coverImage} alt="Event Cover" />
            <button type="button" onClick={handleClose} className="close-btn" aria-label="Close details">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="back-content-section">
            <div className="society-header">
              <img src={logoImage} alt={authorName} className="society-avatar" />
              <div className="society-text">
                <h3>{authorName}</h3>
                <p>Posted: {formattedDate}</p>
              </div>
            </div>

            <div className="event-back-scroll-area">
              <div className="back-meta mb-2">
                <div className="meta-row">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{eventDate} • {eventTime}</span>
                </div>
                {item.venue && (
                  <div className="meta-row">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{item.venue}</span>
                  </div>
                )}
              </div>

              <div className="about-event">
                <h4>About Event</h4>
                <p>{item.description}</p>
              </div>
            </div>

            <Link to={`/events/\${item.id}`} className="register-btn">
              <span>Register Now</span>
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
