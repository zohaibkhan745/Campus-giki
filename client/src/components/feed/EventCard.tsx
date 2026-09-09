import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { getSocietyLogo, cn, resolveImageUrl } from '@/lib/utils';
import type { EventFeedItem } from '@/types/feed.types';
import { useCardFlip } from '@/hooks/useCardFlip';
import { useAuth } from '@/context/AuthContext';
import { eventService } from '@/services/event.service';
import { globalNotification } from '@/contexts/NotificationContext';

interface EventCardProps {
  item: EventFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
  reviewUrl?: string;
  disableFlip?: boolean;
}

const EventCardComponent: React.FC<EventCardProps> = ({ item, onEdit, onDelete, reviewUrl, disableFlip }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isActive, openCard, closeCard } = useCardFlip(wrapperRef, disableFlip);
  const { user } = useAuth();
  const canEditOrDelete = user?.role === 'DSA_ADMIN' || (user?.role === 'SOCIETY' && user.society?.id === item.society.id);
  const canEdit = user?.role === 'SOCIETY' && user.society?.id === item.society.id;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dropdownOpen) {
      setDropdownOpen(false);
      return;
    }
    window.dispatchEvent(new CustomEvent('close-all-dropdowns'));
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 8, left: rect.left });
    setDropdownOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    window.addEventListener('close-all-dropdowns', handleClickOutside);

    if (dropdownOpen) {
      setTimeout(() => window.addEventListener('click', handleClickOutside), 10);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('close-all-dropdowns', handleClickOutside);
    };
  }, [dropdownOpen]);

  const coverImage = resolveImageUrl(item.coverImageUrl);
  const logoImage = getSocietyLogo(item.society.logoUrl);
  const authorName = item.society.name;

  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(item.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const eventDateObj = new Date(item.eventDate || item.createdAt);
  const eventDate = eventDateObj.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
  const eventTime = eventDateObj.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  useEffect(() => {
    if (isActive) {
      if (dropdownOpen) setDropdownOpen(false);
      if (showDeleteConfirm) setShowDeleteConfirm(false);
    }
  }, [isActive, dropdownOpen, showDeleteConfirm]);

  return (
    <div
      ref={wrapperRef}
      className="card-wrapper"
      data-type="event"
      data-card-id={item.id}
    >
      <div className="card-flipper">

        {/* FRONT FACE */}
        <div className="card-face card-front">
          <div className="card-front-content">
            
            {/* Square Image Area */}
            <div className={`relative w-full aspect-square overflow-hidden shrink-0 ${!coverImage ? 'bg-white/[0.05] backdrop-blur-[20px]' : 'bg-gray-900'}`}>
              {coverImage && (
                <img src={coverImage} alt="Event Poster" className="absolute inset-0 w-full h-full object-cover" />
              )}
              {coverImage && <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/30 to-black/90"></div>}
              
              <div className="absolute top-5 left-5 right-5 flex flex-col gap-2 z-10 text-left">
                <div className="flex items-center justify-between gap-[20px] flex-wrap w-full">
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0 flex-1">
                    <span className="text-white text-xl font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">{item.title}</span>
                    <span className="text-gray-300 text-xs font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap">{formattedDate} • {formattedTime}</span>
                  </div>
                  <span className="card-tag">Event</span>
                </div>
                
                <div className="flex flex-col gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <svg className="w-3.5 h-3.5 stroke-current flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{eventDate} • {eventTime}</span>
                  </div>
                  {item.venue && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-200">
                      <svg className="w-3.5 h-3.5 stroke-current flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span className="truncate">{item.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              {(item as any).approvalStatus && (item as any).approvalStatus !== 'PUBLISHED' && (item as any).approvalStatus !== 'APPROVED' && (
                <div className="absolute bottom-5 left-5 right-5 z-10 text-left">
                  <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-lg border",
                    (item as any).approvalStatus === 'PENDING_ADVISOR' ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                      (item as any).approvalStatus === 'PENDING_ADMIN' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                        "bg-red-500/20 text-red-400 border-red-500/30"
                  )}>
                    {(item as any).approvalStatus === 'PENDING_ADMIN' ? 'Pending DSA' : (item as any).approvalStatus === 'PENDING_ADVISOR' ? 'Pending Advisor' : (item as any).approvalStatus.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            {/* Lower Bar Section */}
            <div className="bg-gray-950/95 border-t border-white/10 p-4 flex items-center justify-between gap-3 flex-1 relative">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-[#007ebb] flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
                  <img src={logoImage} alt={authorName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} />
                </div>
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <span className="text-white text-xs font-bold leading-none truncate">{authorName}</span>
                  <span className="text-gray-400 text-[11px] font-medium leading-none mt-1 truncate">@{(item.society as any).username || item.society.name.toLowerCase().replace(/\s+/g, '')}</span>
                </div>
              </div>

              {canEditOrDelete && (
                <div className="menu-container shrink-0 flex items-center">
                  <button
                    type="button"
                    className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Options" ref={buttonRef} onClick={toggleDropdown}
                  >
                    <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><circle cx="5" cy="12" r="2.5"></circle><circle cx="12" cy="12" r="2.5"></circle><circle cx="19" cy="12" r="2.5"></circle></svg>
                  </button>
                  {dropdownOpen && createPortal(
                    <div
                      className="card-dropdown-menu active"
                      style={{ position: 'fixed', bottom: window.innerHeight - dropdownPos.top + 50, left: dropdownPos.left, zIndex: 9999, margin: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canEdit && !((item as any).approvalStatus === 'CHANGES_REQUESTED' || (item as any).approvalStatus?.includes('PENDING')) && <button className="card-dropdown-item" onClick={(e) => {
                        e.stopPropagation(); setDropdownOpen(false);
                        if (onEdit) onEdit(); else navigate(`/events/${item.id}/edit`);
                      }}>Edit Event</button>}
                      <button className="card-dropdown-item delete" onClick={(e) => {
                        e.stopPropagation(); setDropdownOpen(false);
                        setShowDeleteConfirm(true);
                      }}>Delete Event</button>
                    </div>,
                    document.body
                  )}
                </div>
              )}

              <button type="button" onClick={(e) => {
                  e.stopPropagation();
                  if (reviewUrl) {
                    navigate(reviewUrl);
                  } else if (canEdit && ((item as any).approvalStatus === 'CHANGES_REQUESTED' || (item as any).approvalStatus?.includes('PENDING'))) {
                    navigate(`/events/${item.id}/edit`);
                  } else {
                    openCard(true);
                  }
                }} className="open-details-btn flex justify-center items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm">
                <span className="whitespace-nowrap">{reviewUrl ? 'Review Event' : (canEdit && ((item as any).approvalStatus === 'CHANGES_REQUESTED' || (item as any).approvalStatus?.includes('PENDING'))) ? 'Edit Event' : 'View Details'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
            
            {showDeleteConfirm && createPortal(
              <div id="delete-confirm-modal" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}>
                <div style={{ background: 'rgba(25, 27, 34, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '24px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Delete Event?</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '24px' }}>Are you sure you want to permanently delete this event? This action cannot be undone.</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#fff', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                    <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ff4d4f', border: '1px solid #ff4d4f', color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={async () => {
                      try {
                        await eventService.deleteEvent(item.id);
                        globalNotification.triggerSuccess('Event deleted successfully');
                        window.location.reload();
                      } catch (err) {
                        globalNotification.triggerFailed('Failed to delete event');
                      }
                    }}>Delete</button>
                  </div>
                </div>
              </div>, document.body
            )}

          </div>
        </div>

        {/* BACK FACE */}
        <div className="card-face card-back">
          <div className="card-back-inner">
            
            <div className="relative h-[200px] w-full flex-shrink-0 bg-gray-900 flex items-center justify-center overflow-hidden">
              {coverImage && (
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover opacity-60" />
              )}
              <button type="button" className="close-btn" aria-label="Close details" onClick={(e) => { e.stopPropagation(); closeCard(); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="p-8 bg-[#111827] flex flex-col flex-1 min-h-0 rounded-b-[28px] text-left">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-700">
                <div className="w-11 h-11 rounded-full bg-[#007ebb] flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
                  <img src={logoImage} alt={authorName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-base leading-tight">{authorName}</span>
                  <span className="text-gray-400 text-xs mt-0.5">{formattedDate} • {formattedTime}</span>
                </div>
              </div>

              <div className="scroll-area flex-1 min-h-0">
                <div className="flex flex-col gap-1.5 mb-5">
                  <div className="flex items-center gap-2 text-sm text-white font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{eventDate} • {eventTime}</span>
                  </div>
                  {item.venue && (
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>{item.venue}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 mb-4">
                  <h4 className="text-xl font-bold text-white">{item.title}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
              </div>

              <a href={item.registrationLink && item.registrationLink.trim() !== '' ? (item.registrationLink.startsWith('http') ? item.registrationLink : `https://${item.registrationLink}`) : "#"} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                <span>{item.registrationLink && item.registrationLink.trim() !== '' ? 'Register Now' : 'Details'}</span>
                {item.registrationLink && item.registrationLink.trim() !== '' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 19"></polyline></svg>
                )}
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export const EventCard = React.memo(EventCardComponent, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id;
});
