import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ComingSoonPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-canvas">
      <div className="relative z-10 w-full max-w-[440px] p-8 sm:p-10 rounded-cards bg-surface-glass backdrop-blur-xl border border-border-medium shadow-elevation-2 text-text-primary flex flex-col gap-4 text-center items-center">
        <div 
          className="text-7xl font-extrabold leading-none tracking-tight mb-2 bg-gradient-to-br from-brand-primary to-indigo-500 bg-clip-text text-transparent"
        >
          XOX
        </div>
        
        <h3 className="text-2xl font-bold leading-tight text-text-primary">
          Coming Soon
        </h3>
        
        <p className="text-sm text-text-secondary leading-relaxed">
          This feature is currently under active development and will be available soon.
        </p>
        
        <div className="flex gap-3 w-full mt-2">
          <Link 
            to="/" 
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-text-primary text-text-inverse hover:opacity-90 transition-all text-center inline-flex justify-center items-center shadow-sm"
          >
            Return Home
          </Link>
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-text-primary bg-surface hover:bg-surface-hover border border-border-medium transition-all text-center inline-flex justify-center items-center cursor-pointer shadow-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
