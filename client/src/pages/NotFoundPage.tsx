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
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-lumen-stone border-2 border-vast-ink hover:bg-lumen-stone text-vast-ink rounded-inputs text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
