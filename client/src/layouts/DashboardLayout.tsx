import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainNavigation } from '@/components/navigation/MainNavigation';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-lumen-cream text-vast-ink font-figtree">
      <MainNavigation />
      <main className="flex-1 min-w-0 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-4 md:pt-6">
        <Outlet />
      </main>
    </div>
  );
};

