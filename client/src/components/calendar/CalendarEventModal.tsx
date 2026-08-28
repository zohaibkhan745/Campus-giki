import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { getSocietyLogo } from '@/lib/utils';
import { Link } from 'react-router-dom';

export const CalendarEventModal = ({ event, sourceRect, onClose }: { event: any, sourceRect: DOMRect, onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 400); 
  };

  if (!event || !sourceRect) return null;

  const authorName = event.society?.name || 'Campus Admin';
  const logoImage = getSocietyLogo(event.society?.logoUrl);
  const coverImage = event.coverImageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80';
  
  const eventDate = event.startDate ? format(new Date(event.startDate), 'EEE, MMM d, yyyy') : '';
  const eventTime = event.startDate ? format(new Date(event.startDate), 'h:mm a') : '';
  const formattedDate = event.createdAt ? format(new Date(event.createdAt), 'MMM d, yyyy') : '';

  return createPortal(
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-md z-[1000] transition-opacity duration-400 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      />
      <div 
        ref={modalRef}
        className="fixed z-[1001] rounded-[20px] overflow-hidden flex flex-col border border-white/20 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)] event-card-wrapper"
        style={{
          top: isOpen ? '50%' : sourceRect.top + 'px',
          left: isOpen ? '50%' : sourceRect.left + 'px',
          width: isOpen ? '560px' : sourceRect.width + 'px',
          height: isOpen ? '560px' : sourceRect.height + 'px',
          transform: isOpen ? 'translate(-50%, -50%)' : 'none',
          maxWidth: '90vw',
          maxHeight: '90vh',
          background: 'rgba(25, 27, 34, 0.95)',
          backdropFilter: 'blur(25px)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="card-face card-back !shadow-none !w-full !h-full relative" style={{ transform: 'none', transition: 'opacity 0.2s', opacity: isOpen ? 1 : 0, transitionDelay: isOpen ? '0.2s' : '0s' }}>
          <img src={coverImage} alt="Event Cover" className="back-bg-image" />
          <div className="card-back-inner !top-0 !left-0 !w-full !h-full" style={{ transform: 'none' }}>
            <button 
              type="button" 
              className="close-btn" 
              aria-label="Close details"
              onClick={handleClose}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="back-content-section h-full flex flex-col p-8">
              <div className="profile-header pb-4 mb-5 border-b border-gray-700 flex items-center gap-3">
                <img 
                  src={logoImage} 
                  alt={authorName} 
                  className="avatar rounded-full border border-white/20" 
                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} 
                />
                <div className="author-name-group flex flex-col">
                  <span className="author-name font-bold text-white" style={{ fontSize: '1.05rem' }}>{authorName}</span>
                  <span className="post-timestamp text-sm text-gray-400">Posted: {formattedDate}</span>
                </div>
              </div>

              <div className="scroll-area flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="event-meta mb-6 flex flex-col gap-2">
                  <div className="meta-row text-gray-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{eventDate} • {eventTime}</span>
                  </div>
                  {event.venue && (
                    <div className="meta-row text-gray-100 flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{event.venue}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  <h4 className="card-title text-[1.25rem] font-bold text-white">{event.title}</h4>
                  <p className="card-description text-gray-200">{event.description}</p>
                </div>
              </div>

              <div className="mt-auto pt-4">
                {event.registrationLink ? (
                  <a href={event.registrationLink.startsWith('http') ? event.registrationLink : `https://${event.registrationLink}`} target="_blank" rel="noopener noreferrer" className="register-btn flex items-center justify-center w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors">
                    <span>Register Now <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
                  </a>
                ) : (
                  <Link to={`/events/${event.id}`} className="register-btn flex items-center justify-center w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors">
                    <span>View Event <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
