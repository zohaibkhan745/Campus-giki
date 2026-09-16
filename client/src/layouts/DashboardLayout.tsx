import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DockNav } from '@/components/navigation/DockNav';
import { Loader2 } from 'lucide-react';

const DashboardFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
    <p className="text-sm font-semibold text-slate-400">Loading dashboard...</p>
  </div>
);

export const DashboardLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-inter text-gray-200 relative overflow-x-hidden w-screen max-w-[100vw]">
      <main className="relative z-20 flex-1 min-w-0 min-h-screen pb-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full pt-8">
        <Suspense fallback={<DashboardFallback />}>
          <div className="w-full h-full">
            <Outlet />
          </div>
        </Suspense>
        <div className="focus-backdrop" id="focusBackdrop"></div>
      </main>

      <DockNav />
    </div>
  );
};


