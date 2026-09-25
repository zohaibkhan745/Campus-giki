import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { getSocietyLogo, cn, resolveImageUrl } from '@/lib/utils';
import type { EventFeedItem } from '@/types/feed.types';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/event.service';
import { globalNotification } from '@/contexts/NotificationContext';
const VenuePermissionSlipModal = React.lazy(() =>
  import('@/components/events/VenuePermissionSlipModal').then((m) => ({ default: m.VenuePermissionSlipModal })),
);
const UploadSignedSlipModal = React.lazy(() =>
  import('@/components/events/UploadSignedSlipModal').then((m) => ({ default: m.UploadSignedSlipModal })),
);
import { Loader2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface EventCardProps {
  item: EventFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
  reviewUrl?: string;
  /** @deprecated Flip animation is removed in favor of direct navigation */
  disableFlip?: boolean;
}

const EventCardComponent: React.FC<EventCardProps> = ({ item, onEdit, onDelete, reviewUrl }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const coverImage = resolveImageUrl(item.coverImageUrl);
  const logoImage = getSocietyLogo(item.society?.logoUrl);
  const authorName = item.society?.name || 'Society';

  const isApproved = (item as any).approvalStatus === 'APPROVED' || (item as any).approvalStatus === 'PUBLISHED';
  const isPublished = isApproved || Boolean((item as any).isPublished);

  const isMySociety = user?.role === 'SOCIETY' && user.society?.id === item.society?.id;
  const isDsaAdmin = user?.role === 'DSA_ADMIN';

  // Published events cannot be edited by the society; DSA Admin can still edit
  const canEdit = isDsaAdmin || (isMySociety && !isPublished);

  // Both DSA Admin and the owning society CAN delete (even when published)
  const canDelete = isDsaAdmin || isMySociety;
  const canEditOrDelete = canEdit || canDelete;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVenueSlipOpen, setIsVenueSlipOpen] = useState(false);
  const [isUploadSlipOpen, setIsUploadSlipOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click or global event
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

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDeleting(true);
    try {
      await eventService.deleteEvent(item.id);
      setShowDeleteConfirm(false);
      globalNotification.triggerSuccess?.('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['campusFeed'] });
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['societyEvents'] });
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      queryClient.invalidateQueries({ queryKey: ['mySocietyEventsList'] });
      if (onDelete) onDelete();
    } catch {
      globalNotification.triggerFailed?.('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(item.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const eventDateObj = new Date(item.eventDate || item.createdAt);
  const eventDate = eventDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const eventTime = eventDateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const targetUrl = reviewUrl || `/events/${item.id}`;

  const handleMouseEnter = () => {
    // Pre-seed React Query cache so the event detail page loads with 0ms delay
    queryClient.setQueryData(['event', item.id], (prev: any) => prev || item);
  };

  const handleCardClick = () => {
    navigate(targetUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(targetUrl);
    }
  };

  return (
    <article
      className="card-wrapper group relative flex flex-col w-full h-full rounded-[28px] overflow-hidden border border-border-medium bg-surface shadow-elevation-1 transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-elevation-2 active:scale-[0.99] cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
      data-type="event"
      data-card-id={item.id}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      tabIndex={0}
      role="article"
      aria-label={`Event: ${item.title}`}
    >
      {/* Upper Bar Section */}
      <div className="bg-surface/95 border-b border-border-subtle px-4 py-3 flex items-center justify-between gap-3 w-full rounded-t-[24px] shrink-0 z-20 relative">
        <div className="flex flex-col min-w-0 flex-1 text-left">
          <span
            className="text-text-primary text-[18px] font-black tracking-tight truncate leading-tight group-hover:text-brand-primary transition-colors"
            title={item.title}
          >
            {item.title}
          </span>
          <span className="text-text-secondary text-[11px] font-medium whitespace-nowrap mt-0.5">
            {formattedDate} • {formattedTime}
          </span>
        </div>
        <span className="card-tag !text-[9px] !py-1 !px-2 shrink-0">Event</span>
      </div>

      {/* Center Media & Description Body */}
      <div className={`relative w-full flex-1 min-h-0 overflow-hidden flex flex-col ${!coverImage ? 'bg-black/[0.4] backdrop-blur-[24px]' : 'bg-gray-900'}`}>
        {coverImage ? (
          <img
            src={coverImage}
            alt={item.title || 'Event Poster'}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-black/30" />
        )}

        <div className={cn("relative z-10 text-left flex flex-col flex-1", !coverImage ? "p-4" : "absolute top-5 left-5 right-5")}>
          <div className="flex flex-col gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <svg className="w-3.5 h-3.5 stroke-current flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{eventDate} • {eventTime}</span>
            </div>
            {item.venue && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-200">
                <svg className="w-3.5 h-3.5 stroke-current flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="truncate">{item.venue}</span>
              </div>
            )}
          </div>

          {!coverImage && (
            <div className="text-gray-300 text-[16px] leading-relaxed mt-3 line-clamp-6 whitespace-pre-wrap flex-1">
              {item.description}
            </div>
          )}
        </div>

        {(item as any).approvalStatus && (item as any).approvalStatus !== 'PUBLISHED' && (item as any).approvalStatus !== 'APPROVED' && (
          <div className="absolute bottom-5 left-5 right-5 z-10 text-left">
            <span
              className={cn(
                "inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-lg border",
                (item as any).approvalStatus === 'PENDING_ADVISOR'
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  : (item as any).approvalStatus === 'PENDING_ADMIN'
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              )}
            >
              {(item as any).approvalStatus === 'PENDING_ADMIN'
                ? 'Pending DSA'
                : (item as any).approvalStatus === 'PENDING_ADVISOR'
                ? 'Pending Advisor'
                : (item as any).approvalStatus.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Event?"
        message="Are you sure you want to permanently delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Lower Bar Section */}
      <div
        className="bg-surface/95 border-t border-border-subtle p-4 flex items-center justify-between gap-3 shrink-0 rounded-b-[24px] relative z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Link
            to={`/societies/${item.society.id}`}
            className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center border border-border-medium shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={logoImage}
              alt={authorName}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/default-society.jpg';
              }}
            />
          </Link>
          <Link
            to={`/societies/${item.society.id}`}
            className="flex flex-col min-w-0 flex-1 text-left hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-text-primary text-[14px] font-bold leading-tight truncate">{authorName}</span>
            <span className="text-text-secondary text-[12px] font-medium leading-none mt-0.5 truncate">
              @{(item.society as any)?.username || item.society.name.toLowerCase().replace(/\s+/g, '')}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0 h-full">
          {reviewUrl ? (
            <Link
              to={reviewUrl}
              className="px-4 h-[32px] flex items-center justify-center bg-brand-accent hover:opacity-90 active:scale-95 text-white text-[12px] font-bold rounded-lg transition-all border-none shadow-sm pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              Review
            </Link>
          ) : (
            <button
              type="button"
              className="px-4 h-[32px] flex items-center justify-center bg-text-primary hover:opacity-90 active:scale-95 text-text-inverse text-[12px] font-bold rounded-lg transition-all border-none shadow-sm pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(targetUrl);
              }}
            >
              View Details
            </button>
          )}

          {canEditOrDelete && (
            <div className="menu-container shrink-0 h-full flex items-center">
              <button
                type="button"
                className="flex items-center justify-center p-2 rounded-full hover:bg-surface-hover active:scale-90 transition-all pointer-events-auto cursor-pointer text-text-primary"
                aria-label="Options"
                ref={buttonRef}
                onClick={toggleDropdown}
                style={{ height: '32px', width: '32px', borderRadius: '50%' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <circle cx="5" cy="12" r="2.5" />
                  <circle cx="12" cy="12" r="2.5" />
                  <circle cx="19" cy="12" r="2.5" />
                </svg>
              </button>
              {dropdownOpen &&
                createPortal(
                  <div
                    className="card-dropdown-menu active"
                    style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 99999, margin: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canEdit && (
                      <button
                        className="card-dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(false);
                          if (onEdit) onEdit();
                          else navigate(`/events/${item.id}/edit`);
                        }}
                      >
                        Edit Event
                      </button>
                    )}
                    {isMySociety && isApproved && (
                      <>
                        <button
                          className="card-dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(false);
                            setIsVenueSlipOpen(true);
                          }}
                        >
                          Print Venue Slip
                        </button>
                        <button
                          className="card-dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(false);
                            setIsUploadSlipOpen(true);
                          }}
                        >
                          {(item as any).signedVenueSlipUrl ? 'Manage Signed Slip' : 'Upload Signed Slip'}
                        </button>
                      </>
                    )}
                    {canDelete && (
                      <button
                        className="card-dropdown-item delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(false);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        Delete Event
                      </button>
                    )}
                  </div>,
                  document.body
                )}
            </div>
          )}
        </div>
      </div>

      {isVenueSlipOpen && (
        <React.Suspense fallback={null}>
          <VenuePermissionSlipModal
            isOpen={isVenueSlipOpen}
            onClose={() => setIsVenueSlipOpen(false)}
            event={item as any}
            societyName={item.society.name}
            societyLogo={item.society.logoUrl}
          />
        </React.Suspense>
      )}

      {isUploadSlipOpen && (
        <React.Suspense fallback={null}>
          <UploadSignedSlipModal
            isOpen={isUploadSlipOpen}
            onClose={() => setIsUploadSlipOpen(false)}
            event={item as any}
          />
        </React.Suspense>
      )}

      {showDeleteConfirm &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (!isDeleting) setShowDeleteConfirm(false);
            }}
          >
            <div
              className="bg-surface-elevated border border-border-medium rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-text-primary mb-2">Delete Event?</h3>
              <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-text-primary">&quot;{item.title}&quot;</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-surface-hover hover:bg-surface border border-border-medium text-text-primary text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-red-900/30"
                  onClick={handleDelete}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </article>
  );
};

export const EventCard = React.memo(EventCardComponent, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id;
});
