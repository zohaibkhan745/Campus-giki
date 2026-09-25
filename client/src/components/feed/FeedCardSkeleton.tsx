import React from 'react';

export const FeedCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-3xl p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border-subtle" />
          <div className="h-4 w-32 bg-surface-elevated rounded-full" />
        </div>
        <div className="h-6 w-20 bg-surface-elevated rounded-full" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-3/4 bg-surface-elevated rounded-xl" />
        <div className="h-4 w-1/2 bg-surface-elevated rounded-xl" />
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full bg-surface-elevated rounded-lg" />
          <div className="h-4 w-5/6 bg-surface-elevated rounded-lg" />
        </div>
      </div>

      {/* Image Skeleton */}
      <div className="h-48 w-full bg-surface-elevated rounded-2xl border border-border-subtle" />
    </div>
  );
};
