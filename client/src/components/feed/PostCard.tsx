import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Megaphone } from 'lucide-react';
import type { PostFeedItem } from '@/types/feed.types';

interface PostCardProps {
  item: PostFeedItem;
}

export const PostCard: React.FC<PostCardProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongContent = item.content && item.content.length > 250;

  const formattedTime = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="bg-lumen-cream border-2 border-vast-ink rounded-cards p-8 space-y-6 text-left transition-transform hover:-translate-y-0.5">
      {/* Card Header: Society Meta */}
      <div className="flex items-center justify-between gap-4">
        {item.isAdminPost ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-vast-ink bg-vast-ink flex items-center justify-center shrink-0 text-white">
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
                className="w-8 h-8 rounded-full border-2 border-vast-ink object-cover bg-lumen-stone shrink-0 group-hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-vast-ink bg-lavender-whisper flex items-center justify-center shrink-0 text-vast-ink">
                <Building2 className="w-4 h-4" />
              </div>
            )}
            <span className="font-medium text-[14px] text-vast-ink truncate group-hover:underline underline-offset-2">
              {item.society.name}
            </span>
          </Link>
        )}

        <span className={`inline-flex items-center gap-1 rounded-badges px-3 py-1 text-xs font-semibold shrink-0 border ${
          item.isAdminPost ? 'bg-vast-ink text-white border-vast-ink' : 'bg-lumen-stone text-vast-ink border-vast-ink/20'
        }`}>
          <Megaphone className={`w-3 h-3 ${item.isAdminPost ? 'text-white' : 'text-forest-ink'}`} />
          <span>{item.isAdminPost ? 'Campus Notice' : 'Post'}</span>
        </span>
      </div>

      {/* Post Content */}
      <div className="space-y-1">
        <p className={`font-normal text-[16px] md:text-[20px] text-vast-ink leading-relaxed whitespace-pre-line ${!isExpanded ? 'line-clamp-3 md:line-clamp-4' : ''}`}>
          {item.content}
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

      {/* Optional Post Image */}
      {item.imageUrl && (
        <div className="overflow-hidden rounded-[24px] border-2 border-vast-ink mt-4">
          <img
            src={item.imageUrl}
            alt="Post Attachment"
            className="w-full max-h-[400px] object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.style.display = 'none';
              }
            }}
          />
        </div>
      )}

      {/* Footer Timestamp */}
      <div className="pt-2 border-t-2 border-vast-ink/10 text-fog text-[14px] font-medium">
        Posted on {formattedTime}
      </div>
    </article>
  );
};
