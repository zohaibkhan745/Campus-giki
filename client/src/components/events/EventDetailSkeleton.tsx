import React from 'react';

export const EventDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4 animate-pulse">
      <div className="h-6 w-32 bg-surface-elevated rounded" />
      <div className="bg-surface-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-6">
        <div className="w-full h-64 bg-surface-elevated rounded-2xl" />
        <div className="space-y-3">
          <div className="h-8 bg-surface-elevated rounded w-2/3" />
          <div className="h-12 bg-surface-elevated rounded-2xl w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-16 bg-surface-elevated rounded-2xl" />
          <div className="h-16 bg-surface-elevated rounded-2xl" />
          <div className="h-16 bg-surface-elevated rounded-2xl" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-surface-elevated rounded w-full" />
          <div className="h-4 bg-surface-elevated rounded w-5/6" />
          <div className="h-4 bg-surface-elevated rounded w-4/6" />
        </div>
      </div>
    </div>
  );
};
