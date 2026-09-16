import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { getSocietyLogo } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export interface CalendarEventModalProps {
  event: any;
  sourceRect?: DOMRect;
  bg?: string;
  color?: string;
  onClose: () => void;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  event,
  bg,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Immediate RAF to trigger hardware-accelerated CSS transition
    const raf = requestAnimationFrame(() => {
      setIsOpen(true);
    });

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent body background scroll while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!event) return null;

  const societyId = event.societyId || event.society?.id;
  const authorName = event.society?.name || 'Campus Admin';
  const logoImage = getSocietyLogo(event.society?.logoUrl);
  const coverImage =
    event.coverImageUrl ||
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80';

  const rawDate = event.eventDate || event.startDate || event.date || event.createdAt;
  let formattedEventDate = '';
  if (rawDate) {
    try {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedEventDate = format(parsedDate, 'EEEE, MMM d, yyyy');
      }
    } catch {
      formattedEventDate = '';
    }
  }

  let formattedEventTime = '';
  if (event.startTime) {
    formattedEventTime = event.endTime
      ? `${event.startTime} - ${event.endTime}`
      : event.startTime;
  }

  const scheduleText =
    [formattedEventDate, formattedEventTime].filter(Boolean).join(' • ') ||
    'Date to be announced';
  const formattedDate = event.createdAt
    ? format(new Date(event.createdAt), 'MMM d, yyyy')
    : '';

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ease-out cursor-pointer ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Pop-up Card Container (Pure GPU Scale & Opacity) */}
      <div
        ref={modalRef}
        className={`relative z-10 w-full max-w-[540px] h-[560px] max-h-[90vh] sm:max-h-[85vh] rounded-[24px] overflow-hidden flex flex-col border border-white/20 bg-[#121318] shadow-2xl transition-all duration-200 ease-out will-change-[transform,opacity] ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: bg
            ? `0 25px 60px -15px rgba(0,0,0,0.85), 0 0 40px -10px ${bg}`
            : '0 25px 60px -15px rgba(0,0,0,0.85)',
        }}
      >
        {/* Background Cover Image with Ambient Dark Blur */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={coverImage}
            alt={event.title}
            className="w-full h-full object-cover filter blur-[3px] brightness-[0.35] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121318]/50 via-[#121318]/85 to-[#121318] pointer-events-none" />
        </div>

        {/* Close Button */}
        <button
          type="button"
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          aria-label="Close details"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Inner Content */}
        <div className="relative z-10 h-full flex flex-col p-6 sm:p-8">
          {/* Header (Author info) */}
          <div className="profile-header pb-4 mb-4 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 pr-10">
            {societyId ? (
              <Link
                to={`/societies/${societyId}`}
                onClick={() => {
                  if (event.society) {
                    queryClient.setQueryData(['publicSociety', societyId], (prev: any) => prev || event.society);
                  }
                  onClose();
                }}
                onMouseEnter={() => {
                  if (event.society) {
                    queryClient.setQueryData(['publicSociety', societyId], (prev: any) => prev || event.society);
                  }
                }}
                onTouchStart={() => {
                  if (event.society) {
                    queryClient.setQueryData(['publicSociety', societyId], (prev: any) => prev || event.society);
                  }
                }}
                className="group/society flex items-center gap-3 min-w-0 hover:opacity-95 transition-all cursor-pointer"
                title={`View ${authorName} profile`}
              >
                <img
                  src={logoImage}
                  alt={authorName}
                  className="w-11 h-11 rounded-full border border-white/20 object-cover shrink-0 group-hover/society:ring-2 group-hover/society:ring-blue-400/80 group-hover/society:scale-105 transition-all"
                  onError={(e) => {
                    e.currentTarget.src = '/default-society.jpg';
                  }}
                />
                <div className="flex flex-col min-w-0 text-left">
                  <span className="font-bold text-white text-base truncate group-hover/society:text-blue-400 transition-colors">
                    {authorName}
                  </span>
                  {formattedDate && (
                    <span className="text-xs text-gray-400">Posted: {formattedDate}</span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 min-w-0 text-left">
                <img
                  src={logoImage}
                  alt={authorName}
                  className="w-11 h-11 rounded-full border border-white/20 object-cover shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/default-society.jpg';
                  }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-base truncate">{authorName}</span>
                  {formattedDate && (
                    <span className="text-xs text-gray-400">Posted: {formattedDate}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Event Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 min-h-0 space-y-4">
            {/* Date & Time / Venue Badges */}
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm">
              <div className="text-gray-200 flex items-center gap-2.5 font-medium">
                <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{scheduleText}</span>
              </div>
              {event.venue && (
                <div className="text-gray-200 flex items-center gap-2.5 font-medium">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{event.venue}</span>
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                {event.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {event.description || 'No detailed description provided for this event.'}
              </p>
            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="mt-auto pt-4 border-t border-white/10 shrink-0">
            {event.registrationLink ? (
              <a
                href={
                  event.registrationLink.startsWith('http')
                    ? event.registrationLink
                    : `https://${event.registrationLink}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-3 px-5 bg-white text-gray-950 rounded-xl font-bold hover:bg-gray-200 transition-all hover:shadow-lg active:scale-[0.99] gap-2 text-sm cursor-pointer"
              >
                <span>Register Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <Link
                to={`/events/${event.id}`}
                className="flex items-center justify-center w-full py-3 px-5 bg-white text-gray-950 rounded-xl font-bold hover:bg-gray-200 transition-all hover:shadow-lg active:scale-[0.99] gap-2 text-sm cursor-pointer"
              >
                <span>View Event Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
