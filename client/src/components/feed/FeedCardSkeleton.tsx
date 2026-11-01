import React from 'react';

export const FeedCardSkeleton: React.FC = () => {
  return (
    <div className="card-wrapper rounded-[28px] overflow-hidden border border-border-medium bg-surface p-6 flex flex-col justify-between animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border-subtle" />
          <div className="h-4 w-28 bg-surface-elevated rounded-full" />
        </div>
        <div className="h-5 w-14 bg-surface-elevated rounded-full" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3 flex-1 flex flex-col justify-center my-4">
        <div className="h-32 w-full bg-surface-elevated rounded-2xl border border-border-subtle" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-elevated" />
          <div className="h-3 w-20 bg-surface-elevated rounded" />
        </div>
        <div className="h-7 w-16 bg-surface-elevated rounded-lg" />
      </div>
    </div>
  );
};

