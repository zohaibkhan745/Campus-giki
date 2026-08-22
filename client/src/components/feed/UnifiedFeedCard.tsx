
import React, { useEffect, useRef } from 'react';
import { getMediaUrl } from '@/lib/api';
import './UnifiedFeedCard.css';

interface Props {
  item: any;
  type: 'EVENT' | 'POST';
  onEdit?: () => void;
  onDelete?: () => void;
}

export const UnifiedFeedCard: React.FC<Props> = ({ item, type, onEdit, onDelete }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  
  const renderDropdown = () => {
    if (!onEdit && !onDelete) return null;
    return (
      <div className="menu-container relative">
        <button 
          type="button" 
          className="three-dots-btn flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 relative" 
          aria-label="Options"
          onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><circle cx="5" cy="12" r="2.5"></circle><circle cx="12" cy="12" r="2.5"></circle><circle cx="19" cy="12" r="2.5"></circle></svg>
        </button>
        {isDropdownOpen && (
          <div className="absolute top-10 right-0 w-32 bg-slate-900 border border-white/20 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col py-1">
            {onEdit && (
              <button 
                type="button" 
                className="text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors font-medium"
                onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); onEdit(); }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                type="button" 
                className="text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors font-bold"
                onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); onDelete(); }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const flipper = wrapper.querySelector('.card-flipper');
    const openBtn = wrapper.querySelector('.open-details-btn');
    const closeBtn = wrapper.querySelector('.close-btn');

    const handleOpen = (e: any) => {
      e.stopPropagation();
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      wrapper.style.position = "fixed";
      if (type === 'EVENT') {
        wrapper.style.top = (centerY - 245) + "px";
        wrapper.style.left = (centerX - 170) + "px";
      } else {
        wrapper.style.top = rect.top + "px";
        wrapper.style.left = rect.left + "px";
      }
      
      wrapper.style.width = "340px";
      wrapper.style.height = "490px";
      wrapper.style.margin = "0";
      wrapper.style.transform = "rotateX(0deg) rotateY(0deg)";

      const placeholder = document.createElement("div");
      placeholder.className = "card-placeholder";
      placeholder.style.width = "340px";
      placeholder.style.height = "490px";
      wrapper.parentNode?.insertBefore(placeholder, wrapper);

      document.body.classList.add("is-focused");
      wrapper.classList.add("in-focus");
      wrapper.classList.add("has-transition");
      wrapper.classList.add("fading-front");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const targetTop = (window.innerHeight - 490) / 2;
            const targetLeft = (window.innerWidth - 340) / 2;
            wrapper.style.top = targetTop + "px";
            wrapper.style.left = targetLeft + "px";

            if (flipper) flipper.classList.add("flipped");
            setTimeout(() => {
                wrapper.classList.add("show-back");
            }, 300);
        });
      });
    };

    const handleClose = (e: any) => {
      e.stopPropagation();
      document.body.classList.remove("is-focused");
      wrapper.classList.remove("show-back");
      if (flipper) flipper.classList.remove("flipped");
      wrapper.classList.remove("in-focus");
      
      const placeholder = wrapper.previousElementSibling;
      if (placeholder && placeholder.classList.contains("card-placeholder")) {
        const rect = placeholder.getBoundingClientRect();
        wrapper.style.top = rect.top + "px";
        wrapper.style.left = rect.left + "px";
      }

      setTimeout(() => {
        wrapper.classList.remove("fading-front");
      }, 300);

      setTimeout(() => {
        wrapper.classList.remove("has-transition");
        wrapper.style.position = "relative";
        wrapper.style.top = "";
        wrapper.style.left = "";
        wrapper.style.transform = "";
        if (placeholder && placeholder.classList.contains("card-placeholder")) {
          placeholder.remove();
        }
      }, 800);
    };

    if (openBtn) openBtn.addEventListener('click', handleOpen);
    if (closeBtn) closeBtn.addEventListener('click', handleClose);

    return () => {
      if (openBtn) openBtn.removeEventListener('click', handleOpen);
      if (closeBtn) closeBtn.removeEventListener('click', handleClose);
    };
  }, [type]);

  if (type === 'EVENT') {
    return (
      <div ref={wrapperRef} className="card-wrapper event-card-wrapper shrink-0">
        <div className="card-flipper">
          <div className="card-face card-front">
            <img src={getMediaUrl(item.coverImageUrl || '/placeholder.jpg')} alt={item.title} className="card-image" />
            <div className="card-top-bar">
              {renderDropdown()}
              <span className="card-tag">Event</span>
            </div>
            <div className="card-overlay">
              <div className="user-profile">
                <div className="profile-header">
                  <img src={item.society?.logoUrl ? getMediaUrl(item.society.logoUrl) : '/giki-mono.jpg'} alt="Author" className="avatar" />
                  <div className="author-name-group">
                    <span className="author-name">{item.society?.name || 'Society'}</span>
                    <span className="post-timestamp">Starts: {item.eventDate ? new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="card-title">{item.title}</h3>
                </div>
                <div className="event-meta mt-2">
                  <div className="meta-row">
                    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{item.startTime} - {item.endTime}</span>
                  </div>
                  <div className="meta-row">
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>{item.venue}</span>
                  </div>
                </div>
              </div>
              <button type="button" className="card-button open-details-btn">View Details</button>
            </div>
          </div>
          <div className="card-face card-back">
            <div className="card-back-inner">
               <div className="back-image-section">
                  <img src={getMediaUrl(item.coverImageUrl || '/placeholder.jpg')} alt="Cover" />
                  <button type="button" className="close-btn" aria-label="Close">
                    <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                  </button>
               </div>
               <div className="back-scroll-content">
                  <h2 className="back-title">{item.title}</h2>
                  <p className="back-desc">{item.description}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="card-wrapper post-card-wrapper shrink-0">
      <div className="card-flipper">
        <div className="card-face card-front">
          {item.imageUrl && <img src={getMediaUrl(item.imageUrl)} alt="Post" className="card-image" />}
          {!item.imageUrl && <div className="card-image bg-vast-ink/50" />}
          <div className="card-top-bar">
              {renderDropdown()}
              <span className="card-tag">Post</span>
          </div>
          <div className="glass-overlay">
             <div className="profile-header">
                <img src={item.author?.society?.logoUrl ? getMediaUrl(item.author.society.logoUrl) : '/giki-mono.jpg'} alt="Author" className="avatar" />
                <div className="author-name-group">
                  <span className="author-name">{item.author?.society?.name || 'User'}</span>
                  <span className="post-timestamp">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                </div>
             </div>
             <div className="post-text-container">
                <h4 className="post-title">{item.title || 'Announcement'}</h4>
                <p className="post-description clamped">{item.content}</p>
             </div>
             <button type="button" className="read-more-btn open-details-btn">Read Full Post</button>
          </div>
        </div>
        <div className="card-face card-back">
           <button type="button" className="close-btn" aria-label="Close">
              <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
           </button>
           <div className="post-back-content">
              <div className="profile-header">
                 <img src={item.author?.society?.logoUrl ? getMediaUrl(item.author.society.logoUrl) : '/giki-mono.jpg'} alt="Author" className="avatar" />
                 <div className="author-name-group">
                   <span className="author-name">{item.author?.society?.name || 'User'}</span>
                   <span className="post-timestamp">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                 </div>
              </div>
              <h2 className="back-title">{item.title || 'Announcement'}</h2>
              <p className="back-desc-post">{item.content}</p>
              {item.imageUrl && (
                 <img src={getMediaUrl(item.imageUrl)} alt="Post Attachment" className="w-full mt-4 rounded-xl border border-white/10" />
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
