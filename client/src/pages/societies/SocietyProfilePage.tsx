import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import type { EventFeedItem } from '@/types/feed.types';
import { Alert } from '@/components/ui/Alert';
import { EventCard } from '@/components/feed/EventCard';

export const SocietyProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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



  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left pt-4 md:pt-14 pb-8 px-4 font-figtree">
      {/* Top Back Navigation Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-pure-white hover:bg-lumen-stone border-2 border-vast-ink text-vast-ink text-xs font-bold rounded-buttons transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1B1B18]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* 1. Hero Banner Image Cover */}
      <div className="relative rounded-cards overflow-hidden border-2 border-vast-ink bg-vast-ink shadow-sm h-44 sm:h-60">
        {society.bannerUrl ? (
          <img
            src={society.bannerUrl}
            alt={society.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-vast-ink to-slate-900" />
        )}
      </div>

      {/* 2. High-Contrast Society Title & Info Header Card */}
      <div className="bg-lumen-cream p-6 sm:p-8 rounded-cards border-2 border-vast-ink space-y-5 relative -mt-10 sm:-mt-14 mx-2 sm:mx-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {society.logoUrl ? (
              <img
                src={society.logoUrl}
                alt={society.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-cards object-cover border-2 border-vast-ink shadow-md bg-pure-white shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-cards bg-lavender-whisper border-2 border-vast-ink shadow-md flex items-center justify-center text-vast-ink shrink-0">
                <Building2 className="w-12 h-12" />
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold font-eb-garamond text-vast-ink leading-tight tracking-tight">
                  {society.name}
                </h1>
                {society.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pure-white border-2 border-vast-ink text-vast-ink rounded-inputs text-xs font-bold shadow-sm">
                    <Tag className="w-3.5 h-3.5 text-forest-ink" />
                    {society.category.name}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-fog max-w-2xl leading-relaxed">
                {society.shortDescription}
              </p>
            </div>
          </div>

          {/* Social Links Bar */}
          <div className="flex items-center gap-2 pt-2 md:pt-0 shrink-0">
            {society.website && (
              <a
                href={society.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-pure-white hover:bg-lumen-stone text-vast-ink rounded-inputs transition-all border-2 border-vast-ink shadow-sm"
                title="Official Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}

            {society.email && (
              <a
                href={`mailto:${society.email}`}
                className="p-2.5 bg-pure-white hover:bg-lumen-stone text-vast-ink rounded-inputs transition-all border-2 border-vast-ink shadow-sm"
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
                className="p-2.5 bg-pure-white hover:bg-lumen-stone text-pink-600 rounded-inputs transition-all border-2 border-vast-ink shadow-sm"
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
                className="p-2.5 bg-pure-white hover:bg-lumen-stone text-blue-600 rounded-inputs transition-all border-2 border-vast-ink shadow-sm"
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
                className="p-2.5 bg-pure-white hover:bg-lumen-stone text-indigo-600 rounded-inputs transition-all border-2 border-vast-ink shadow-sm"
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
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                item={
                  {
                    ...event,
                    type: 'event',
                    society: event.society || society,
                  } as EventFeedItem
                }
              />
            ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
            {pastEvents.map((event) => (
              <EventCard
                key={event.id}
                item={
                  {
                    ...event,
                    type: 'event',
                    society: event.society || society,
                  } as EventFeedItem
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
