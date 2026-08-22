import React, { useRef, useState, useEffect } from 'react';
import { MoreHorizontal, Calendar, MapPin, X, Trash2, Edit2 } from 'lucide-react';

import { getMediaUrl } from '@/lib/api';
import { createPortal } from 'react-dom';

interface FeedCardProps {
  item: any;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const FeedCard: React.FC<FeedCardProps> = ({ item, onEdit, onDelete, showActions }) => {
  const isEvent = !!item.venue || !!item.startDate;
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flipperRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Formatting helpers
  const displayName = item.author?.society?.name || item.author?.fullName || item.society?.name || 'Unknown User';
  const displayAvatar = getMediaUrl(item.author?.society?.logoUrl || item.author?.avatarUrl || item.society?.logoUrl || '');
  const timestamp = item.createdAt ? format(new Date(item.createdAt), 'MMM dd, yyyy • hh:mm a') : '';
  const imageUrl = getMediaUrl(item.imageUrl || item.bannerUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80');

  // Mouse tilt effect
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (wrapper.classList.contains('in-focus')) return;
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      if (!wrapper.classList.contains('in-focus')) {
        wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
      }
    };

    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const openCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);
    
    const wrapper = wrapperRef.current;
    const flipper = flipperRef.current;
    if (!wrapper || !flipper) return;

