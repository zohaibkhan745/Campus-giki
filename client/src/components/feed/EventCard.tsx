import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { getSocietyLogo, cn, resolveImageUrl } from '@/lib/utils';
import type { EventFeedItem } from '@/types/feed.types';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/event.service';
import { globalNotification } from '@/contexts/NotificationContext';
import { invalidateEventQueries } from '@/lib/queryInvalidations';
import { Loader2, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { AddToCalendarButton } from '@/components/events';

const VenuePermissionSlipModal = React.lazy(() =>
  import('@/components/events/VenuePermissionSlipModal').then((m) => ({ default: m.VenuePermissionSlipModal })),
);
const UploadSignedSlipModal = React.lazy(() =>
  import('@/components/events/UploadSignedSlipModal').then((m) => ({ default: m.UploadSignedSlipModal })),
);

interface EventCardProps {
  item: EventFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
  reviewUrl?: string;
  allowManagement?: boolean;
  /** @deprecated Flip animation is removed in favor of direct navigation */
  disableFlip?: boolean;
}

const EventCardComponent: React.FC<EventCardProps> = ({
  item,
  onEdit,
  onDelete,
  reviewUrl,
  allowManagement = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const coverImage = resolveImageUrl(item.coverImageUrl);
  const logoImage = getSocietyLogo(item.society?.logoUrl);
  const authorName = item.society?.name || 'Society';
  const societyUsername =
    (item.society as any)?.username ||
    (item.society?.name ? item.society.name.toLowerCase().replace(/\s+/g, '') : 'society');

  const approvalStatus = (item as any).approvalStatus;
  const isApproved = approvalStatus === 'APPROVED' || approvalStatus === 'PUBLISHED';
  const isPublished = isApproved || Boolean((item as any).isPublished);
  const isChangesRequested = approvalStatus === 'CHANGES_REQUESTED';
  const isPendingAdvisor = approvalStatus === 'PENDING_ADVISOR';
  const isPendingAdmin = approvalStatus === 'PENDING_ADMIN';
  const isDraft = approvalStatus === 'DRAFT';

  const showStatusBadge = Boolean(approvalStatus && !isApproved);
  const statusLabel = isPendingAdmin
    ? 'Pending DSA'
    : isPendingAdvisor
    ? 'Pending Advisor'
    : isChangesRequested
    ? 'Changes Requested'
    : isDraft
    ? 'Draft'
    : typeof approvalStatus === 'string'
    ? approvalStatus.replace('_', ' ')
    : '';

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
      void invalidateEventQueries(queryClient, item.id);
      if (onDelete) onDelete();
    } catch {
      globalNotification.triggerFailed?.('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const eventDateObj = new Date(item.eventDate || item.createdAt);
  const eventMonthShort = eventDateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const eventDayNum = eventDateObj.toLocaleDateString('en-US', { day: 'numeric' });
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
      className="card-wrapper group relative flex flex-col w-full h-full rounded-[24px] overflow-hidden border border-border-medium bg-surface shadow-elevation-1 transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-elevation-2 active:scale-[0.99] cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
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
      {/* 1. Top Poster Section with Clean Ambient Backdrop & Date Badge */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-black/90 flex items-center justify-center shrink-0">
        {coverImage ? (
          <>
            {/* Ambient blurred backdrop so any aspect ratio fills seamlessly without empty letterboxing */}
            <img
              src={coverImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-40 scale-110 pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            {/* Wholly visible, uncropped poster */}
            <img
              src={coverImage}
              alt={item.title || 'Event Poster'}
              loading="lazy"
              decoding="async"
              className="relative z-1 max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-[1.02] transition-transform duration-500 ease-out"
            />
          </>
        ) : (
          <div className="w-full h-full bg-surface-elevated flex items-center justify-center text-text-muted">
            <CalendarIcon className="w-10 h-10 opacity-25" />
          </div>
        )}

        {/* Floating Calendar Date Tile (Top-Left) */}
        <div className="absolute top-3 left-3 z-10 bg-surface/95 backdrop-blur-md border border-border-subtle rounded-xl px-2.5 py-1 text-center shadow-md pointer-events-none">
          <span className="block text-[10px] font-black uppercase tracking-wider text-brand-primary leading-tight">
            {eventMonthShort}
          </span>
          <span className="block text-base font-black text-text-primary leading-tight">
            {eventDayNum}
          </span>
        </div>

        {/* Status Badge (Top-Right) */}
        {showStatusBadge && (
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span
              className={cn(
                'inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md border',
                isPendingAdvisor
                  ? 'bg-orange-500/25 text-orange-400 border-orange-500/35'
                  : isPendingAdmin
                  ? 'bg-yellow-500/25 text-yellow-400 border-yellow-500/35'
                  : isChangesRequested
                  ? 'bg-amber-500/25 text-amber-400 border-amber-500/35'
                  : isDraft
                  ? 'bg-gray-500/25 text-gray-300 border-gray-500/35'
                  : 'bg-red-500/25 text-red-400 border-red-500/35'
              )}
            >
              {statusLabel}
            </span>
          </div>
        )}
      </div>

      {/* 2. Middle Event Details Section */}
      <div className="flex flex-col flex-1 p-4 text-left gap-1.5 min-h-0">
        {/* Event Schedule Timestamp */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary">
          <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{eventDate} • {eventTime}</span>
        </div>

        {/* Event Title (High-contrast, up to 2 lines without premature cutoff) */}
        <h3
          className="text-[16px] font-bold text-text-primary tracking-tight leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors mt-0.5"
          title={item.title}
        >
          {item.title}
        </h3>

        {/* Venue Location */}
        {item.venue && (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-text-muted" />
            <span className="truncate">{item.venue}</span>
          </div>
        )}

        {/* Fallback description if no cover image */}
        {!coverImage && item.description && (
          <p className="text-text-secondary text-xs leading-relaxed mt-1 line-clamp-3 whitespace-pre-wrap flex-1">
            {item.description}
          </p>
        )}

        {/* 3. Society / Organizer Row (Given 100% width, never crushed) */}
        <div className="flex items-center gap-2.5 pt-3 mt-auto border-t border-border-subtle">
          <Link
            to={`/societies/${item.society.id}`}
            className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center border border-border-medium shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
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
            className="flex items-baseline gap-1.5 min-w-0 flex-1 text-left hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-text-primary text-[13px] font-bold truncate leading-tight">
              {authorName}
            </span>
            <span className="text-text-muted text-[11px] font-medium truncate hidden sm:inline leading-none">
              @{societyUsername}
            </span>
          </Link>
        </div>
      </div>

      {/* 4. Lower Action Bar Section */}
      <div
        className="bg-surface/95 border-t border-border-subtle p-3 px-4 flex items-center justify-between gap-2 shrink-0 rounded-b-[24px] relative z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <AddToCalendarButton
          event={item}
          variant="compact"
          className="h-[32px] w-[32px]"
          align="left"
          direction="up"
        />

        <div className="flex items-center gap-2">
          {reviewUrl ? (
            <Link
              to={reviewUrl}
              className="px-4 h-[32px] flex items-center justify-center bg-brand-accent hover:opacity-90 active:scale-95 text-white text-[12px] font-bold rounded-lg transition-all border-none shadow-sm pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              Review
            </Link>
          ) : allowManagement && isChangesRequested && isMySociety ? (
            <button
              type="button"
              className="px-4 h-[32px] flex items-center justify-center bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-[12px] font-bold rounded-lg transition-all border-none shadow-sm pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/events/${item.id}/edit`);
              }}
            >
              Edit
            </button>
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

          {allowManagement && canEditOrDelete && (
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
  return prevProps.item.id === nextProps.item.id && prevProps.allowManagement === nextProps.allowManagement;
});
