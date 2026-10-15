import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  direction?: 'up' | 'down' | 'auto';
}

interface DropdownPosition {
  placement: 'up' | 'down';
  left: number;
  top?: number;
  bottom?: number;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  event,
  variant = 'primary',
  className = '',
  buttonText = 'Add to Calendar',
  align = 'left',
  showChevron = true,
  direction = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const calculatePosition = useCallback((): DropdownPosition | null => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 310;
    const dropdownWidth = 250;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let placement: 'up' | 'down' = 'down';
    if (direction === 'up') {
      placement = 'up';
    } else if (direction === 'down') {
      placement = 'down';
    } else {
      // 'auto': if space below is insufficient for dropdown and more space above, open upwards
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        placement = 'up';
      } else {
        placement = 'down';
      }
    }

    let left = align === 'right' ? rect.right - dropdownWidth : rect.left;
    // Keep strictly within screen viewport boundaries with 8px buffer
    left = Math.max(8, Math.min(left, window.innerWidth - dropdownWidth - 8));

    return {
      placement,
      left,
      top: placement === 'down' ? rect.bottom + 6 : undefined,
      bottom: placement === 'up' ? window.innerHeight - rect.top + 6 : undefined,
    };
  }, [align, direction]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      const pos = calculatePosition();
      setDropdownPosition(pos);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close or reposition on scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    const update = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      // If button scrolled out of view, close dropdown
      if (rect.bottom < -20 || rect.top > window.innerHeight + 20) {
        setIsOpen(false);
        return;
      }
      setDropdownPosition(calculatePosition());
    };

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, calculatePosition]);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
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
      buttonClasses = `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring backdrop-blur-md ${
        isOpen
          ? 'bg-surface-hover text-brand-primary border border-brand-primary/40'
          : 'bg-surface-glass hover:bg-surface-hover active:scale-95 text-text-primary border border-border-medium hover:border-border-strong'
      }`;
      break;
    case 'subtle':
      buttonClasses =
        'inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-elevated/70 hover:bg-surface-elevated active:scale-95 text-text-primary border border-border-subtle hover:border-border-medium rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer';
      break;
    case 'compact':
      buttonClasses = `inline-flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
        isOpen
          ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/40 shadow-sm scale-95'
          : 'bg-surface-elevated/80 hover:bg-surface-hover active:scale-90 text-text-primary border border-border-subtle hover:border-border-medium'
      }`;
      break;
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        ref={buttonRef}
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

      {isOpen && dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          role="menu"
          aria-orientation="vertical"
          style={{
            position: 'fixed',
            left: `${dropdownPosition.left}px`,
            ...(dropdownPosition.placement === 'up'
              ? { bottom: `${dropdownPosition.bottom}px` }
              : { top: `${dropdownPosition.top}px` }),
            width: '250px',
          }}
          className={`z-[99999] rounded-2xl bg-surface-elevated/95 dark:bg-[#1a1f2e]/95 border border-border-medium shadow-2xl p-2 backdrop-blur-2xl animate-in ${
            dropdownPosition.placement === 'up'
              ? 'slide-in-from-bottom-2 fade-in zoom-in-95'
              : 'slide-in-from-top-2 fade-in zoom-in-95'
          } duration-150`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="px-3 py-2 border-b border-border-subtle mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Add Event To
            </span>
            <span className="text-[10px] font-medium text-text-muted">
              Choose Service
            </span>
          </div>

          {/* 1. Google Calendar */}
          <button
            type="button"
            role="menuitem"
            onClick={handleGoogle}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover hover:text-text-primary rounded-xl transition-colors cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-blue-500/15 text-blue-500 font-bold text-[10px] shadow-sm">
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
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover hover:text-text-primary rounded-xl transition-colors cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500 font-bold text-[10px] shadow-sm">
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
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover hover:text-text-primary rounded-xl transition-colors cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-sky-500/15 text-sky-500 font-bold text-[10px] shadow-sm">
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
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover hover:text-text-primary rounded-xl transition-colors cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-indigo-500/15 text-indigo-500 font-bold text-[10px] shadow-sm">
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
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover hover:text-text-primary rounded-xl transition-colors cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-purple-500/15 text-purple-500 font-bold text-[10px] shadow-sm">
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
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5 text-text-muted" />
            <span>Download .ics File</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};
