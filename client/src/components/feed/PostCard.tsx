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
    <article className="bg-[#17181c]/80 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-6 text-left border border-white/10 shadow-lg hover:shadow-xl hover:bg-[#1a1b20]/90 transition-all duration-300 hover:-translate-y-0.5 mb-6">
      {/* Card Header: Society Meta */}
      <div className="flex items-center justify-between gap-4">
        {item.isAdminPost ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/10 bg-gray-800 flex items-center justify-center shrink-0 text-white shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[15px] text-gray-100 truncate flex items-center gap-1.5">
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
        )}

        <span className="text-gray-400 text-sm font-medium shrink-0">
          {getRelativeTime(item.createdAt)}
        </span>
      </div>

      {/* Post Content */}
      <div className="space-y-2">
        <p className="font-normal text-[16px] md:text-[18px] text-gray-300 leading-relaxed whitespace-pre-line">
          {!isExpanded && isLongContent ? `${item.content.slice(0, 300).trim()}...` : item.content}
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

      {/* Optional Post Video */}
      {item.videoUrl && (
        <div className="w-full aspect-[16/9] overflow-hidden rounded-xl mt-4 border border-white/5 shadow-inner">
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
          className="w-full aspect-[16/9] overflow-hidden rounded-xl mt-4 cursor-pointer group relative border border-white/5 shadow-inner"
          onClick={(e) => {
            e.stopPropagation();
            setIsImageModalOpen(true);
          }}
        >
          <img
            src={item.imageUrl}
            alt="Post Attachment"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.style.display = 'none';
              }
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center backdrop-blur-[1px]">
            <span className="opacity-0 group-hover:opacity-100 bg-gray-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition-all transform scale-95 group-hover:scale-100 border border-white/10">
              View Full Image
            </span>
          </div>
        </div>
      )}
      
      {/* Image Modal */}
      {isImageModalOpen && item.imageUrl && (
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
              src={item.imageUrl} 
              alt="Post Attachment Full" 
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
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
