import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainNavigation } from '@/components/navigation/MainNavigation';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-lumen-cream text-vast-ink font-figtree">
      <MainNavigation />
      <main className="flex-1 p-4 sm:p-6 sm:px-12 max-w-7xl w-full mx-auto mt-4">
        <Outlet />
      </main>
    </div>
  );
};

