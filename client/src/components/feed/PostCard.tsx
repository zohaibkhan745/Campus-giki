import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import type { PostFeedItem } from '@/types/feed.types';

interface PostCardProps {
  item: PostFeedItem;
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const PostCard: React.FC<PostCardProps> = ({ item }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80';
  const coverImage = item.imageUrl || fallbackImage;

  // Blur background when flipped
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

  return (
    <>
      <style>{`
        .post-card-wrapper {
          position: relative; width: 100%; max-width: 340px; height: 490px;
          perspective: 1200px;
          z-index: 1;
        }

        .post-card-wrapper.is-active {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) !important;
          z-index: 50;
          width: 360px;
          height: 520px;
        }

        .post-card-flipper {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
        }

        .post-card-flipper.flipped {
          transform: rotateY(180deg);
        }

        .post-card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .post-card-front {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          display: flex;
          flex-direction: column;
        }

        .post-card-back {
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
        className={`post-card-wrapper ${isFlipped ? 'is-active' : ''}`} 
        ref={wrapperRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`post-card-flipper ${isFlipped ? 'flipped' : ''}`}>
          
          {/* FRONT SIDE */}
          <div className="post-card-face post-card-front">
            {item.videoUrl ? (
              <video 
                src={item.videoUrl} 
                className="post-card-image"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <img 
                src={coverImage} 
                alt="Post" 
                className="post-card-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImage;
                }}
              />
            )}
            
            <div className="post-card-overlay">
              <div className="post-user-profile">
                <Link to={`/societies/${item.society.id}`} className="post-profile-header hover:opacity-90 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {item.society.logoUrl ? (
                    <img src={item.society.logoUrl} alt={item.society.name} className="post-avatar" />
                  ) : (
                    <div className="post-avatar">
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <span className="post-author-name">{item.society.name}</span>
                </Link>
                
                <div className="post-meta-info">
                  <div className="post-meta-row">
                    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Posted {getRelativeTime(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              <button type="button" className="post-details-btn" onClick={handleOpenDetails}>
                View Details
              </button>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="post-card-face post-card-back">
            <div className="post-back-image-section">
              {item.videoUrl ? (
                <video 
                  src={item.videoUrl} 
                  controls
                  playsInline
                />
              ) : (
                <img 
                  src={coverImage} 
                  alt="Post content"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImage;
                  }}
                />
              )}
              <button type="button" className="post-close-btn" onClick={handleCloseDetails} aria-label="Close details">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="post-back-content-section">
              <div className="post-society-header">
                <Link to={`/societies/${item.society.id}`} className="flex items-center gap-2 hover:opacity-90 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {item.society.logoUrl ? (
                    <img src={item.society.logoUrl} alt={item.society.name} className="post-society-avatar" />
                  ) : (
                    <div className="post-society-avatar">
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="post-society-text">
                    <h3>{item.society.name}</h3>
                    <p>{item.society.category?.name || 'Society Post'}</p>
                  </div>
                </Link>
              </div>

              <div className="post-meta-info" style={{ flexShrink: 0 }}>
                <div className="post-meta-row">
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{getRelativeTime(item.createdAt)}</span>
                </div>
              </div>

              <div className="post-about-post">
                <p>{item.content}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
