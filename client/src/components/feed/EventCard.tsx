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
          max-width: 400px;
          height: 500px;
          margin: 0 auto;
          transform-style: preserve-3d;
          transition: transform 0.15s ease-out, filter 0.3s ease;
          perspective: 1200px;
          z-index: 1;
        }

        .card-flipped-active .event-card-wrapper:not(.is-active) {
          filter: blur(4px);
          opacity: 0.6;
          pointer-events: none;
        }
        
        .event-card-wrapper.is-active {
          z-index: 100;
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
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 28px;
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12);
          transform: translateZ(0);
          will-change: transform;
        }

        /* FRONT FACE */
        .event-card-front {
          background: #14161b;
          z-index: 2;
        }

        .event-card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .event-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.65) 0%,
            rgba(0, 0, 0, 0.15) 35%,
            rgba(0, 0, 0, 0.35) 65%,
            rgba(0, 0, 0, 0.85) 100%
          );
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px;
          z-index: 2;
        }

        .event-user-profile {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .event-profile-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .event-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.85);
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          background-color: #1f2937;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .event-author-name {
          color: #ffffff;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.2px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-meta-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .event-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #e2e8f0;
          font-size: 0.85rem;
          font-weight: 500;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.8);
        }

        .event-meta-row svg {
          width: 15px;
          height: 15px;
          fill: none;
          stroke: #cbd5e1;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
          flex-shrink: 0;
        }

        .event-details-btn {
          width: 100%;
          padding: 15px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
          text-align: center;
          outline: none;
          transform: translateZ(1px);
          -webkit-transform: translateZ(1px);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          will-change: transform, background;
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
        }

        .event-details-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateZ(1px) translateY(-2px);
        }

        /* BACK FACE */
        .event-card-back {
          background: #16181d;
          transform: rotateY(180deg) translateZ(0);
          display: flex;
          flex-direction: column;
          z-index: 1;
        }

        .event-back-image-section {
          position: relative;
          height: 180px;
          width: 100%;
          flex-shrink: 0;
        }

        .event-back-image-section img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .event-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.4);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          outline: none;
          transform: translateZ(1px);
          -webkit-transform: translateZ(1px);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          will-change: transform, background;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          z-index: 20;
        }

        .event-close-btn svg {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
        }

        .event-close-btn:hover {
          background: rgba(255, 255, 255, 0.28);
          border-color: rgba(255, 255, 255, 0.55);
          transform: translateZ(1px) scale(1.06);
        }

        .event-back-content-section {
          padding: 18px 20px;
          background: rgba(22, 24, 29, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          overflow-y: auto;
        }
        
        /* Custom scrollbar for back content */
        .event-back-content-section::-webkit-scrollbar {
          width: 4px;
        }
        .event-back-content-section::-webkit-scrollbar-track {
          background: transparent;
        }
        .event-back-content-section::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
        }

        .event-society-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
          flex-shrink: 0;
        }

        .event-society-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          background-color: #1f2937;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .event-society-text h3 {
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 600;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-society-text p {
          color: #94a3b8;
          font-size: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-about-event {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
        }

        .event-about-event h4 {
          color: #cbd5e1;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .event-about-event p {
          color: #94a3b8;
          font-size: 0.82rem;
          line-height: 1.5;
        }

        .event-register-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: #ffffff;
          color: #0f172a;
          border: none;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          margin-top: auto;
          flex-shrink: 0;
        }

        .event-register-btn:hover {
          background: #f1f5f9;
          transform: translateY(-1px);
        }
      `}</style>
      
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
