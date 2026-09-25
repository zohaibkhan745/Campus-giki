import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'wispr';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-inputs transition-all outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer';

  const variants = {
    primary:
      'bg-vast-ink text-text-inverse hover:opacity-90 border border-brand-primary/30 shadow-md shadow-brand-primary/20 focus:ring-brand-primary',
    secondary:
      'bg-surface-hover hover:bg-surface text-text-primary border border-border-medium focus:ring-brand-primary',
    outline:
      'bg-transparent border border-border-medium hover:bg-surface-hover text-text-primary focus:ring-brand-primary',
    ghost:
      'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary font-medium focus:ring-brand-primary',
    destructive:
      'bg-red-600 hover:bg-red-500 text-white border border-red-500/30 shadow-md shadow-red-600/20 focus:ring-red-500',
    wispr:
      'bg-text-primary hover:opacity-90 text-text-inverse border border-border-medium rounded-buttons font-figtree transition-opacity font-bold',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
