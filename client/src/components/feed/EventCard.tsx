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
    <article className="bg-[#17181c]/80 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-6 text-left border border-white/10 shadow-lg hover:shadow-xl hover:bg-[#1a1b20]/90 transition-all duration-300 hover:-translate-y-0.5 mb-6">
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
              className="w-10 h-10 rounded-full border border-white/10 object-cover bg-gray-800 shrink-0 group-hover:ring-2 group-hover:ring-green-400/50 transition-all shadow-inner"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border border-white/10 bg-gray-800 flex items-center justify-center shrink-0 text-gray-300 shadow-inner group-hover:ring-2 group-hover:ring-green-400/50 transition-all">
              <Building2 className="w-5 h-5" />
            </div>
          )}
          <span className="font-semibold text-[15px] text-gray-100 truncate group-hover:text-green-400 transition-colors">
            {item.society.name}
          </span>
        </Link>
        <div className="text-right text-sm font-medium text-gray-400">
          {getRelativeTime(item.createdAt)}
        </div>
      </div>

      {/* Event Content */}
      <div className="space-y-3">
        <h2 className="font-semibold text-[22px] md:text-[26px] text-white leading-tight">
          {item.title}
        </h2>

        {/* Date & Venue Caption */}
        <div className="flex flex-wrap items-center gap-4 text-gray-400 text-[14px] font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formattedDate} • {item.startTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{item.venue}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className={`text-gray-300 text-[16px] md:text-[18px] leading-relaxed whitespace-pre-line ${!allowExpand ? 'line-clamp-3 md:line-clamp-4' : ''}`}>
            {!isExpanded && isLongContent ? `${item.description.slice(0, 300).trim()}...` : item.description}
          </p>
          {isLongContent && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
              className="text-sm font-semibold text-green-400 hover:text-green-300 underline underline-offset-4 focus:outline-none transition-colors mt-2"
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      </div>

      {/* Optional Event Image */}
      {item.coverImageUrl && (
        <div 
          className="w-full aspect-[16/9] overflow-hidden rounded-xl mt-4 cursor-pointer group relative border border-white/5 shadow-inner"
          onClick={(e) => {
            e.stopPropagation();
            setIsImageModalOpen(true);
          }}
        >
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center backdrop-blur-[1px]">
            <span className="opacity-0 group-hover:opacity-100 bg-gray-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition-all transform scale-95 group-hover:scale-100 border border-white/10">
              View Full Image
            </span>
          </div>
        </div>
      )}

      {/* Card Footer: Action */}
      <div className="pt-2 flex items-center justify-between">
        <Link
          to={`/events/${item.id}`}
          className="inline-flex items-center gap-2 font-semibold text-[14px] text-gray-200 hover:text-green-400 transition-colors group"
        >
          <span>View details</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Image Modal */}
      {isImageModalOpen && item.coverImageUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-default" 
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
              className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white transition-colors bg-gray-800/50 rounded-full hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={item.coverImageUrl} 
              alt={item.title} 
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
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
