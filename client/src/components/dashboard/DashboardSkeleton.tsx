import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse text-left">
      {/* Welcome Card Skeleton */}
      <div className="h-28 bg-pure-white rounded-cards border-2 border-vast-ink p-6 space-y-3" />

      {/* Profile & Stats Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-44 bg-pure-white rounded-cards border-2 border-vast-ink p-6 space-y-4" />
        <div className="h-44 bg-pure-white rounded-cards border-2 border-vast-ink p-6 space-y-4" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-pure-white rounded-cards border-2 border-vast-ink p-5 space-y-2" />
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="h-24 bg-pure-white rounded-cards border-2 border-vast-ink p-5" />

      {/* Events Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-pure-white rounded-cards border-2 border-vast-ink p-6 space-y-4" />
        <div className="h-64 bg-pure-white rounded-cards border-2 border-vast-ink p-6 space-y-4" />
      </div>
    </div>
  );
};
