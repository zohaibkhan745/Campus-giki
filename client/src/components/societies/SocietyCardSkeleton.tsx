import React from 'react';

export const SocietyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-surface-elevated" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-surface-elevated rounded-md w-3/4" />
          <div className="h-3 bg-surface-elevated rounded-md w-1/3" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-surface-elevated rounded-md w-full" />
        <div className="h-3 bg-surface-elevated rounded-md w-5/6" />
      </div>
      <div className="h-9 bg-surface-elevated rounded-xl w-full pt-2" />
    </div>
  );
};
