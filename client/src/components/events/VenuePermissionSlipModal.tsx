import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  X,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import type { EventItem } from '@/types/event.types';

interface VenuePermissionSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  societyName?: string;
  societyLogo?: string | null;
}

// Standard A4 dimensions at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export const VenuePermissionSlipModal: React.FC<VenuePermissionSlipModalProps> = ({
  isOpen,
  onClose,
  event,
  societyName,
  societyLogo,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.75);
  const [zoomMode, setZoomMode] = useState<'fit' | 'width' | 'actual'>('fit');

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Auto-calculate scale to fit document completely on screen
  const calculateScale = useCallback(() => {
    if (!isOpen) return;

    // Viewport dimensions
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Available canvas space subtracting top toolbar (~64px) and page padding (~40px)
    const availableHeight = Math.max(viewportHeight - 110, 300);
    const availableWidth = Math.max(viewportWidth - 48, 300);

    if (zoomMode === 'fit') {
      const scaleH = availableHeight / A4_HEIGHT;
      const scaleW = availableWidth / A4_WIDTH;
      // Fit both height and width so entire A4 sheet is 100% visible without zooming out
      const fit = Math.min(scaleH, scaleW, 1.05);
      setScale(Math.max(Number(fit.toFixed(3)), 0.35));
    } else if (zoomMode === 'width') {
      const scaleW = availableWidth / A4_WIDTH;
      setScale(Math.min(Math.max(Number(scaleW.toFixed(3)), 0.5), 1.4));
    } else if (zoomMode === 'actual') {
      setScale(1.0);
    }
  }, [isOpen, zoomMode]);

  useEffect(() => {
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [calculateScale]);

  if (!isOpen || !event) return null;

  const eventDateObj = new Date(event.eventDate);
  const formattedEventDate = eventDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const refCode = `GIKI-DSA-VR-${event.id.slice(0, 8).toUpperCase()}`;
  const displaySociety = societyName || event.society?.name || 'Student Society';

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoomMode('actual');
    setScale((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 1.6));
  };

  const handleZoomOut = () => {
    setZoomMode('actual');
    setScale((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.35));
  };

  const handleFitPage = () => {
    setZoomMode('fit');
  };

  const handleFitWidth = () => {
    setZoomMode('width');
  };

  const handleResetActual = () => {
    setZoomMode('actual');
    setScale(1.0);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex flex-col bg-slate-950/95 backdrop-blur-md overflow-hidden text-white font-sans print:bg-white print:static print:inset-auto print:z-0">
      
      {/* Top Floating Toolbar (Hidden during Print) */}
      <header className="h-16 bg-surface border-b border-border-subtle px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-50 shadow-md print:hidden">
        {/* Left: Document details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base text-text-primary truncate leading-tight">
              Venue Permission Slip
            </h3>
            <p className="text-[11px] text-text-secondary truncate">
              {refCode} • {displaySociety}
            </p>
          </div>
        </div>

        {/* Center: Interactive Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-surface-glass border border-border-medium rounded-xl px-2 py-1">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold px-1.5 min-w-[48px] text-center text-text-primary">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-border-subtle mx-1"></div>

          <button
            type="button"
            onClick={handleFitPage}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              zoomMode === 'fit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
            title="Fit Entire Page on Screen"
          >
            Fit Page
          </button>

          <button
            type="button"
            onClick={handleFitWidth}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors hidden sm:block cursor-pointer ${
              zoomMode === 'width'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
            title="Fit Page Width"
          >
            Fit Width
          </button>

          <button
            type="button"
            onClick={handleResetActual}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors hidden sm:block cursor-pointer"
            title="Actual Size (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-elevation-1 hover:shadow-blue-600/30 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / Save as PDF</span>
            <span className="sm:hidden">Print</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Canvas Scroll Viewport */}
      <main
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center custom-scrollbar print:p-0 print:overflow-visible"
        onClick={(e) => {
          // Click outside paper to close
          if (e.target === containerRef.current) {
            onClose();
          }
        }}
      >
        {/* Scaled Paper Dimension Wrapper */}
        <div
          style={{
            width: `${A4_WIDTH * scale}px`,
            height: `${A4_HEIGHT * scale}px`,
            transition: 'width 0.15s ease-out, height 0.15s ease-out',
          }}
          className="relative flex-shrink-0 mx-auto my-auto print:w-full print:h-auto print:my-0"
        >
          {/* Actual A4 Printable Sheet */}
          <article
            id="venue-slip-printable"
            style={{
              width: `${A4_WIDTH}px`,
              minHeight: `${A4_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
            className="bg-white text-black shadow-2xl p-9 sm:p-10 flex flex-col justify-between rounded-sm border border-gray-300 print:shadow-none print:border-none print:p-8 print:w-full print:transform-none"
          >
            <div className="space-y-4">
              {/* Institute Header */}
              <div className="border-b-2 border-black pb-4 text-center">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-left w-20 shrink-0">
                    <img
                      src="/giki-logo.png"
                      alt="GIKI Crest"
                      className="w-16 h-16 object-contain mx-auto print:block"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 text-center">
                    <h1 className="text-xl font-black uppercase tracking-wider text-black leading-tight">
                      Ghulam Ishaq Khan Institute
                    </h1>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mt-0.5">
                      of Engineering Sciences and Technology, Topi, KP
                    </h2>
                    <div className="mt-1.5 inline-block px-3 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded print:bg-black print:text-white">
                      Directorate of Student Affairs (DSA)
                    </div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide mt-1.5 text-black underline underline-offset-4">
                      Venue Permission &amp; Facility Requisition Slip
                    </h3>
                  </div>
                  <div className="text-right w-24 shrink-0 text-[10px] text-gray-700 font-mono">
                    <span className="font-bold block text-black">Ref No:</span>
                    <span className="font-black text-xs text-black block">{refCode}</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">
                      Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 1: Event & Venue Details */}
              <section className="space-y-2 text-left">
                <h4 className="text-[11px] font-black uppercase tracking-wider bg-gray-100 text-black px-2.5 py-1 border-l-4 border-black">
                  Section 1: Event Particulars &amp; Facility Requested
                </h4>
                <div className="grid grid-cols-4 gap-2 text-xs border border-gray-300 p-2.5 rounded bg-white">
                  <div className="col-span-2">
                    <span className="text-[9px] font-bold text-gray-500 uppercase block">Event Title</span>
                    <span className="font-black text-sm text-black block leading-tight">{event.title}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] font-bold text-gray-500 uppercase block">Organizing Society / Club</span>
                    <span className="font-bold text-xs text-black block leading-tight">{displaySociety}</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase block">Scheduled Date</span>
                    <span className="font-bold text-black text-xs">{formattedEventDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase block">Event Hours</span>
                    <span className="font-bold text-black text-xs">{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="col-span-2 bg-amber-50 p-2 border border-amber-300 rounded">
                    <span className="text-[9px] font-black text-amber-900 uppercase block">Requested Venue</span>
                    <span className="font-black text-sm text-black tracking-wide">{event.venue}</span>
                  </div>
                </div>
              </section>

              {/* Section 2: Organizing Student In-Charge */}
              <section className="space-y-2 text-left">
                <h4 className="text-[11px] font-black uppercase tracking-wider bg-gray-100 text-black px-2.5 py-1 border-l-4 border-black">
                  Section 2: Student In-Charge &amp; Contact Details
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs border border-gray-300 p-2.5 rounded bg-white">
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase block">In-Charge Name</span>
                    <span className="font-bold text-black">{event.inChargeName || 'Society Executive'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase block">Registration Number</span>
                    <span className="font-bold text-black">{event.inChargeRegNum || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase block">Contact Phone</span>
                    <span className="font-bold text-black">{event.inChargeContact || 'N/A'}</span>
                  </div>
                </div>
              </section>

              {/* Section 3: Administrative Approvals Obtained */}
              <section className="space-y-2 text-left">
                <h4 className="text-[11px] font-black uppercase tracking-wider bg-gray-100 text-black px-2.5 py-1 border-l-4 border-black">
                  Section 3: Administrative Approvals Obtained (Digital Clearance)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="border border-gray-300 p-2.5 rounded space-y-1 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 text-xs">1. Faculty Advisor Review</span>
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[9px] font-bold rounded">
                        APPROVED
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600">
                      Approved on: {event.advisorApprovedAt ? new Date(event.advisorApprovedAt).toLocaleDateString() : 'Recorded'}
                    </p>
                    {event.advisorComments && (
                      <p className="text-[9px] italic text-gray-600">Remarks: &quot;{event.advisorComments}&quot;</p>
                    )}
                    <div className="pt-1 text-[9px] text-gray-400 font-mono">
                      Digitally Verified via Campus GIKI
                    </div>
                  </div>

                  <div className="border border-gray-300 p-2.5 rounded space-y-1 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 text-xs">2. Directorate of Student Affairs</span>
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[9px] font-bold rounded">
                        APPROVED
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600">
                      Approved on: {event.dsaApprovedAt ? new Date(event.dsaApprovedAt).toLocaleDateString() : 'Recorded'}
                    </p>
                    {event.rules && (
                      <p className="text-[9px] font-semibold text-gray-700 truncate">Directives: {event.rules}</p>
                    )}
                    <div className="pt-1 text-[9px] text-gray-400 font-mono">
                      DSA Verification Stamp: DSA-OK
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Physical Venue Clearance & Dean's Office Endorsement */}
              <section className="space-y-2 text-left pt-1">
                <h4 className="text-[11px] font-black uppercase tracking-wider bg-gray-900 text-white px-2.5 py-1 border-l-4 border-black print:bg-black print:text-white">
                  Section 4: Physical Facility Clearance &amp; Allocation (To Be Signed Physically)
                </h4>
                <div className="border-2 border-black p-3 rounded space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                    <span>Facility Authority: Dean&apos;s Office / PS to Dean / Venue Custodian</span>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5 border-2 border-black" />
                        <span>Venue Confirmed &amp; Reserved</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5 border-2 border-black" />
                        <span>Unavailable</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase block">Assigned Hall / Facility Room #</span>
                      <div className="border-b border-black h-6"></div>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase block">Special Conditions / Remarks</span>
                      <div className="border-b border-black h-6"></div>
                    </div>
                  </div>

                  {/* Signature and Stamp Boxes */}
                  <div className="grid grid-cols-2 gap-8 pt-4 pb-1">
                    <div className="text-center space-y-6">
                      <div className="border-b-2 border-dotted border-black mx-6"></div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wider">Society President / In-Charge</p>
                        <p className="text-[9px] text-gray-500">Signature &amp; Date</p>
                      </div>
                    </div>

                    <div className="text-center space-y-6">
                      <div className="border-b-2 border-dotted border-black mx-6"></div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wider">PS to Dean / Authorized Signatory</p>
                        <p className="text-[9px] text-gray-500">Official Signature, Stamp &amp; Date</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Instructions Notice at Footer */}
            <footer className="border-t border-gray-300 pt-2.5 text-[9px] text-gray-500 text-center space-y-0.5 font-mono">
              <p className="font-bold">INSTRUCTIONS FOR ORGANIZERS:</p>
              <p>1. Present this slip to the PS to Dean / Dean&apos;s Office to confirm venue reservation and obtain official stamp.</p>
              <p>2. Once endorsed, capture a clear picture or scan and upload it through your Society Portal on Campus GIKI.</p>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );

  return createPortal(modalContent, document.body);

};