    if (isEvent) {
      // Event Card Logic
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      wrapper.style.position = 'fixed';
      wrapper.style.top = (centerY - 245) + 'px';
      wrapper.style.left = (centerX - 170) + 'px';
      wrapper.style.width = '340px';
      wrapper.style.height = '490px';
      wrapper.style.margin = '0';
      wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';

      const placeholder = document.createElement('div');
      placeholder.className = 'card-placeholder';
      placeholder.style.width = '340px';
      placeholder.style.height = '490px';
      wrapper.parentNode?.insertBefore(placeholder, wrapper);

      document.body.classList.add('is-focused');
      wrapper.classList.add('in-focus', 'fading-front');
      flipper.classList.add('flipped');
      
      let backdrop = document.getElementById('focusBackdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'focusBackdrop';
        backdrop.className = 'focus-backdrop active';
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', () => closeCardRef.current?.());
      } else {
        backdrop.classList.add('active');
        backdrop.onclick = () => closeCardRef.current?.();
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrapper.classList.add('has-transition');
          const wideWidth = 560;
          const wideHeight = 660;
          wrapper.style.width = wideWidth + 'px';
          wrapper.style.height = wideHeight + 'px';
          wrapper.style.top = `calc(50% - ${wideHeight / 2}px)`;
          wrapper.style.left = `calc(50% - ${wideWidth / 2}px)`;
        });
      });

      setTimeout(() => wrapper.classList.add('show-back'), 300);
    } else {
      // Post Card Logic
      const startRect = wrapper.getBoundingClientRect();
      wrapper.style.position = 'fixed';
      wrapper.style.top = startRect.top + 'px';
      wrapper.style.left = startRect.left + 'px';
      wrapper.style.margin = '0';
      wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';

      const placeholder = document.createElement('div');
      placeholder.className = 'card-placeholder';
      placeholder.style.width = '340px';
      placeholder.style.height = '490px';
      wrapper.parentNode?.insertBefore(placeholder, wrapper);

      const targetTop = (window.innerHeight - 490) / 2;
      const targetLeft = (window.innerWidth - 340) / 2;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrapper.classList.add('has-transition', 'in-focus', 'fading-front');
          flipper.classList.add('flipped');
          document.body.classList.add('is-focused');
          
          let backdrop = document.getElementById('focusBackdrop');
          if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'focusBackdrop';
            backdrop.className = 'focus-backdrop active';
            document.body.appendChild(backdrop);
            backdrop.addEventListener('click', () => closeCardRef.current?.());
          } else {
            backdrop.classList.add('active');
            backdrop.onclick = () => closeCardRef.current?.();
          }

          wrapper.style.top = targetTop + 'px';
          wrapper.style.left = targetLeft + 'px';

          setTimeout(() => wrapper.classList.add('show-back'), 300);
        });
      });
    }
  };

  const closeCard = () => {
    const wrapper = wrapperRef.current;
    const flipper = flipperRef.current;
    if (!wrapper || !flipper) return;

    document.body.classList.remove('is-focused');
    const backdrop = document.getElementById('focusBackdrop');
    if (backdrop) backdrop.classList.remove('active');
    
    wrapper.classList.remove('show-back');
    flipper.classList.remove('flipped');
    wrapper.classList.remove('in-focus');

    const placeholder = wrapper.previousElementSibling;
    if (placeholder && placeholder.classList.contains('card-placeholder')) {
      const rect = placeholder.getBoundingClientRect();
      if (isEvent) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            wrapper.style.top = rect.top + 'px';
            wrapper.style.left = rect.left + 'px';
            wrapper.style.width = '340px';
            wrapper.style.height = '490px';
          });
        });
      } else {
        wrapper.style.top = rect.top + 'px';
        wrapper.style.left = rect.left + 'px';
      }
    }

    setTimeout(() => wrapper.classList.remove('fading-front'), 300);

    setTimeout(() => {
      wrapper.classList.remove('has-transition');
      wrapper.style.position = 'relative';
      wrapper.style.top = '';
      wrapper.style.left = '';
      wrapper.style.width = '';
      wrapper.style.height = '';
      wrapper.style.margin = '';
      wrapper.style.transform = '';
      if (placeholder && placeholder.classList.contains('card-placeholder')) {
        placeholder.remove();
      }
    }, 800);
  };

  const closeCardRef = useRef(closeCard);
  closeCardRef.current = closeCard;

  const handleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const clickOut = () => setDropdownOpen(false);
    document.addEventListener('click', clickOut);
    return () => document.removeEventListener('click', clickOut);
  }, []);

  const renderDropdown = () => {
    if (!showActions || (!onEdit && !onDelete)) return null;
    return (
      <div className="menu-container">
        <button type="button" className="three-dots-btn" onClick={handleDropdown}>
          <MoreHorizontal className="w-[18px] h-[18px]" />
        </button>
        <div className={`card-dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
          {onEdit && <button className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); onEdit(); }}><Edit2 className="w-4 h-4"/> Edit</button>}
          {onDelete && <button className="flex items-center gap-2 delete" onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); onDelete(); }}><Trash2 className="w-4 h-4"/> Delete</button>}
        </div>
      </div>
    );
  };

  return (
    <div ref={wrapperRef} className={`card-wrapper ${isEvent ? 'event-card-wrapper' : 'post-card-wrapper'}`}>
      <div ref={flipperRef} className="card-flipper">
        
        {/* FRONT FACE */}
        <div className="card-face card-front">
          {isEvent ? (
            <img src={imageUrl} alt="Event" className="card-image" />
          ) : (
            <div className="glass-card-bg"></div>
          )}

          <div className="card-top-bar">
            {renderDropdown()}
            <span className="card-tag">{isEvent ? 'Event' : 'Post'}</span>
          </div>

          <div className={isEvent ? 'card-overlay' : 'glass-overlay'}>
            <div className="user-profile">
              <div className="profile-header">
                <img src={displayAvatar} alt="Profile" className="avatar" />
                <div className="author-name-group">
                  <span className="author-name">{displayName}</span>
                  <span className="post-timestamp">Posted: {timestamp}</span>
                </div>
              </div>

              {isEvent ? (
                <>
                  <div className="mt-2">
                    <h3 className="card-title text-white">{item.title}</h3>
                  </div>
                  <div className="event-meta mt-2">
                    <div className="meta-row">
                      <Calendar className="w-[15px] h-[15px]" />
                      <span>{item.startDate ? format(new Date(item.startDate), 'E, MMM dd, yyyy, hh:mm a') : 'TBA'}</span>
                    </div>
                    <div className="meta-row">
                      <MapPin className="w-[15px] h-[15px]" />
                      <span>{item.venue || 'TBA'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="front-text-content is-clamped">
                  <h3 className="card-title text-white">{item.title}</h3>
                  <p className="front-description clamped" style={{ WebkitLineClamp: 4 }}>{item.content}</p>
                </div>
              )}
            </div>
            
            <button type="button" className={`card-button ${!isEvent ? 'visible mt-auto' : ''}`} onClick={openCard}>
              View Details
            </button>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="card-face card-back">
          {isEvent ? (
            <div className="card-back-inner">
              <div className="back-image-section">
                <img src={imageUrl} alt="Event Cover" />
                <button type="button" className="close-btn" onClick={(e) => { e.stopPropagation(); closeCard(); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="back-content-section">
                <div className="profile-header pb-4 mb-5 border-b border-gray-700">
                  <img src={displayAvatar} alt="Profile" className="avatar" style={{width: 48, height: 48}} />
                  <div className="author-name-group">
                    <span className="author-name" style={{fontSize: '1.05rem'}}>{displayName}</span>
                    <span className="post-timestamp">Posted: {timestamp}</span>
                  </div>
                </div>

                <div className="scroll-area">
                  <div className="event-meta mb-6">
                    <div className="meta-row text-gray-100">
                      <Calendar className="w-[15px] h-[15px]" />
                      <span>{item.startDate ? format(new Date(item.startDate), 'E, MMM dd, yyyy, hh:mm a') : 'TBA'}</span>
                    </div>
                    <div className="meta-row text-gray-100">
                      <MapPin className="w-[15px] h-[15px]" />
                      <span>{item.venue || 'TBA'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mb-6">
                    <h4 className="card-title text-[1.25rem] font-bold text-white">{item.title}</h4>
                    <p className="card-description text-gray-300">{item.description || item.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button type="button" className="close-btn" style={{background: 'rgba(255, 255, 255, 0.1)'}} onClick={(e) => { e.stopPropagation(); closeCard(); }}>
                <X className="w-5 h-5" />
              </button>

              <div className="back-content-section" style={{paddingTop: 24, marginTop: 48}}>
                <div className="profile-header pb-4 mb-5 border-b border-gray-700">
                  <img src={displayAvatar} alt="Profile" className="avatar" style={{width: 48, height: 48}} />
                  <div className="author-name-group">
                    <span className="author-name" style={{fontSize: '1.05rem'}}>{displayName}</span>
                    <span className="post-timestamp">Posted: {timestamp}</span>
                  </div>
                </div>

                <div className="scroll-area">
                  <div className="flex flex-col gap-3 mb-6">
                    <h4 className="card-title text-white">{item.title}</h4>
                    <p className="card-description text-gray-300">{item.content}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
