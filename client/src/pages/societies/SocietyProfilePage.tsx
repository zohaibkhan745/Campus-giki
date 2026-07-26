import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Tag,
  Globe,
  Mail,
  Share2,
  Link2,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ArrowLeft,
  ExternalLink,
  History,
  Loader2,
} from 'lucide-react';
import { societyService } from '@/services/society.service';
import type { EventItem } from '@/types/event.types';
import { Alert } from '@/components/ui/Alert';

export const SocietyProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Query society profile details
  const {
    data: society,
    isLoading: isLoadingSociety,
    isError: isErrorSociety,
  } = useQuery({
    queryKey: ['publicSociety', id],
    queryFn: () => societyService.getPublicSocietyById(id!),
    enabled: !!id,
  });

  // Query society public events (split into upcoming and past)
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
  } = useQuery({
    queryKey: ['publicSocietyEvents', id],
    queryFn: () => societyService.getPublicSocietyEvents(id!),
    enabled: !!id,
  });

  const upcomingEvents = eventsData?.upcoming || [];
  const pastEvents = eventsData?.past || [];

  if (isLoadingSociety) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-fog gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading society profile...</p>
      </div>
    );
  }

  if (isErrorSociety || !society) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        <Alert variant="error" message="Society not found or profile is not published." />
        <Link
          to="/societies"
          className="inline-flex items-center gap-2 text-sm text-vast-ink hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Society Directory</span>
        </Link>
      </div>
    );
  }

  const renderEventCard = (event: EventItem, isPast = false) => (
    <Link
      key={event.id}
      to={`/events/${event.id}`}
      className={`bg-pure-white rounded-cards border p-5 transition-all flex flex-col justify-between group ${
        isPast ? 'border-vast-ink opacity-80' : 'border-2 border-vast-ink hover:border-2 border-vast-ink'
      }`}
    >
      <div className="space-y-3">
        {event.coverImageUrl && (
          <div className="w-full h-36 rounded-inputs overflow-hidden bg-lumen-stone">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-vast-ink text-base leading-snug group-hover:text-vast-ink transition-colors">
            {event.title}
          </h4>
          {event.registrationLink && (
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 bg-pure-white border border-vast-ink text-vast-ink hover:bg-blue-500/20 rounded-inputs transition-colors shrink-0"
              title="Open External Registration Link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <p className="text-xs text-fog line-clamp-2">{event.description}</p>

        <div className="space-y-1.5 text-xs text-vast-ink font-medium pt-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-vast-ink shrink-0" />
            <span>
              {new Date(event.eventDate).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-vast-ink shrink-0" />
            <span>
              {event.startTime} - {event.endTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-forest-ink shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left py-4">
      {/* Top Back Navigation Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/societies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-fog hover:text-vast-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      </div>

      {/* 1. Hero Banner Section */}
      <div className="relative rounded-cards overflow-hidden border-2 border-vast-ink bg-lumen-stone">
        {/* Banner Image or Gradient Fallback */}
        <div className="w-full h-48 sm:h-64 bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 relative">
          {society.bannerUrl && (
            <img
              src={society.bannerUrl}
              alt={society.name}
              className="w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Hero Logo & Meta Info Bar */}
        <div className="relative px-6 pb-6 pt-0 -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {society.logoUrl ? (
              <img
                src={society.logoUrl}
                alt={society.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-cards object-cover border-4 border-slate-950 shadow-2xl bg-lumen-stone"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-cards bg-blue-600/20 border-4 border-slate-950 shadow-2xl flex items-center justify-center text-vast-ink">
                <Building2 className="w-12 h-12" />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-vast-ink">
                  {society.name}
                </h1>
                {society.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-pure-white border border-vast-ink text-vast-ink rounded-inputs text-xs font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    {society.category.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-vast-ink font-medium max-w-2xl">{society.shortDescription}</p>
            </div>
          </div>

          {/* Social Links Icons Bar (Only rendered if provided) */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            {society.website && (
              <a
                href={society.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-lumen-stone hover:bg-lavender-whisper text-vast-ink rounded-inputs transition-colors border-2 border-vast-ink"
                title="Official Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}

            {society.email && (
              <a
                href={`mailto:${society.email}`}
                className="p-2.5 bg-lumen-stone hover:bg-lavender-whisper text-vast-ink rounded-inputs transition-colors border-2 border-vast-ink"
                title="Official Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}

            {society.instagram && (
              <a
                href={society.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-lumen-stone hover:bg-lavender-whisper text-pink-400 rounded-inputs transition-colors border-2 border-vast-ink"
                title="Instagram"
              >
                <Share2 className="w-4 h-4" />
              </a>
            )}

            {society.facebook && (
              <a
                href={society.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-lumen-stone hover:bg-lavender-whisper text-blue-500 rounded-inputs transition-colors border-2 border-vast-ink"
                title="Facebook"
              >
                <Share2 className="w-4 h-4" />
              </a>
            )}

            {society.linkedin && (
              <a
                href={society.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-lumen-stone hover:bg-lavender-whisper text-cyan-400 rounded-inputs transition-colors border-2 border-vast-ink"
                title="LinkedIn"
              >
                <Link2 className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. About Society Section */}
      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-3">
        <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-2">
          About {society.name}
        </h2>
        <p className="text-sm text-vast-ink font-medium leading-relaxed whitespace-pre-line">
          {society.longDescription || society.shortDescription || 'No detailed overview provided.'}
        </p>
      </div>

      {/* 3. Upcoming Events Section (Nearest First) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
          <div className="flex items-center gap-2 font-bold text-lg text-vast-ink">
            <CalendarIcon className="w-5 h-5 text-vast-ink" />
            <h2>Upcoming Events ({upcomingEvents.length})</h2>
          </div>
        </div>

        {isLoadingEvents ? (
          <div className="py-8 text-center text-fog text-sm">
            Loading society events...
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-pure-white p-8 rounded-cards border-2 border-vast-ink text-center space-y-2">
            <CalendarIcon className="w-10 h-10 text-fog mx-auto" />
            <h3 className="font-semibold text-vast-ink font-medium text-sm">No Upcoming Events</h3>
            <p className="text-xs text-fog">
              {society.name} has no scheduled upcoming campus events right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => renderEventCard(event))}
          </div>
        )}
      </div>

      {/* 4. Past Events Section (Most Recent First) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
          <div className="flex items-center gap-2 font-bold text-lg text-vast-ink">
            <History className="w-5 h-5 text-fog" />
            <h2>Past Events ({pastEvents.length})</h2>
          </div>
        </div>

        {pastEvents.length === 0 ? (
          <div className="bg-pure-white p-6 rounded-cards border-2 border-vast-ink text-center text-xs text-fog">
            No past events recorded for this society.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => renderEventCard(event, true))}
          </div>
        )}
      </div>
    </div>
  );
};
