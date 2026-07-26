import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const MainNavigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Calendar', path: '/events' },
    { label: 'Clubs', path: '/societies' },
    ...(user ? [{ label: 'Profile', path: '/dashboard' }] : []),
  ];

  return (
    <div className="sticky top-4 sm:top-6 z-50 w-full px-4 md:px-6 max-w-[1200px] mx-auto font-figtree">
      <nav className="relative flex items-center justify-between bg-lumen-cream border-2 border-vast-ink rounded-badges pl-6 pr-2 py-2">
        {/* Left Side: Wordmark */}
        <Link to="/" className="font-semibold text-[18px] md:text-[20px] text-vast-ink leading-none hover:opacity-80 transition-opacity">
          GIKI Campus
        </Link>

        <div className="flex items-center gap-2">
          {/* Center: Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 mr-4">
            {navLinks.map((link) => {
              // Exact match for Home to avoid matching every route
              const isActive = link.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-[16px] font-medium rounded-badges transition-colors ${
                    isActive
                      ? 'bg-lavender-whisper text-vast-ink'
                      : 'text-vast-ink hover:bg-lumen-stone'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Edge: Auth */}
          {!user && (
            <Link
              to="/login"
              className="bg-lavender-whisper border-2 border-vast-ink rounded-badges font-medium text-[14px] text-vast-ink px-4 py-2 hover:bg-lumen-stone transition-colors"
            >
              Log in
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 ml-1 text-vast-ink rounded-full hover:bg-lumen-stone transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Panel */}
      {isMobileMenuOpen && (
        <div className="absolute top-[calc(100%+12px)] left-4 right-4 md:hidden bg-lumen-cream border-2 border-vast-ink rounded-cards p-4 flex flex-col gap-2 z-40">
          {navLinks.map((link) => {
            const isActive = link.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(link.path);
                
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 text-[16px] font-medium rounded-badges transition-colors ${
                  isActive
                    ? 'bg-lavender-whisper text-vast-ink'
                    : 'text-vast-ink hover:bg-lumen-stone'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
