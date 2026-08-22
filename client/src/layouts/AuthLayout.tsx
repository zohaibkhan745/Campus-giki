import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden font-sans text-white">
      <Outlet />
    </div>
  );
};
