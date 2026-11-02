import React from 'react';

export const SocietyCardSkeleton: React.FC = () => {
  return (
    <div className="card-wrapper flex flex-col w-full h-full rounded-[24px] overflow-hidden border border-border-medium bg-surface shadow-elevation-1 animate-pulse select-none">
      {/* Banner Skeleton */}
      <div className="w-full h-24 bg-surface-elevated shrink-0 relative">
        <div className="absolute top-3 right-3 h-4 w-20 rounded-full bg-surface" />
      </div>

      {/* Elevated Logo Skeleton */}
      <div className="px-4 -mt-8 flex items-end justify-between relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-surface border-2 border-border-medium shadow-elevation-1 p-1 shrink-0">
          <div className="w-full h-full rounded-xl bg-surface-elevated" />
        </div>
      </div>

      {/* Info Body Skeleton */}
      <div className="flex flex-col flex-1 p-4 pt-2 gap-2">
        <div className="h-5 bg-surface-elevated rounded-md w-3/4" />
        <div className="h-3 bg-surface-elevated rounded-md w-1/3" />
        <div className="space-y-1.5 mt-2">
          <div className="h-3 bg-surface-elevated rounded-md w-full" />
          <div className="h-3 bg-surface-elevated rounded-md w-4/5" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="bg-surface/95 border-t border-border-subtle p-3 px-4 flex items-center justify-between gap-2 shrink-0">
        <div className="h-3.5 bg-surface-elevated rounded-md w-20" />
        <div className="h-3.5 bg-surface-elevated rounded-md w-16" />
      </div>
    </div>
  );
};
