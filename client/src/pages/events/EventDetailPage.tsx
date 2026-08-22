import { getSocietyLogo } from '@/lib/utils';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Building2,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { eventService } from '@/services/event.service';
import { EventDetailSkeleton } from '@/components/events/EventDetailSkeleton';
import { Alert } from '@/components/ui/Alert';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: eventItem,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (isError || !eventItem) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        null /* Removed error alert */
        <Link
          to="/societies"
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  const isPast = new Date(eventItem.eventDate) < new Date(new Date().setHours(0, 0, 0, 0));
  
  const canViewRules =
    user?.role === 'DSA_ADMIN' ||
    user?.role === 'ADVISOR' ||
    (user?.role === 'SOCIETY' && user.society?.id === eventItem.societyId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left pt-10 sm:pt-14 pb-8 px-4">
      {/* Top Back Navigation Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-lumen-cream p-6 sm:p-8 rounded-cards border border-vast-ink/20 space-y-8">
        {/* 1. Hero Cover Image */}
        {eventItem.coverImageUrl && (
          <div className="w-full h-56 sm:h-80 rounded-cards overflow-hidden bg-lumen-stone border border-vast-ink/20 shadow-xl">
            <img
              src={eventItem.coverImageUrl}
              alt={eventItem.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        )}

        {/* 1.1 Event Promotional Video */}
        {eventItem.videoUrl && (
          <div className="w-full rounded-cards overflow-hidden bg-black border border-vast-ink/20 shadow-xl">
            <video
              controls
              src={eventItem.videoUrl}
              className="w-full max-h-[480px] object-contain"
            />
          </div>
        )}

        {/* 2. Hero Header */}
        <div className="space-y-4 border-b border-vast-ink/20 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">

              <h1 className="text-2xl sm:text-3xl font-extrabold text-vast-ink">
                {eventItem.title}
              </h1>
            </div>

            {/* 3. Primary Registration Action Button */}
            {eventItem.registrationLink && (
              <a
                href={eventItem.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-vast-ink hover:opacity-90 text-white rounded-inputs text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer"
              >
                <span>Register for Event</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* 4. Schedule & Location Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-transparent p-5 rounded-cards border border-vast-ink/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-lumen-cream border border-vast-ink/20 text-vast-ink rounded-inputs shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-fog tracking-wider">Date</p>
              <p className="text-xs font-bold text-vast-ink">
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
            <div className="p-2.5 bg-lavender-whisper border border-vast-ink/20 text-vast-ink rounded-inputs shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-fog tracking-wider">Schedule</p>
              <p className="text-xs font-bold text-vast-ink">
                {eventItem.startTime} - {eventItem.endTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-lumen-cream border border-vast-ink/20 text-forest-ink rounded-inputs shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-fog tracking-wider">Venue Location</p>
              <p className="text-xs font-bold text-vast-ink truncate">{eventItem.venue}</p>
            </div>
          </div>
        </div>

        {/* 5. Event Overview & Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-vast-ink group cursor-default w-fit">
            <Info className="w-4 h-4 text-vast-ink group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300 ease-in-out" />
            <h3>About this Event</h3>
          </div>
          <p className="text-sm text-vast-ink font-medium leading-relaxed whitespace-pre-line bg-lumen-cream/40 p-5 rounded-cards border border-vast-ink/20">
            {eventItem.description}
          </p>
        </div>

        {/* 6. Official DSA Rules (Visible to Authorized Only) */}
        {canViewRules && eventItem.rules && (
          <div className="space-y-3 pt-2">
            <div className="p-4 bg-amber-50 border-2 border-amber-500/40 rounded-cards space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Official DSA Directives &amp; Event Rules</span>
              </div>
              <p className="text-xs text-amber-950 font-semibold whitespace-pre-line leading-relaxed pl-6">
                {eventItem.rules}
              </p>
            </div>
          </div>
        )}

        {/* 7. Hosting Society Information Card */}
        {eventItem.society && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-fog">
              Hosting Society
            </h3>
            <Link
              to={`/societies/${eventItem.societyId}`}
              className="flex items-center justify-between p-4 bg-transparent hover:bg-lumen-stone rounded-cards border border-vast-ink/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                {eventItem.society.logoUrl ? (
                  <img
                    src={getSocietyLogo(eventItem.society.logoUrl)}
                    alt={eventItem.society.name}
                    className="w-12 h-12 rounded-inputs object-cover border border-vast-ink/20"
                  />
                ) : (
                  <div className="p-3 bg-blue-600/20 text-vast-ink rounded-inputs">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-vast-ink group-hover:text-vast-ink transition-colors">
                    {eventItem.society.name}
                  </h4>
                  <p className="text-xs text-fog">View official society profile →</p>
                </div>
              </div>

              <div className="px-3 py-1.5 bg-lumen-stone text-vast-ink font-medium text-xs font-semibold rounded-inputs group-hover:bg-white group-hover:text-black transition-colors">
                Visit Profile
              </div>
            </Link>
          </div>
        )}

        {/* 8. DSA Admin Audit Trail */}
        {user?.role === 'DSA_ADMIN' && eventItem.approvalStatus === 'PUBLISHED' && eventItem.dsaApprovedAt && (
          <div className="space-y-3 pt-4 border-t-2 border-vast-ink">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-fog">
              Administrative Audit Log
            </h3>
            <div className="bg-green-50 p-4 rounded-cards border-2 border-forest-ink space-y-2">
              <div className="flex items-center gap-2 font-bold text-forest-ink text-sm">
                <ShieldCheck className="w-5 h-5" />
                <h4>Approved & Published</h4>
              </div>
              <p className="text-sm text-vast-ink font-medium">
                Approved by DSA Admin on {new Date(eventItem.dsaApprovedAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              {eventItem.dsaComments && (
                <div className="mt-2 pt-2 border-t border-forest-ink/20">
                  <span className="text-xs font-bold text-forest-ink block mb-1">Approval Comments:</span>
                  <p className="text-xs text-vast-ink">{eventItem.dsaComments}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

