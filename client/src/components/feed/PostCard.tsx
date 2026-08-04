import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, X } from 'lucide-react';
import type { PostFeedItem } from '@/types/feed.types';

interface PostCardProps {
  item: PostFeedItem;
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

export const PostCard: React.FC<PostCardProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const isLongContent = item.content && item.content.length > 400;

  return (
    <article className="bg-lumen-cream rounded-cards p-8 space-y-6 text-left border-b border-vast-ink/10 pb-10">
      {/* Card Header: Society Meta */}
      <div className="flex items-center justify-between gap-4">
        {item.isAdminPost ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-vast-ink/20 bg-vast-ink flex items-center justify-center shrink-0 text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-[14px] text-vast-ink truncate flex items-center gap-1.5">
                {item.society.name}
              </span>
            </div>
          </div>
        ) : (
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
        )}

        <span className="text-fog text-[14px] font-medium shrink-0">
          {getRelativeTime(item.createdAt)}
        </span>
      </div>

      {/* Post Content */}
      <div className="space-y-1">
        <p className="font-normal text-[16px] md:text-[20px] text-vast-ink leading-relaxed whitespace-pre-line">
          {!isExpanded && isLongContent ? `${item.content.slice(0, 300).trim()}...` : item.content}
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

      {/* Optional Post Video */}
      {item.videoUrl && (
        <div className="w-full aspect-[16/9] overflow-hidden rounded-[24px] mt-4">
          <video
            controls
            src={item.videoUrl}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Optional Post Image */}
      {item.imageUrl && !item.videoUrl && (
        <div 
          className="w-full aspect-[16/9] overflow-hidden rounded-[24px] mt-4 cursor-pointer group relative"
          onClick={(e) => {
            e.stopPropagation();
            setIsImageModalOpen(true);
          }}
        >
          <img
            src={item.imageUrl}
            alt="Post Attachment"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.style.display = 'none';
              }
            }}
          />
          <div className="absolute inset-0 bg-vast-ink/0 group-hover:bg-vast-ink/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 bg-vast-ink text-pure-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-opacity">
              View Full Image
            </span>
          </div>
        </div>
      )}
      {/* Image Modal */}
      {isImageModalOpen && item.imageUrl && (
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
              src={item.imageUrl} 
              alt="Post Attachment Full" 
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-cards shadow-2xl border-2 border-pure-white/20"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </article>
  );
};
