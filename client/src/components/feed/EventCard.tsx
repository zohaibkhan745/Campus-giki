import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Building2, X } from 'lucide-react';
import type { EventFeedItem } from '@/types/feed.types';

interface EventCardProps {
  item: EventFeedItem;
  allowExpand?: boolean;
}

const getRelativeTime = (dateInput: string | Date): string => {
  const now = new Date();
  const date = new Date(dateInput);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime()) || diffInSeconds < 30) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const EventCard: React.FC<EventCardProps> = ({ item, allowExpand = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const isLongContent = allowExpand && item.description && item.description.length > 400;

  const formattedDate = new Date(item.eventDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="bg-lumen-cream rounded-cards p-8 space-y-6 text-left border-b border-vast-ink/10 pb-10">
      {/* Card Header: Society Meta */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to={`/societies/${item.society.id}`}
          className="flex items-center gap-3 group"
          onClick={(e) => e.stopPropagation()}
        >
          {item.society.logoUrl ? (
            <img
              src={item.society.logoUrl}
              alt={item.society.name}
              className="w-8 h-8 rounded-full border border-vast-ink/20 object-cover bg-lumen-stone shrink-0 group-hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border border-vast-ink/20 bg-lavender-whisper flex items-center justify-center shrink-0 text-vast-ink">
              <Building2 className="w-4 h-4" />
            </div>
          )}
          <span className="font-medium text-[14px] text-vast-ink truncate group-hover:underline underline-offset-2">
            {item.society.name}
          </span>
        </Link>
        <div className="text-right text-[13px] font-medium text-fog">
          {getRelativeTime(item.createdAt)}
        </div>
      </div>

      {/* Event Content */}
      <div className="space-y-3">
        <h2 className="font-eb-garamond font-normal text-[24px] md:text-[28px] text-vast-ink leading-tight">
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

        <div className="space-y-1">
          <p className={`text-vast-ink/80 text-[16px] leading-relaxed whitespace-pre-line ${!allowExpand ? 'line-clamp-3 md:line-clamp-4' : ''}`}>
            {!isExpanded && isLongContent ? `${item.description.slice(0, 300).trim()}...` : item.description}
          </p>
          {isLongContent && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
              className="text-sm font-semibold text-vast-ink/70 hover:text-vast-ink underline underline-offset-2 focus:outline-none transition-colors mt-1"
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      </div>

      {/* Optional Event Image */}
      {item.coverImageUrl && (
        <div 
          className="w-full aspect-[16/9] overflow-hidden rounded-[24px] cursor-pointer group relative"
          onClick={(e) => {
            e.stopPropagation();
            setIsImageModalOpen(true);
          }}
        >
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-vast-ink/0 group-hover:bg-vast-ink/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 bg-vast-ink text-pure-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-opacity">
              View Full Image
            </span>
          </div>
        </div>
      )}

      {/* Card Footer: Action */}
      <div className="pt-2 flex items-center justify-between">
        <Link
          to={`/events/${item.id}`}
          className="inline-flex items-center gap-2 font-semibold text-[14px] text-vast-ink hover:text-forest-ink transition-colors group"
        >
          <span>View details</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      {/* Image Modal */}
      {isImageModalOpen && item.coverImageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4 backdrop-blur-sm cursor-default" 
          onClick={(e) => {
            e.stopPropagation();
            setIsImageModalOpen(false);
          }}
        >
          <div className="relative max-w-5xl w-full max-h-screen flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsImageModalOpen(false);
              }}
              className="absolute -top-12 right-0 p-2 text-pure-white hover:text-red-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={item.coverImageUrl} 
              alt={item.title} 
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-cards shadow-2xl border-2 border-pure-white/20"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        </div>
      )}
    </article>
  );
};
