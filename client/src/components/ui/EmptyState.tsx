import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FilterX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  to?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  onClearFilters?: () => void;
  clearFiltersLabel?: string;
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  secondaryAction,
  onClearFilters,
  clearFiltersLabel = 'Clear All Filters',
  className,
  compact = false,
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[24px] border border-white/10 bg-[#17181c]/80 backdrop-blur-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-center transition-all duration-300',
        compact ? 'p-8 sm:p-10' : 'p-12 sm:p-16',
        className,
      )}
    >
      {/* Subtle radial ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto space-y-4">
        {/* Glowing Icon Badge */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.3)] text-gray-300">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <Icon className="w-8 h-8 text-white/80" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-gray-400 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Filter Clear Pill */}
        {onClearFilters && (
          <div className="pt-1">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <FilterX className="w-3.5 h-3.5 text-amber-400" />
              <span>{clearFiltersLabel}</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
            {action && (
              action.to ? (
                <Link
                  to={action.to}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-950 hover:bg-gray-200 text-sm font-bold shadow-lg transition-all active:scale-95"
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                  <span>{action.label}</span>
                </Link>
              ) : (
                <button
                  onClick={action.onClick}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-950 hover:bg-gray-200 text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                  <span>{action.label}</span>
                </button>
              )
            )}

            {secondaryAction && (
              secondaryAction.to ? (
                <Link
                  to={secondaryAction.to}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-all active:scale-95"
                >
                  {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
                  <span>{secondaryAction.label}</span>
                </Link>
              ) : (
                <button
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-all active:scale-95 cursor-pointer"
                >
                  {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
                  <span>{secondaryAction.label}</span>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
