import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  ShieldCheck,
  Building2,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { resolveImageUrl, getSocietyLogo } from '@/lib/utils';
import type { EventItem } from '@/types/event.types';

interface EventPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

export const EventPrintModal: React.FC<EventPrintModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [scale, setScale] = useState<number>(0.9);
  const [zoomMode, setZoomMode] = useState<'fit' | 'width' | 'actual'>('fit');

  const calculateScale = useCallback(() => {
    if (zoomMode === 'actual') return;

    const availableWidth = window.innerWidth - 64;
    const availableHeight = window.innerHeight - 140;

    // Standard A4 dimensions in px at 96 DPI
    const a4Width = 794;
    const a4Height = 1123;

    if (zoomMode === 'fit') {
      const scaleX = availableWidth / a4Width;
      const scaleY = availableHeight / a4Height;
      const newScale = Math.min(scaleX, scaleY, 1.15);
      setScale(Math.max(Number(newScale.toFixed(2)), 0.45));
    } else if (zoomMode === 'width') {
      const scaleX = availableWidth / a4Width;
      setScale(Math.max(Number(Math.min(scaleX, 1.3).toFixed(2)), 0.5));
    }
  }, [zoomMode]);

  useEffect(() => {
    if (isOpen) {
      calculateScale();
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen, calculateScale]);

  useEffect(() => {
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [calculateScale]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const refCode = `GIKI-DSA-EV-${event.id.slice(0, 8).toUpperCase()}`;
  const societyName = event.society?.name || 'Campus Society';
  const isApproved =
    event.approvalStatus === 'APPROVED' ||
    event.approvalStatus === 'PUBLISHED' ||
    event.isPublished;

  const formattedEventDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Date Not Specified';

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoomMode('actual');
    setScale((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 1.5));
  };

  const handleZoomOut = () => {
    setZoomMode('actual');
    setScale((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.4));
  };

  const handleResetZoom = () => {
    setZoomMode('fit');
    calculateScale();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Event Summary Document Preview"
      className="fixed inset-0 z-[9999] flex flex-col bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none print:static print:bg-white print:p-0 print:m-0"
    >
      {/* Top Controls Toolbar (Hidden when printing) */}
      <header className="relative z-50 flex items-center justify-between px-6 py-3.5 bg-surface border-b border-border-medium shadow-elevation-2 shrink-0 print:hidden text-text-primary">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Event Summary &amp; Details</h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
              <span>Ref: {refCode}</span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold">Ready for Print / PDF</span>
            </div>
          </div>
        </div>

        {/* Zoom & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-hover/80 rounded-xl p-1 border border-border-subtle gap-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-surface rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-medium px-2 text-text-primary min-w-[3.5rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-surface rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border-medium mx-0.5" />
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-surface rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Fit to Window"
              aria-label="Fit to Window"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ml-2"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print Document</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-xl text-text-muted hover:text-text-primary transition-colors cursor-pointer ml-1"
            title="Close Preview (Esc)"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Preview Container with Zoom Canvas */}
      <main
        className="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center print:p-0 print:m-0 print:overflow-visible print:block print:bg-white"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Printable A4 Document Sheet */}
        <article
          id="event-summary-printable"
          style={{
            width: '794px',
            minHeight: '1123px',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
          className="bg-white text-black shadow-2xl p-8 sm:p-10 flex flex-col justify-between rounded-sm border border-gray-300 print:shadow-none print:border-none print:p-6 print:w-full print:transform-none print:min-h-0 print:text-black"
        >
          <div className="space-y-4">
            {/* 1. Institutional Header */}
            <div className="border-b-2 border-black pb-3 text-center">
              <div className="flex items-center justify-between gap-4">
                <div className="text-left w-20 shrink-0">
                  <img
                    src="/giki-logo.png"
                    alt="GIKI Crest"
                    className="w-16 h-16 object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 text-center">
                  <h1 className="text-base font-black uppercase tracking-wider text-black leading-tight">
                    Ghulam Ishaq Khan Institute
                  </h1>
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 mt-0.5">
                    of Engineering Sciences and Technology, Topi, KP
                  </h2>
                  <div className="mt-1 inline-block px-3 py-0.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded print:bg-black print:text-white">
                    Directorate of Student Affairs (DSA)
                  </div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wide mt-1 text-black underline underline-offset-2">
                    Official Campus Event Summary
                  </h3>
                </div>
                <div className="text-right w-24 shrink-0 text-[10px] text-gray-700 font-mono">
                  <span className="font-bold block text-black">Doc Ref:</span>
                  <span className="font-black text-[11px] text-black block">{refCode}</span>
                  <span className="text-[9px] text-gray-500 block mt-0.5">
                    Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Top Title & Status Banner */}
            <div className="border border-gray-300 rounded p-3 bg-gray-50 flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-black text-white rounded">
                    {event.eventType || 'Campus Event'}
                  </span>
                  <span className="text-xs font-bold text-gray-600">
                    Host: <strong className="text-black">{societyName}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-black text-black tracking-tight leading-snug">
                  {event.title}
                </h2>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${
                    isApproved
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                      : 'bg-amber-100 text-amber-800 border-amber-500'
                  }`}
                >
                  {isApproved ? 'APPROVED' : (event.approvalStatus || 'PENDING REVIEW').replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* 3. Event Banner / Poster (Cleanly contained) */}
            {event.coverImageUrl && (
              <div className="w-full max-h-[190px] rounded border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center p-1.5">
                <img
                  src={resolveImageUrl(event.coverImageUrl)}
                  alt={event.title}
                  className="max-h-[180px] w-auto max-w-full object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 4. Schedule, Venue & Logistics Table */}
            <section className="space-y-1.5 text-left">
              <h4 className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-black px-2.5 py-1 border-l-4 border-black">
                Logistics &amp; Scheduling Details
              </h4>
              <div className="grid grid-cols-3 gap-2 border border-gray-300 p-2.5 rounded text-xs bg-white">
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase block">Event Date</span>
                  <span className="font-bold text-black block mt-0.5">{formattedEventDate}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase block">Timing</span>
                  <span className="font-bold text-black block mt-0.5">
                    {event.startTime || 'TBD'} - {event.endTime || 'TBD'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase block">Approved Venue</span>
                  <span className="font-bold text-black block mt-0.5">{event.venue || 'Campus Venue'}</span>
                </div>
              </div>
            </section>

            {/* 5. Person in Charge & Contact Details (Essential Requirement) */}
            <section className="space-y-1.5 text-left">
              <h4 className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-black px-2.5 py-1 border-l-4 border-black">
                Event Lead &amp; Society Contact Information
              </h4>
              <div className="grid grid-cols-3 gap-2 border border-gray-300 p-2.5 rounded text-xs bg-white">
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase block">Person in Charge</span>
                  <span className="font-bold text-black block mt-0.5">
                    {event.inChargeName || 'Society Appointed Lead'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase block">Registration / Student ID</span>
                  <span className="font-bold text-black block mt-0.5">
                    {event.inChargeRegNum || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase block">Official Contact No.</span>
                  <span className="font-bold text-black block mt-0.5">
                    {event.inChargeContact || 'N/A'}
                  </span>
                </div>
              </div>
            </section>

            {/* 6. Event Description & Scope */}
            <section className="space-y-1.5 text-left">
              <h4 className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-black px-2.5 py-1 border-l-4 border-black">
                Event Overview &amp; Description
              </h4>
              <div className="border border-gray-300 p-3 rounded text-xs text-gray-800 bg-white leading-relaxed whitespace-pre-line max-h-[140px] overflow-hidden">
                {event.description || 'No description provided.'}
              </div>
            </section>

            {/* 7. Official Rules & Directives (If present) */}
            {event.rules && (
              <section className="space-y-1.5 text-left">
                <h4 className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 px-2.5 py-1 border-l-4 border-amber-600">
                  DSA Directives &amp; Operational Rules
                </h4>
                <div className="border border-amber-200 bg-amber-50/40 p-2.5 rounded text-xs text-gray-800 leading-relaxed whitespace-pre-line">
                  {event.rules}
                </div>
              </section>
            )}
          </div>

          {/* 8. Institutional Verification & Approval Footer */}
          <div className="pt-4 border-t-2 border-black space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-8 text-xs text-left">
              {/* Advisor Column */}
              <div className="border border-gray-300 p-2.5 rounded space-y-2 bg-gray-50">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-600 block">
                  1. Faculty Advisor Endorsement
                </span>
                <div className="pt-3 border-b border-gray-400 border-dashed" />
                <div className="flex items-center justify-between text-[10px] text-gray-600">
                  <span>Sign &amp; Stamp</span>
                  <span>
                    {event.advisorApprovedAt
                      ? `Approved: ${new Date(event.advisorApprovedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Pending Endorsement'}
                  </span>
                </div>
              </div>

              {/* DSA Admin Column */}
              <div className="border border-gray-300 p-2.5 rounded space-y-2 bg-gray-50">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-600 block">
                  2. Directorate of Student Affairs (DSA)
                </span>
                <div className="pt-3 border-b border-gray-400 border-dashed" />
                <div className="flex items-center justify-between text-[10px] text-gray-600">
                  <span>Authorized Signature</span>
                  <span>
                    {event.dsaApprovedAt
                      ? `Approved: ${new Date(event.dsaApprovedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Pending Clearance'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      {/* Print-specific style overrides */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden;
          }
          #event-summary-printable,
          #event-summary-printable * {
            visibility: visible;
          }
          #event-summary-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

