import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { EventFeedItem } from '@/types/feed.types';
import { Building2 } from 'lucide-react';

interface EventCardProps {
  item: EventFeedItem;
  allowExpand?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const formattedDate = new Date(item.eventDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const fallbackImage = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80';
  const coverImage = item.coverImageUrl || fallbackImage;

  // Added logic for blurring other things and closing when clicked outside
  useEffect(() => {
    if (isFlipped) {
      document.body.classList.add('card-flipped-active');
      const handleGlobalClick = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setIsFlipped(false);
        }
      };
      document.addEventListener('click', handleGlobalClick);
      return () => {
        document.removeEventListener('click', handleGlobalClick);
        document.body.classList.remove('card-flipped-active');
      };
    } else {
      document.body.classList.remove('card-flipped-active');
    }
  }, [isFlipped]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped || !wrapperRef.current) return;
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
    if (!isFlipped && wrapperRef.current) {
      wrapperRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  };

  const handleOpenDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(true);
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  };

  const handleCloseDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.registrationLink) {
      window.open(item.registrationLink, '_blank');
    }
  };

  return (
    <>
      <style>{`
        .event-card-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 400px;
          perspective: 1200px;
          z-index: 1;
        }

        .event-card-wrapper.is-active {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) !important;
          z-index: 50;
          width: 360px;
          height: 520px;
        }

        .event-card-flipper {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
        }

        .event-card-flipper.flipped {
          transform: rotateY(180deg);
        }

        .event-card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .event-card-front {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          display: flex;
          flex-direction: column;
        }

        .event-card-back {
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(25px) saturate(200%);
          -webkit-backdrop-filter: blur(25px) saturate(200%);
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        `}</style>
        
        {isFlipped && (
          <div 
            className="fixed inset-0 bg-[#050507]/60 backdrop-blur-md z-40"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
          />
        )}
  
      
      <div 
        className={`event-card-wrapper ${isFlipped ? 'is-active' : ''}`} 
        ref={wrapperRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`event-card-flipper ${isFlipped ? 'flipped' : ''}`}>
          
          {/* FRONT SIDE */}
          <div className="event-card-face event-card-front">
            <img 
              src={coverImage} 
              alt={item.title} 
              className="event-card-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackImage;
              }}
            />
            
            <div className="event-card-overlay">
              <div className="event-user-profile">
                <Link to={`/societies/${item.society.id}`} className="event-profile-header hover:opacity-90 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {item.society.logoUrl ? (
                    <img src={item.society.logoUrl} alt={item.society.name} className="event-avatar" />
                  ) : (
                    <div className="event-avatar">
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <span className="event-author-name">{item.title}</span>
                </Link>
                
                <div className="event-meta-info">
                  <div className="event-meta-row">
                    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{formattedDate} • {item.startTime}</span>
                  </div>
                  <div className="event-meta-row">
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>{item.venue}</span>
                  </div>
                </div>
              </div>

              <button type="button" className="event-details-btn" onClick={handleOpenDetails}>
                View Details
              </button>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="event-card-face event-card-back">
            <div className="event-back-image-section">
              <img 
                src={coverImage} 
                alt={item.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImage;
                }}
              />
              <button type="button" className="event-close-btn" onClick={handleCloseDetails} aria-label="Close details">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="event-back-content-section">
              <div className="event-society-header">
                <Link to={`/societies/${item.society.id}`} className="flex items-center gap-2 hover:opacity-90 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {item.society.logoUrl ? (
                    <img src={item.society.logoUrl} alt={item.society.name} className="event-society-avatar" />
                  ) : (
                    <div className="event-society-avatar">
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="event-society-text">
                    <h3>{item.society.name}</h3>
                    <p>{item.society.category?.name || 'Society Event'}</p>
                  </div>
                </Link>
              </div>

              <div className="event-meta-info" style={{ flexShrink: 0 }}>
                <div className="event-meta-row">
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{formattedDate} • {item.startTime}</span>
                </div>
                <div className="event-meta-row">
                  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>{item.venue}</span>
                </div>
              </div>

              <div className="event-about-event">
                <h4>About Event</h4>
                <p>{item.description}</p>
              </div>

              {item.registrationLink && (
                <button type="button" className="event-register-btn" onClick={handleRegister}>
                  <span>Register Now</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
