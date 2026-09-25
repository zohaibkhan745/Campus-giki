import { getSocietyLogo } from '@/lib/utils';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Building2,
  ExternalLink,
  ArrowLeft,
  Info,
  ShieldCheck,
  FileText,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { eventService } from '@/services/event.service';
import { EventDetailSkeleton } from '@/components/events/EventDetailSkeleton';
import { VenuePermissionSlipModal } from '@/components/events/VenuePermissionSlipModal';
import { UploadSignedSlipModal } from '@/components/events/UploadSignedSlipModal';
import { ErrorState } from '@/components/ui/ErrorState';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isSlipModalOpen, setIsSlipModalOpen] = React.useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);

  const {
    data: eventItem,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id!),
    enabled: !!id,
    initialData: () => {
      if (!id) return undefined;
      // 1. Check existing direct cache
      const cached = queryClient.getQueryData<any>(['event', id]);
      if (cached) return cached;
      // 2. Check campus feed cache
      const feedData = queryClient.getQueryData<any>(['campusFeed']);
      if (feedData?.items) {
        const found = feedData.items.find(
          (it: any) => it.id === id || it.item?.id === id
        );
        if (found) return found.type === 'event' && found.item ? found.item : found;
      }
      // 3. Check upcoming events cache
      const upcoming = queryClient.getQueryData<any>(['events', 'upcoming']);
      if (upcoming?.items) {
        const found = upcoming.items.find((e: any) => e.id === id);
        if (found) return found;
      }
      // 4. Check general events cache
      const generalEvents = queryClient.getQueryData<any>(['events']);
      if (generalEvents?.items) {
        const found = generalEvents.items.find((e: any) => e.id === id);
        if (found) return found;
      }
      return undefined;
    },
    staleTime: 1000 * 30,
  });

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (isError || !eventItem) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorState
          error={error}
          title={isError ? undefined : 'Event Not Found'}
          description={
            isError
              ? undefined
              : 'This campus event may have concluded, been rescheduled, or the link might be outdated.'
          }
          badge={isError ? undefined : 'Event Unavailable'}
          onRetry={isError ? () => refetch() : undefined}
          actionText="Try Reconnecting"
          secondaryAction={{
            label: 'Browse Upcoming Events',
            to: '/upcoming-events',
          }}
          showBackAction
        />
      </div>
    );
  }

  const targetSocietyId = eventItem.society?.id || eventItem.societyId;

  const canViewRules =
    user?.role === 'DSA_ADMIN' ||
    user?.role === 'ADVISOR' ||
    (user?.role === 'SOCIETY' && user.society?.id === targetSocietyId);

  return (
    <div className="page-transition max-w-4xl mx-auto space-y-6 text-left pt-10 sm:pt-14 pb-8 px-4">
      {/* Top Back Navigation Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-surface-glass hover:bg-surface-hover backdrop-blur-md border border-border-subtle text-text-primary rounded-full transition-all cursor-pointer shadow-elevation-2"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-surface-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-8 shadow-card">
        {/* 1. Hero Cover Image */}
        {eventItem.coverImageUrl && (
          <div className="w-full h-56 sm:h-80 rounded-2xl overflow-hidden bg-surface-elevated border border-border-subtle shadow-md">
            <img
              src={eventItem.coverImageUrl}
              alt={eventItem.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        )}

        {/* 1.1 Event Promotional Video */}
        {eventItem.videoUrl && (
          <div className="w-full rounded-2xl overflow-hidden bg-black border border-border-subtle shadow-md">
            <video
              controls
              src={eventItem.videoUrl}
              className="w-full max-h-[480px] object-contain"
            />
          </div>
        )}

        {/* 2. Hero Header */}
        <div className="space-y-4 border-b border-border-subtle pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                {eventItem.title}
              </h1>
            </div>

            {/* 3. Primary Registration Action Button */}
            {eventItem.registrationLink && (
              <a
                href={eventItem.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0 cursor-pointer"
              >
                <span>Register for Event</span>
                <ExternalLink className="w-4 h-4 text-white" />
              </a>
            )}
          </div>
        </div>

        {/* 4. Schedule & Location Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-transparent p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-surface-elevated border border-border-subtle text-text-primary rounded-xl shrink-0">
              <CalendarIcon className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-text-muted tracking-wider">Date</p>
              <p className="text-xs font-bold text-text-primary">
                {new Date(eventItem.eventDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-surface-elevated border border-border-subtle text-text-primary rounded-xl shrink-0">
              <Clock className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-text-muted tracking-wider">Schedule</p>
              <p className="text-xs font-bold text-text-primary">
                {eventItem.startTime} - {eventItem.endTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-surface-elevated border border-border-subtle text-text-primary rounded-xl shrink-0">
              <MapPin className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-text-muted tracking-wider">Venue Location</p>
              <p className="text-xs font-bold text-text-primary truncate">{eventItem.venue}</p>
            </div>
          </div>
        </div>

        {/* 5. Event Overview & Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-text-primary group cursor-default w-fit">
            <Info className="w-4 h-4 text-brand-primary transition-all duration-300 ease-in-out" />
            <h3>About this Event</h3>
          </div>
          <p className="text-sm text-text-secondary font-medium leading-relaxed whitespace-pre-line bg-surface-elevated/40 p-5 rounded-2xl border border-border-subtle">
            {eventItem.description}
          </p>
        </div>

        {/* 6. Official DSA Rules (Visible to Authorized Only) */}
        {canViewRules && eventItem.rules && (
          <div className="space-y-3 pt-2">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Official DSA Directives &amp; Event Rules</span>
              </div>
              <p className="text-xs text-text-primary font-semibold whitespace-pre-line leading-relaxed pl-6">
                {eventItem.rules}
              </p>
            </div>
          </div>
        )}

        {/* 6.5 Official Venue Clearance (Visible only to Society & DSA Admin) */}
        {canViewRules &&
          (eventItem.approvalStatus === 'APPROVED' || eventItem.approvalStatus === 'PUBLISHED') && (
            <div className="space-y-3 pt-2">
              <div className="p-5 bg-surface-elevated/40 border border-border-subtle rounded-2xl space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-text-primary font-extrabold text-sm">
                    <FileText className="w-5 h-5 text-brand-primary" />
                    <span>Physical Venue Clearance &amp; PS to Dean Endorsement</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      eventItem.venueClearanceStatus === 'VERIFIED'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : eventItem.venueClearanceStatus === 'SUBMITTED'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                        : eventItem.venueClearanceStatus === 'REJECTED'
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {eventItem.venueClearanceStatus === 'VERIFIED'
                      ? '✓ Venue Clearance Verified'
                      : eventItem.venueClearanceStatus === 'SUBMITTED'
                      ? 'Under DSA Review'
                      : eventItem.venueClearanceStatus === 'REJECTED'
                      ? 'Re-upload Requested'
                      : 'Pending Physical Sign-off'}
                  </span>
                </div>

                <div className="text-xs text-text-muted space-y-1">
                  <p>
                    Allocated Venue:{' '}
                    <strong className="text-text-primary">{eventItem.venue}</strong> ({eventItem.startTime} -{' '}
                    {eventItem.endTime})
                  </p>
                  <p>
                    This event requires an official Venue Permission Slip stamped and signed by the PS to Dean /
                    Dean&apos;s Office.
                  </p>
                  {eventItem.venueClearanceNotes && (
                    <p className="p-2.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-500/20 mt-2 font-medium">
                      DSA Remarks: {eventItem.venueClearanceNotes}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setIsSlipModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border-subtle rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-brand-primary" />
                    <span>View / Print Permission Slip</span>
                  </button>

                  {user?.role === 'SOCIETY' && user.society?.id === targetSocietyId && (
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>
                        {eventItem.signedVenueSlipUrl
                          ? 'View / Update Signed Slip'
                          : 'Upload Signed PS to Dean Slip'}
                      </span>
                    </button>
                  )}

                  {eventItem.signedVenueSlipUrl && (
                    <a
                      href={eventItem.signedVenueSlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-surface-hover text-text-secondary border border-border-subtle rounded-xl text-xs font-semibold transition-colors"
                    >
                      <span>View Stamped Copy</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* 7. Hosting Society Information Card */}
        {eventItem.society && targetSocietyId && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Hosting Society
            </h3>
            <Link
              to={`/societies/${targetSocietyId}`}
              onMouseEnter={() => {
                if (eventItem.society) {
                  queryClient.setQueryData(['publicSociety', targetSocietyId], (prev: any) => prev || eventItem.society);
                }
              }}
              onTouchStart={() => {
                if (eventItem.society) {
                  queryClient.setQueryData(['publicSociety', targetSocietyId], (prev: any) => prev || eventItem.society);
                }
              }}
              onClick={() => {
                if (eventItem.society) {
                  queryClient.setQueryData(['publicSociety', targetSocietyId], (prev: any) => prev || eventItem.society);
                }
              }}
              className="flex items-center justify-between p-4 bg-surface-elevated/40 hover:bg-surface-hover rounded-2xl border border-border-subtle transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {eventItem.society.logoUrl ? (
                  <img
                    src={getSocietyLogo(eventItem.society.logoUrl)}
                    alt={eventItem.society.name}
                    className="w-12 h-12 rounded-xl object-cover border border-border-subtle"
                    onError={(e) => {
                      e.currentTarget.src = '/default-society.jpg';
                    }}
                  />
                ) : (
                  <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
                    {eventItem.society.name}
                  </h4>
                  <p className="text-xs text-text-muted">View official society profile →</p>
                </div>
              </div>

              <div className="px-3 py-1.5 bg-surface-elevated text-text-secondary border border-border-subtle font-medium text-xs font-semibold rounded-xl group-hover:bg-brand-primary group-hover:text-white group-hover:border-transparent transition-all">
                Visit Profile
              </div>
            </Link>
          </div>
        )}

        {/* 8. DSA Admin Audit Trail */}
        {user?.role === 'DSA_ADMIN' && eventItem.approvalStatus === 'PUBLISHED' && eventItem.dsaApprovedAt && (
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Administrative Audit Log
            </h3>
            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                <ShieldCheck className="w-5 h-5" />
                <h4>Approved &amp; Published</h4>
              </div>
              <p className="text-sm text-text-primary font-medium">
                Approved by DSA Admin on{' '}
                {new Date(eventItem.dsaApprovedAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {eventItem.dsaComments && (
                <div className="mt-2 pt-2 border-t border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    Approval Comments:
                  </span>
                  <p className="text-xs text-text-secondary">{eventItem.dsaComments}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isSlipModalOpen && (
        <VenuePermissionSlipModal
          isOpen={isSlipModalOpen}
          onClose={() => setIsSlipModalOpen(false)}
          event={eventItem}
          societyName={eventItem.society?.name}
          societyLogo={eventItem.society?.logoUrl}
        />
      )}

      {isUploadModalOpen && (
        <UploadSignedSlipModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          event={eventItem}
        />
      )}
    </div>
  );
};
