import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Building2 } from 'lucide-react';
import type { EventFeedItem } from '@/types/feed.types';

interface EventCardProps {
  item: EventFeedItem;
}

export const EventCard: React.FC<EventCardProps> = ({ item }) => {
  const formattedDate = new Date(item.eventDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="bg-lumen-cream border-2 border-vast-ink rounded-cards p-8 space-y-6 text-left transition-transform hover:-translate-y-0.5">
      {/* Card Header: Society Meta */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {item.society.logoUrl ? (
            <img
              src={item.society.logoUrl}
              alt={item.society.name}
              className="w-8 h-8 rounded-full border-2 border-vast-ink object-cover bg-lumen-stone shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-vast-ink bg-lavender-whisper flex items-center justify-center shrink-0 text-vast-ink">
              <Building2 className="w-4 h-4" />
            </div>
          )}
          <span className="font-medium text-[14px] text-vast-ink truncate">
            {item.society.name}
          </span>
        </div>

        {item.society.category && (
          <span className="bg-forest-ink text-lumen-cream rounded-badges px-3 py-1 text-xs font-semibold shrink-0">
            {item.society.category.name}
          </span>
        )}
      </div>

      {/* Event Content */}
      <div className="space-y-3">
        <h2 className="font-semibold text-[20px] text-vast-ink leading-snug">
          {item.title}
        </h2>

        {/* Date & Venue Caption */}
        <div className="flex flex-wrap items-center gap-4 text-fog text-[14px] font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-vast-ink" />
            <span>{formattedDate} • {item.startTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-vast-ink" />
            <span>{item.venue}</span>
          </div>
        </div>

        <p className="text-vast-ink/80 text-[16px] leading-relaxed line-clamp-3">
          {item.description}
        </p>
      </div>

      {/* Optional Event Image */}
      {item.coverImageUrl && (
        <div className="overflow-hidden rounded-[24px] border-2 border-vast-ink">
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="w-full max-h-[360px] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80';
            }}
          />
        </div>
      )}

      {/* Card Footer: Action */}
      <div className="pt-2 flex items-center justify-between border-t-2 border-vast-ink/10">
        <Link
          to={`/events/${item.id}`}
          className="inline-flex items-center gap-2 font-semibold text-[14px] text-vast-ink hover:text-forest-ink transition-colors group"
        >
          <span>View details</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
};
