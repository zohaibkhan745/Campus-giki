import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Users, User, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const MainNavigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Calendar', path: '/events', icon: CalendarDays },
    { label: 'Clubs', path: '/societies', icon: Users },
    ...(user
      ? [{ label: 'Profile', path: '/dashboard', icon: User }]
      : [{ label: 'Log in', path: '/login', icon: LogIn }]),
  ];

  return (
    <>
      {/* Desktop Top Navigation (Hidden on Mobile as bottom nav is active) */}
      <div className="hidden md:block sticky top-6 z-50 w-full px-6 max-w-[1200px] mx-auto font-figtree">
        <nav className="relative flex items-center justify-between bg-lumen-cream border-2 border-vast-ink rounded-badges pl-6 pr-2 py-2 shadow-[4px_4px_0px_0px_#1B1B18] transition-all">
          {/* Left Side: Wordmark */}
          <Link to="/" className="font-eb-garamond font-bold text-[24px] text-vast-ink leading-none hover:opacity-80 transition-opacity">
            GIKI Campus
          </Link>

          <div className="flex items-center gap-2">
            {/* Center: Desktop Nav */}
            <div className="flex items-center gap-1 mr-4">
              {navLinks.map((link) => {
                const isActive = link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 text-[16px] font-bold rounded-badges transition-all ${
                      isActive
                        ? 'bg-vast-ink text-pure-white shadow-md'
                        : 'text-vast-ink hover:bg-lumen-stone'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation (Material 3 style) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 font-figtree">
        <nav className="flex items-center justify-between bg-pure-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-vast-ink/10 rounded-[32px] px-4 py-2">
          {navLinks.map((link) => {
            const isActive = link.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(link.path);

            const Icon = link.icon;

            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex flex-col items-center justify-center gap-1 min-w-[64px]"
              >
                <div
                  className={`flex items-center justify-center w-14 h-8 rounded-full transition-colors ${
                    isActive ? 'bg-forest-ink/15 text-forest-ink' : 'text-vast-ink/60 hover:text-vast-ink'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[11px] font-bold transition-colors ${
                  isActive ? 'text-forest-ink' : 'text-vast-ink/60'
                }`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};
