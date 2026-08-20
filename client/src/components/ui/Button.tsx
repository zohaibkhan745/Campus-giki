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
    'inline-flex items-center justify-center font-semibold rounded-inputs transition-all outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]';

  const variants = {
    primary:
      'bg-vast-ink hover:opacity-90 text-black border border-blue-500/30 shadow-lg shadow-blue-600/20 focus:ring-blue-500',
    secondary:
      'bg-lumen-stone hover:bg-lavender-whisper text-vast-ink border-2 border-vast-ink focus:ring-slate-500',
    outline:
      'bg-transparent border-2 border-vast-ink hover:bg-lumen-stone/60 text-vast-ink focus:ring-slate-500',
    ghost:
      'bg-transparent hover:bg-lumen-stone/60 text-vast-ink font-medium hover:text-vast-ink focus:ring-slate-500',
    destructive:
      'bg-red-600 hover:bg-red-500 text-white border border-red-500/30 shadow-lg shadow-red-600/20 focus:ring-red-500',
    wispr:
      'bg-vast-ink hover:opacity-90 text-black border-2 border-vast-ink rounded-buttons font-figtree transition-opacity font-bold',
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
