import React from 'react';

export const SocietyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-inputs bg-lumen-stone" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-lumen-stone rounded w-3/4" />
          <div className="h-3 bg-lumen-stone rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-lumen-stone rounded w-full" />
        <div className="h-3 bg-lumen-stone rounded w-5/6" />
      </div>
      <div className="h-9 bg-lumen-stone rounded-inputs w-full pt-2" />
    </div>
  );
};
