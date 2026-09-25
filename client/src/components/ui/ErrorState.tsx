import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, WifiOff, ServerCrash, AlertCircle, ArrowLeft, Home, FileQuestion } from 'lucide-react';
import { categorizeError, type CategorizedError, type ErrorCategory } from '@/lib/error-utils';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  error?: unknown;
  title?: string;
  description?: string;
  message?: string;
  badge?: string;
  onRetry?: () => void | Promise<unknown>;
  actionText?: string;
  secondaryAction?: {
    label: string;
    to?: string;
    href?: string;
    onClick?: () => void;
  };
  showBackAction?: boolean;
  compact?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title: propTitle,
  description: propDescription,
  message: propMessage,
  badge: propBadge,
  onRetry,
  actionText: propActionText,
  secondaryAction,
  showBackAction = false,
  compact = false,
  className,
}) => {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);

  const categorized: CategorizedError = categorizeError(error);

  const title = propTitle || categorized.title;
  const description = propDescription || propMessage || categorized.message;
  const badge = propBadge || categorized.badge;
  const actionText = propActionText || categorized.suggestedAction;

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  const renderIcon = (category: ErrorCategory) => {
    switch (category) {
      case 'offline':
        return <WifiOff className="w-8 h-8 text-amber-500" />;
      case 'server_unreachable':
        return <ServerCrash className="w-8 h-8 text-amber-500" />;
      case 'not_found':
        return <FileQuestion className="w-8 h-8 text-brand-primary" />;
      case 'server_error':
      default:
        return <AlertCircle className="w-8 h-8 text-rose-500" />;
    }
  };

  const getBadgeStyle = (category: ErrorCategory) => {
    switch (category) {
      case 'server_unreachable':
      case 'offline':
        return 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-300';
      case 'not_found':
        return 'bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-300';
      default:
        return 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-300';
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[24px] border border-border-medium bg-surface-glass backdrop-blur-[20px] shadow-elevation-1 text-center transition-all duration-300',
        compact ? 'p-8 sm:p-10' : 'p-12 sm:p-16',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto space-y-4">
        {/* Status Pill Badge */}
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase',
            getBadgeStyle(categorized.category),
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span>{badge}</span>
        </div>

        {/* Icon Card */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border-medium shadow-sm">
          {renderIcon(categorized.category)}
        </div>

        {/* Headline & Description */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-text-secondary font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-text-primary text-text-inverse hover:opacity-90 text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={cn('w-4 h-4', isRetrying && 'animate-spin')} />
              <span>{isRetrying ? 'Connecting...' : actionText}</span>
            </button>
          )}

          {secondaryAction && (
            (secondaryAction.to || secondaryAction.href) ? (
              <Link
                to={(secondaryAction.to || secondaryAction.href)!}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-hover hover:bg-surface border border-border-medium text-text-primary text-sm font-semibold transition-all active:scale-95"
              >
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-hover hover:bg-surface border border-border-medium text-text-primary text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <span>{secondaryAction.label}</span>
              </button>
            )
          )}

          {showBackAction && (
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-hover hover:bg-surface border border-border-medium text-text-primary text-sm font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}

          {!secondaryAction && !showBackAction && (
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-hover hover:bg-surface border border-border-medium text-text-primary text-sm font-semibold transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
