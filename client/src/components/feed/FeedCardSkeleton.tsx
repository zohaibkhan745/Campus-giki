import React from 'react';

export const FeedCardSkeleton: React.FC = () => {
  return (
    <div className="bg-lumen-cream border-2 border-vast-ink rounded-cards p-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-lumen-stone border-2 border-vast-ink/30" />
          <div className="h-4 w-32 bg-lumen-stone rounded-badges" />
        </div>
        <div className="h-6 w-20 bg-lumen-stone rounded-badges" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-3/4 bg-lumen-stone rounded-inputs" />
        <div className="h-4 w-1/2 bg-lumen-stone rounded-inputs" />
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full bg-lumen-stone rounded" />
          <div className="h-4 w-5/6 bg-lumen-stone rounded" />
        </div>
      </div>

      {/* Image Skeleton */}
      <div className="h-48 w-full bg-lumen-stone rounded-[24px] border-2 border-vast-ink/20" />
    </div>
  );
};
