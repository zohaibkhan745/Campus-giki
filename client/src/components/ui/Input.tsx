import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'wispr';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, variant = 'default', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-xs font-semibold uppercase tracking-wider text-text-secondary",
              variant === 'wispr' && "font-bold"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className={cn(
              "absolute left-3 pointer-events-none flex items-center justify-center text-text-muted"
            )}>
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            className={cn(
              'w-full text-sm transition-all outline-none bg-surface text-text-primary placeholder:text-text-muted rounded-inputs border px-3.5 py-2.5 border-border-medium focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <div className={cn(
              "absolute right-3 flex items-center justify-center text-text-muted"
            )}>
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={inputId ? `${inputId}-error` : undefined} className="text-xs text-red-500 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
