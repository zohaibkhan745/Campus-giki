import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, X } from 'lucide-react';
import { getSocietyLogo } from '@/lib/utils';
import type { EventFeedItem } from '@/types/feed.types';
import { useCardFlip } from '@/hooks/useCardFlip';
import { useAuth } from '@/context/AuthContext';
import { eventService } from '@/services/event.service';
import { globalNotification } from '@/contexts/NotificationContext';

interface EventCardProps {
  item: EventFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ item, onEdit, onDelete }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isActive, openCard, closeCard } = useCardFlip(wrapperRef);
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
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 8, left: rect.left });
    setDropdownOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) {
      setTimeout(() => window.addEventListener('click', handleClickOutside), 10);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const coverImage = item.coverImageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80';
  const logoImage = getSocietyLogo(item.society.logoUrl);
  const authorName = item.society.name;

  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const eventDateObj = new Date(item.eventDate || item.createdAt);
  const eventDate = eventDateObj.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
  const eventTime = eventDateObj.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div 
      ref={wrapperRef}
      className="card-wrapper event-card-wrapper"
      data-card-id={item.id}
    >
      <div className="card-flipper">
        
        {/* FRONT FACE */}
        <div className="card-face card-front">
          <img src={coverImage} alt="Event Cover" className="card-image" />

          <div className="card-top-bar">
              <div className="profile-header">
                <img 
                  src={logoImage} 
                  alt={authorName} 
                  className="avatar" 
                  onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} 
                />
                <div className="author-name-group">
                  <span className="author-name">{authorName}</span>
                  <span className="post-timestamp">Posted: {formattedDate}</span>
                </div>
              </div>
              <span className="card-tag">Event</span>
            </div>

          <div className="card-overlay">
              <div className="user-profile">

              <div className="mt-2">
                <h3 className="card-title">{item.title}</h3>
              </div>

              <div className="event-meta mt-2">
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

            <div className="flex items-center gap-2 mt-auto w-full">
              {canEditOrDelete && (
                <div className="menu-container shrink-0 h-full flex items-center">
                  <button 
                    type="button" 
                    className="card-button flex items-center justify-center p-0" aria-label="Options" ref={buttonRef} onClick={toggleDropdown} style={{ height: '48px', width: '48px', borderRadius: '12px' }}
                  >
                    <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2.5"></circle><circle cx="12" cy="12" r="2.5"></circle><circle cx="19" cy="12" r="2.5"></circle></svg>
                  </button>
                  {dropdownOpen && createPortal(
                    <div 
                      className="card-dropdown-menu active" 
                      style={{ position: 'fixed', bottom: window.innerHeight - dropdownPos.top + 50, left: dropdownPos.left, zIndex: 9999, margin: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canEdit && <button className="card-dropdown-item" onClick={(e) => { 
                        e.stopPropagation(); setDropdownOpen(false); 
                        if(onEdit) onEdit(); else navigate(`/events/${item.id}/edit`);
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
                        } catch(err) {
                          globalNotification.triggerFailed('Failed to delete event');
                        }
                      }}>Delete</button>
                    </div>
                  </div>
                </div>, document.body
              )}
              <button 
                type="button" 
                className="card-button open-details-btn flex-1" style={{ height: '48px' }}
                onClick={(e) => { e.stopPropagation(); openCard(true); }}
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="card-face card-back">
          <img src={coverImage} alt="Event Cover Background" className="back-bg-image" />
          <div className="card-back-inner">
            <button 
              type="button" 
              className="close-btn" 
              aria-label="Close details"
              onClick={(e) => { e.stopPropagation(); closeCard(); }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="back-content-section">
              <div className="profile-header pb-4 mb-5 border-b border-gray-700">
                <img 
                  src={logoImage} 
                  alt={authorName} 
                  className="avatar" 
                  style={{ width: '48px', height: '48px' }}
                  onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} 
                />
                <div className="author-name-group">
                  <span className="author-name" style={{ fontSize: '1.05rem' }}>{authorName}</span>
                  <span className="post-timestamp">Posted: {formattedDate}</span>
                </div>
              </div>

              <div className="scroll-area">
                <div className="event-meta mb-6">
                  <div className="meta-row text-gray-100">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{eventDate} • {eventTime}</span>
                  </div>
                  {item.venue && (
                    <div className="meta-row text-gray-100">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{item.venue}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  <h4 className="card-title text-[1.25rem] font-bold">{item.title}</h4>
                  <p className="card-description">{item.description}</p>
                </div>
              </div>

              {item.registrationLink ? (
                <a href={item.registrationLink.startsWith('http') ? item.registrationLink : `https://${item.registrationLink}`} target="_blank" rel="noopener noreferrer" className="register-btn mt-4">
                  <span>Register Now <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
                </a>
              ) : (
                <Link to={`/events/${item.id}`} className="register-btn mt-4">
                  <span>View Event Details <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
