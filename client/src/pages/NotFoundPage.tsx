import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-transparent">
      <div className="relative z-10 w-full max-w-[440px] p-8 sm:p-10 rounded-2xl bg-surface-glass backdrop-blur-xl border border-border-medium shadow-elevation-2 text-text-primary flex flex-col gap-4 text-center items-center">
        <div className="text-7xl font-extrabold leading-none tracking-tight text-brand-primary">
          404
        </div>

        <h3 className="text-2xl font-bold leading-tight text-text-primary">
          Page Not Found
        </h3>

        <p className="text-[0.95rem] text-text-secondary leading-relaxed">
          The requested resource could not be located on this server. It might have been removed, renamed, or temporarily made unavailable.
        </p>

        <div className="flex gap-3 w-full mt-2">
          <Link
            to="/"
            className="flex-1 py-3 px-4 rounded-inputs text-[0.95rem] font-semibold text-text-inverse bg-text-primary hover:opacity-90 transition-all text-center inline-flex justify-center items-center cursor-pointer shadow-sm"
          >
            Return Home
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-4 rounded-inputs text-[0.95rem] font-semibold text-text-primary bg-surface-hover hover:bg-surface border border-border-medium transition-all text-center inline-flex justify-center items-center cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
