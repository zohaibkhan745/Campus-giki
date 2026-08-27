import React from 'react';
import { Outlet } from 'react-router-dom';
import { DockNav } from '@/components/navigation/DockNav';
import { Footer } from '@/components/navigation/Footer';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-inter text-gray-200 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[#050507]/80 backdrop-blur-sm z-0 pointer-events-none"></div>
      
      <main className="relative z-20 flex-1 min-w-0 min-h-[100vh] pb-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full pt-8">
        <Outlet />
        <div className="focus-backdrop" id="focusBackdrop"></div>
      </main>

      <div className="relative z-10 w-full mt-auto">
        <Footer />
      </div>

      <DockNav />
    </div>
  );
};


