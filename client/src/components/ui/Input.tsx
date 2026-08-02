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
              "block text-xs font-semibold uppercase tracking-wider",
              variant === 'wispr' ? "text-vast-ink" : "text-vast-ink font-medium"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className={cn(
              "absolute left-3 pointer-events-none flex items-center justify-center",
              variant === 'wispr' ? "text-vast-ink" : "text-fog"
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
              'w-full text-sm transition-all outline-none',
              variant === 'default' 
                ? 'bg-transparent text-vast-ink placeholder:text-fog rounded-inputs border px-3.5 py-2.5 border border-vast-ink/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                : 'bg-transparent text-vast-ink placeholder:text-fog rounded-inputs border border-vast-ink/20 px-3.5 py-2.5 focus:ring-0',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && variant === 'default' && 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20',
              error && variant === 'wispr' && 'border-red-500 focus:ring-0',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <div className={cn(
              "absolute right-3 flex items-center justify-center",
              variant === 'wispr' ? "text-vast-ink" : "text-fog"
            )}>
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={inputId ? `${inputId}-error` : undefined} className="text-xs text-red-400 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
