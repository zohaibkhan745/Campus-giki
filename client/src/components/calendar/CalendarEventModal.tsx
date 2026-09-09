import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { getSocietyLogo } from '@/lib/utils';
import { Link } from 'react-router-dom';

export const CalendarEventModal = ({ event, sourceRect, bg, color, onClose }: { event: any, sourceRect: DOMRect, bg: string, color: string, onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [targetWidth, setTargetWidth] = useState(560);
  const [targetHeight, setTargetHeight] = useState(560);
  const [targetLeft, setTargetLeft] = useState(0);
  const [targetTop, setTargetTop] = useState(0);

  useEffect(() => {
    // Calculate target position for center of screen
    const tW = Math.min(560, window.innerWidth * 0.9);
    const tH = Math.min(560, window.innerHeight * 0.9);
    const tL = (window.innerWidth - tW) / 2;
    const tT = (window.innerHeight - tH) / 2;
    
    setTargetWidth(tW);
    setTargetHeight(tH);
    setTargetLeft(tL);
    setTargetTop(tT);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    });
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 300); // 0.3s close animation
  };

  if (!event || !sourceRect) return null;

  const authorName = event.society?.name || 'Campus Admin';
  const logoImage = getSocietyLogo(event.society?.logoUrl);
  const coverImage = event.coverImageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80';
  
  const eventDate = event.startDate ? format(new Date(event.startDate), 'EEE, MMM d, yyyy') : '';
  const eventTime = event.startDate ? format(new Date(event.startDate), 'h:mm a') : '';
  const formattedDate = event.createdAt ? format(new Date(event.createdAt), 'MMM d, yyyy') : '';

  // Spring timings from the reference code
  const openTiming = 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), width 0.35s cubic-bezier(0.32, 0.72, 0, 1), height 0.35s cubic-bezier(0.32, 0.72, 0, 1), background-color 0.3s ease';
  const closeTiming = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), width 0.3s cubic-bezier(0.25, 1, 0.5, 1), height 0.3s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.2s ease';

  return createPortal(
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-md z-[1000] ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        style={{ transition: 'opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1)' }}
        onClick={handleClose}
      />
      <div 
        ref={modalRef}
        className={`fixed top-0 left-0 z-[1001] rounded-[20px] overflow-hidden flex flex-col shadow-[0_16px_40px_rgba(0,0,0,0.5)] event-card-wrapper border border-white/20`}
        style={{
          transform: `translate3d(${isOpen ? targetLeft : sourceRect.left}px, ${isOpen ? targetTop : sourceRect.top}px, 0)`,
          width: `${isOpen ? targetWidth : sourceRect.width}px`,
          height: `${isOpen ? targetHeight : sourceRect.height}px`,
          background: isOpen ? 'rgba(25, 27, 34, 0.95)' : bg,
          backdropFilter: isOpen ? 'blur(25px)' : 'none',
          transition: isOpen ? openTiming : closeTiming,
          willChange: 'transform, width, height, background-color',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        {/* Clone Label (Fades out when opening) */}
        <div 
          className="absolute inset-0 flex items-center px-[8px] z-[5] whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            color: color,
            fontSize: '11px',
            fontWeight: 600,
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'scale(0.9)' : 'scale(1)',
            transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: isOpen ? '0s' : '0.12s', // Delay appearing until it shrinks back
            pointerEvents: 'none'
          }}
        >
          {event.title}
        </div>

        {/* Modal Content (Fades in when opening) */}
        <div className="card-face card-back !shadow-none !w-full !h-full relative rounded-[inherit] overflow-hidden" style={{ transform: 'none' }}>
          <img 
            src={coverImage} 
            alt="Event Cover" 
            className="back-bg-image" 
            style={{
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: isOpen ? '0.05s' : '0s'
            }}
          />
          
          <div className="card-back-inner !top-0 !left-0 !w-full !h-full rounded-[inherit] overflow-hidden" style={{ transform: 'none' }}>
            <button 
              type="button" 
              className="close-btn" 
              aria-label="Close details"
              onClick={handleClose}
              style={{
                opacity: isOpen ? 1 : 0,
                transform: `translateY(${isOpen ? '0' : '12px'})`,
                transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: isOpen ? '0.12s' : '0s'
              }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="back-content-section h-full flex flex-col p-8">
              <div 
                className="profile-header pb-4 mb-5 border-b border-gray-700 flex items-center gap-3"
                style={{
                  opacity: isOpen ? 1 : 0,
                  transform: `translateY(${isOpen ? '0' : '12px'})`,
                  transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: isOpen ? '0.12s' : '0s'
                }}
              >
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

              <div 
                className="scroll-area flex-1 overflow-y-auto custom-scrollbar pr-2"
                style={{
                  opacity: isOpen ? 1 : 0,
                  transform: `translateY(${isOpen ? '0' : '12px'})`,
                  transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: isOpen ? '0.16s' : '0s'
                }}
              >
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

              <div 
                className="mt-auto pt-4"
                style={{
                  opacity: isOpen ? 1 : 0,
                  transform: `translateY(${isOpen ? '0' : '12px'})`,
                  transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: isOpen ? '0.2s' : '0s'
                }}
              >
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
