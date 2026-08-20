import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, X, MapPin } from 'lucide-react';
import type { EventFeedItem } from '@/types/feed.types';

interface EventCardProps {
  item: EventFeedItem;
  allowExpand?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ item }) => {
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
  
  const eventDate = new Date(item.eventDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const eventTime = item.startTime;

  const coverImage = item.coverImageUrl;
  const logoImage = item.society.logoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const authorName = item.society.name;
  
  useEffect(() => {
    if (frontDescRef.current && backTextRef.current) {
      backTextRef.current.textContent = frontDescRef.current.textContent?.trim() || '';
    }
  }, [item.description]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFlipped || !wrapperRef.current || !coverImage) return;

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
    // TEXT ONLY EVENT (GLASSMORPHISM)
    return (
      <div 
        ref={wrapperRef}
        className={`card-wrapper glass-card-wrapper glass-with-meta ${isFlipped ? 'in-focus' : ''}`}
        style={{ height: isFlipped ? '620px' : '490px' }}
      >
        <div className={`card-flipper ${isFlipped ? 'flipped' : ''}`}>
          
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
            <button type="button" onClick={handleOpen} className="details-btn open-details-btn">View Details</button>
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
      className={`card-wrapper event-card-wrapper ${isFlipped ? 'in-focus' : ''}`}
      style={{ height: isFlipped ? '620px' : '490px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`card-flipper ${isFlipped ? 'flipped' : ''}`}>
        
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

            <Link to={`/events/${item.id}`} className="register-btn">
              <span>View Full Details</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
