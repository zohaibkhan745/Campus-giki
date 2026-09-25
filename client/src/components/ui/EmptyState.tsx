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
        'relative overflow-hidden rounded-[24px] border border-border-medium bg-surface-glass backdrop-blur-[20px] shadow-elevation-1 text-center transition-all duration-300',
        compact ? 'p-8 sm:p-10' : 'p-12 sm:p-16',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto space-y-4">
        {/* Icon Badge */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border-medium shadow-sm text-text-primary">
          <Icon className="w-8 h-8 text-brand-primary" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-text-secondary font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Filter Clear Pill */}
        {onClearFilters && (
          <div className="pt-1">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-text-secondary bg-surface-hover hover:text-text-primary border border-border-medium transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <FilterX className="w-3.5 h-3.5 text-brand-accent" />
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-text-primary text-text-inverse hover:opacity-90 text-sm font-bold shadow-md transition-all active:scale-95"
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                  <span>{action.label}</span>
                </Link>
              ) : (
                <button
                  onClick={action.onClick}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-text-primary text-text-inverse hover:opacity-90 text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-hover hover:bg-surface border border-border-medium text-text-primary text-sm font-semibold transition-all active:scale-95"
                >
                  {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
                  <span>{secondaryAction.label}</span>
                </Link>
              ) : (
                <button
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-hover hover:bg-surface border border-border-medium text-text-primary text-sm font-semibold transition-all active:scale-95 cursor-pointer"
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
