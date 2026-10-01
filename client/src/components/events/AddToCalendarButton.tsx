import React, { useState, useRef, useEffect } from 'react';
import {
  CalendarPlus,
  Calendar,
  Download,
  ChevronDown,
  ExternalLink,
  Check,
} from 'lucide-react';
import type { CalendarEventData } from '@/lib/calendar';
import {
  createGoogleCalendarUrl,
  createOutlookCalendarUrl,
  createOffice365CalendarUrl,
  createYahooCalendarUrl,
  downloadIcsFile,
} from '@/lib/calendar';
import { globalNotification } from '@/contexts/NotificationContext';

export interface AddToCalendarButtonProps {
  event: {
    id?: string;
    title: string;
    description?: string;
    eventDate: string | Date;
    startTime?: string;
    endTime?: string;
    venue?: string;
    society?: { name?: string } | null;
    societyName?: string;
    registrationLink?: string | null;
  };
  variant?: 'primary' | 'secondary' | 'subtle' | 'compact';
  className?: string;
  buttonText?: string;
  align?: 'left' | 'right';
  showChevron?: boolean;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  event,
  variant = 'primary',
  className = '',
  buttonText = 'Add to Calendar',
  align = 'left',
  showChevron = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const eventData: CalendarEventData = {
    id: event.id,
    title: event.title,
    description: event.description,
    eventDate: event.eventDate,
    startTime: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    societyName: event.societyName || event.society?.name,
    url: event.registrationLink || (typeof window !== 'undefined' ? window.location.href : undefined),
  };

  // Close dropdown on click outside or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleGoogle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = createGoogleCalendarUrl(eventData);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleOutlook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = createOutlookCalendarUrl(eventData);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleOffice365 = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = createOffice365CalendarUrl(eventData);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleYahoo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = createYahooCalendarUrl(eventData);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleIcsDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    downloadIcsFile(eventData);
    setCopied(true);
    globalNotification.triggerSuccess?.('Downloaded calendar file (.ics)');
    setTimeout(() => setCopied(false), 2000);
    setIsOpen(false);
  };

  // Variant styling definitions
  let buttonClasses = '';
  switch (variant) {
    case 'primary':
      buttonClasses =
        'inline-flex items-center gap-2 px-5 py-3 bg-surface-elevated hover:bg-surface-hover active:scale-95 text-text-primary border border-border-medium hover:border-border-strong rounded-xl text-sm font-bold transition-all shadow-elevation-1 hover:shadow-elevation-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring';
      break;
    case 'secondary':
      buttonClasses =
        'inline-flex items-center gap-2 px-4 py-2.5 bg-surface-glass hover:bg-surface-hover active:scale-95 text-text-primary border border-border-medium hover:border-border-strong rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring backdrop-blur-md';
      break;
    case 'subtle':
      buttonClasses =
        'inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-elevated/70 hover:bg-surface-elevated active:scale-95 text-text-primary border border-border-subtle hover:border-border-medium rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer';
      break;
    case 'compact':
      buttonClasses =
        'inline-flex items-center justify-center p-2 rounded-lg bg-surface-elevated/80 hover:bg-surface-hover active:scale-90 text-text-primary border border-border-subtle transition-all cursor-pointer';
      break;
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`${buttonClasses} ${className}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Add to your personal calendar"
      >
        <CalendarPlus className="w-4 h-4 text-brand-primary shrink-0" />
        {variant !== 'compact' && <span>{buttonText}</span>}
        {showChevron && variant !== 'compact' && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-56 rounded-2xl bg-surface-elevated border border-border-medium shadow-modal p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-border-subtle mb-1">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Add Event To
            </p>
          </div>

          {/* 1. Google Calendar */}
          <button
            type="button"
            role="menuitem"
            onClick={handleGoogle}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover hover:text-text-primary rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-blue-500/10 text-blue-500 font-bold text-[10px]">
                G
              </span>
              <span>Google Calendar</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* 2. Apple / Default iCal */}
          <button
            type="button"
            role="menuitem"
            onClick={handleIcsDownload}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover hover:text-text-primary rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <span>Apple Calendar (iCal)</span>
            </div>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Download className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>

          {/* 3. Outlook Live */}
          <button
            type="button"
            role="menuitem"
            onClick={handleOutlook}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover hover:text-text-primary rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-sky-500/10 text-sky-500 font-bold text-[10px]">
                O
              </span>
              <span>Outlook.com</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* 4. Microsoft 365 */}
          <button
            type="button"
            role="menuitem"
            onClick={handleOffice365}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover hover:text-text-primary rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">
                365
              </span>
              <span>Microsoft 365</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* 5. Yahoo Calendar */}
          <button
            type="button"
            role="menuitem"
            onClick={handleYahoo}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover hover:text-text-primary rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-purple-500/10 text-purple-500 font-bold text-[10px]">
                Y
              </span>
              <span>Yahoo Calendar</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <div className="my-1 border-t border-border-subtle" />

          {/* 6. Direct .ics File Download */}
          <button
            type="button"
            role="menuitem"
            onClick={handleIcsDownload}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-text-muted" />
            <span>Download .ics File</span>
          </button>
        </div>
      )}
    </div>
  );
};
