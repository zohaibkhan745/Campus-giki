import React from 'react';

export const EventDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4 animate-pulse">
      <div className="h-6 w-32 bg-lumen-stone rounded" />
      <div className="bg-lumen-cream p-6 sm:p-8 rounded-cards border-2 border-vast-ink space-y-6">
        <div className="w-full h-64 bg-lumen-stone rounded-cards" />
        <div className="space-y-3">
          <div className="h-8 bg-lumen-stone rounded w-2/3" />
          <div className="h-12 bg-lumen-stone rounded-cards w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-16 bg-lumen-stone rounded-cards" />
          <div className="h-16 bg-lumen-stone rounded-cards" />
          <div className="h-16 bg-lumen-stone rounded-cards" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-lumen-stone rounded w-full" />
          <div className="h-4 bg-lumen-stone rounded w-5/6" />
          <div className="h-4 bg-lumen-stone rounded w-4/6" />
        </div>
      </div>
    </div>
  );
};
