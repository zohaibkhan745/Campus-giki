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
      // Keep subtle spinner visible briefly so user perceives the reconnection attempt
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  // Determine icon according to error category
  const renderIcon = (category: ErrorCategory) => {
    switch (category) {
      case 'offline':
        return <WifiOff className="w-8 h-8 text-amber-400" />;
      case 'server_unreachable':
        return <ServerCrash className="w-8 h-8 text-amber-400" />;
      case 'not_found':
        return <FileQuestion className="w-8 h-8 text-blue-400" />;
      case 'server_error':
      default:
        return <AlertCircle className="w-8 h-8 text-rose-400" />;
    }
  };

  const getBadgeStyle = (category: ErrorCategory) => {
    switch (category) {
      case 'server_unreachable':
      case 'offline':
        return 'bg-amber-500/10 border-amber-500/25 text-amber-300';
      case 'not_found':
        return 'bg-blue-500/10 border-blue-500/25 text-blue-300';
      default:
        return 'bg-rose-500/10 border-rose-500/25 text-rose-300';
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[24px] border border-white/10 bg-[#17181c]/80 backdrop-blur-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-center transition-all duration-300',
        compact ? 'p-8 sm:p-10' : 'p-12 sm:p-16',
        className,
      )}
    >
      {/* Ambient gradient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

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
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          {renderIcon(categorized.category)}
        </div>

        {/* Headline & Description */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-gray-400 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-950 hover:bg-gray-200 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={cn('w-4 h-4', isRetrying && 'animate-spin')} />
              <span>{isRetrying ? 'Connecting...' : actionText}</span>
            </button>
          )}

          {secondaryAction && (
            (secondaryAction.to || secondaryAction.href) ? (
              <Link
                to={(secondaryAction.to || secondaryAction.href)!}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-all active:scale-95"
              >
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <span>{secondaryAction.label}</span>
              </button>
            )
          )}

          {showBackAction && (
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}

          {!secondaryAction && !showBackAction && (
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-all active:scale-95"
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
