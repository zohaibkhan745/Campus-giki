import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'segmented';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  variant = 'icon',
}) => {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex items-center p-1 bg-surface-glass border border-border-subtle rounded-xl backdrop-blur-md',
          className
        )}
        role="group"
        aria-label="Theme selector"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            theme === 'light'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          )}
          aria-pressed={theme === 'light'}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            theme === 'dark'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          )}
          aria-pressed={theme === 'dark'}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            theme === 'system'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          )}
          aria-pressed={theme === 'system'}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>System</span>
        </button>
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={cn(
        'group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-200 ease-out cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
        'text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:scale-110 active:scale-95',
        className
      )}
    >
      <span className="sr-only">Toggle theme</span>
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun
          className={cn(
            'w-5 h-5 absolute transition-all duration-300 stroke-current',
            isDark
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100 text-amber-500'
          )}
        />
        <Moon
          className={cn(
            'w-5 h-5 absolute transition-all duration-300 stroke-current',
            isDark
              ? 'rotate-0 scale-100 opacity-100 text-blue-400'
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>

      {/* Floating tooltip adhering to dock guidelines */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-text-primary bg-surface-elevated border border-border-medium rounded-lg shadow-xl backdrop-blur-md opacity-0 pointer-events-none transition-all duration-150 group-hover:opacity-100 group-hover:-translate-y-1 whitespace-nowrap z-50">
        {isDark ? 'Switch to Light' : 'Switch to Dark'}
      </span>
    </button>
  );
};
