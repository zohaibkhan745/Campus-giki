import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-lumen-cream text-vast-ink flex flex-col justify-center items-center p-4 relative overflow-hidden font-figtree">
      {/* Background Decorative */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lavender-whisper rounded-full blur-3xl pointer-events-none opacity-50" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ember-glow rounded-full blur-3xl pointer-events-none opacity-20" />

      <div className="w-full max-w-md space-y-6 z-10">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-vast-ink hover:opacity-80 transition-colors font-eb-garamond"
          >
            <div className="p-2 bg-lavender-whisper border-2 border-vast-ink rounded-badges text-vast-ink">
              <GraduationCap className="w-8 h-8" />
            </div>
            <span className="text-2xl sm:text-3xl">Campus GIKI</span>
          </Link>
          <p className="text-sm font-medium text-fog">
            Centralized Platform for GIKI Students & Societies
          </p>
        </div>

        <div className="bg-lumen-cream p-8 rounded-cards border-2 border-vast-ink">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
