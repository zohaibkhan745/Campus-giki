import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-lumen-cream flex flex-col justify-center items-center text-center p-6 space-y-4">
      <div className="p-3 bg-pure-white border border-vast-ink border border-red-500/20 text-red-400 rounded-cards">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-vast-ink">404 - Page Not Found</h1>
      <p className="text-fog max-w-md">
        The requested page does not exist or has been moved.
      </p>
      <Link
          to="/"
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
    </div>
  );
};
