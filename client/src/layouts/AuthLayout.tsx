import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AuthFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
    <p className="text-sm font-semibold text-slate-400">Loading...</p>
  </div>
);

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden font-sans text-white">
      <Suspense fallback={<AuthFallback />}>
        <Outlet />
      </Suspense>
    </div>
  );
};
