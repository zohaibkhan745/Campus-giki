import React from 'react';
import { Outlet } from 'react-router-dom';
import { DockNav } from '@/components/navigation/DockNav';
import { Footer } from '@/components/navigation/Footer';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-inter text-gray-200 relative overflow-x-hidden">
      
      <main className="relative z-20 flex-1 min-w-0 min-h-screen pb-28 md:pb-32 w-full pt-8">
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




