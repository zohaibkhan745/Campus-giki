import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestoredNotice) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] max-w-lg w-[90%] pointer-events-none transition-all duration-300"
    >
      {!isOnline ? (
        <div className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/20 backdrop-blur-xl border border-amber-500/40 text-amber-200 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>You&apos;re currently offline. Attempting to reconnect...</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
        </div>
      ) : showRestoredNotice ? (
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/40 text-emerald-200 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            Connection restored. Syncing campus updates...
          </span>
        </div>
      ) : null}
    </div>
  );
};
