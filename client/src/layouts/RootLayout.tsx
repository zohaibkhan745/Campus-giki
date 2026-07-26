import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainNavigation } from '@/components/navigation/MainNavigation';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-lumen-cream text-vast-ink flex flex-col font-figtree">
      <MainNavigation />
      <Outlet />
    </div>
  );
};
