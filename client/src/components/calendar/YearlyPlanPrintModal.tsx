import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  Building2,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { YearlyPlan } from '@/types/yearly-plan.types';

interface YearlyPlanPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: YearlyPlan | null;
}

export const YearlyPlanPrintModal: React.FC<YearlyPlanPrintModalProps> = ({
  isOpen,
  onClose,
  plan,
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

  if (!isOpen || !plan) return null;

  const refCode = `GIKI-DSA-YP-${plan.id.slice(0, 8).toUpperCase()}`;
  const societyName = plan.society?.name || 'Campus Society';
  const advisor = plan.society?.advisor;
  const events = plan.plannedEvents || [];

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

  const handleFitPage = () => {
    setZoomMode('fit');
  };

  const handleResetActual = () => {
    setZoomMode('actual');
    setScale(1.0);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex flex-col bg-slate-950/95 backdrop-blur-md overflow-hidden text-white font-sans print:bg-white print:static print:inset-auto print:z-0">
      {/* Top Floating Toolbar (Hidden during Print) */}
      <header className="h-16 bg-[#121620] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-50 shadow-md print:hidden">
        {/* Left: Document details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate">
                Annual Calendar Plan {plan.year}
              </h3>
              <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">
                {refCode}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate">{societyName}</p>
          </div>
        </div>

        {/* Center: Zoom controls */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1 text-xs text-gray-300">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetActual}
            className="px-2.5 py-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer font-mono font-medium text-[11px]"
            title="Actual Size (100%)"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-0.5" />
          <button
            type="button"
            onClick={handleFitPage}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="Fit Page"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / Save as PDF</span>
            <span className="sm:hidden">Print</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Preview Workspace */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center custom-scrollbar print:p-0 print:overflow-visible">
        <div
          style={{
            width: `${794 * scale}px`,
            minHeight: `${1123 * scale}px`,
          }}
          className="relative flex-shrink-0 mx-auto my-auto print:w-full print:h-auto print:my-0"
        >
          {/* Printable A4 Document Sheet */}
          <article
            id="yearly-plan-printable"
            style={{
              width: '794px',
              minHeight: '1123px',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
            className="bg-white text-black shadow-2xl p-9 sm:p-10 flex flex-col justify-between rounded-sm border border-gray-300 print:shadow-none print:border-none print:p-8 print:w-full print:transform-none"
          >
            <div className="space-y-4">
              {/* Institutional Header */}
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
                    <h1 className="text-lg font-black uppercase tracking-wider text-black leading-tight">
                      Ghulam Ishaq Khan Institute
                    </h1>
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-700 mt-0.5">
                      of Engineering Sciences and Technology, Topi, KP
                    </h2>
                    <div className="mt-1.5 inline-block px-3 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded print:bg-black print:text-white">
                      Directorate of Student Affairs (DSA)
                    </div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide mt-1.5 text-black underline underline-offset-4">
                      Annual Society Calendar &amp; Event Master Plan (Year {plan.year})
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

              {/* Section 1: Society & Supervisory Metadata */}
              <section className="space-y-2 text-left">
                <h4 className="text-[11px] font-black uppercase tracking-wider bg-gray-100 text-black px-2.5 py-1 border-l-4 border-black">
                  Section 1: Society &amp; Supervisory Information
                </h4>
                <div className="grid grid-cols-3 gap-2.5 text-xs border border-gray-300 p-3 rounded bg-white">
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase block">Society / Organization</span>
                    <span className="font-black text-sm text-black block leading-tight">{societyName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase block">Faculty Advisor</span>
                    <span className="font-bold text-xs text-black block leading-tight">
                      {advisor?.user?.fullName || 'Not Assigned'}
                    </span>
                    {advisor?.department && (
                      <span className="text-[10px] text-gray-600 block">{advisor.department}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase block">Plan Status</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black text-white">
                      {plan.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </section>

              {/* Section 2: Planned Events Master Schedule Table */}
              <section className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black uppercase tracking-wider bg-gray-100 text-black px-2.5 py-1 border-l-4 border-black">
                    Section 2: Submitted Events Schedule ({events.length} Events)
                  </h4>
                </div>

                {events.length === 0 ? (
                  <div className="p-4 border border-dashed border-gray-300 text-center text-xs text-gray-500 italic rounded">
                    No planned events registered in this annual calendar.
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded overflow-hidden">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-300 text-[10px] font-black uppercase tracking-wider text-black">
                          <th className="p-2 border-r border-gray-300 w-[5%] text-center">#</th>
                          <th className="p-2 border-r border-gray-300 w-[28%]">Event Title &amp; Category</th>
                          <th className="p-2 border-r border-gray-300 w-[20%]">Venue</th>
                          <th className="p-2 border-r border-gray-300 w-[17%]">Dates &amp; Duration</th>
                          <th className="p-2 w-[30%]">Objective &amp; Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((ev, idx) => {
                          const startDateFormatted = ev.startDate
                            ? new Date(ev.startDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'TBD';
                          const endDateFormatted = ev.endDate
                            ? new Date(ev.endDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'TBD';

                          return (
                            <tr
                              key={idx}
                              className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                            >
                              <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-600 align-top">
                                {idx + 1}
                              </td>
                              <td className="p-2 border-r border-gray-200 align-top">
                                <span className="font-bold text-black block leading-tight">
                                  {ev.eventName}
                                </span>
                                {ev.eventType && (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-gray-200 text-gray-800">
                                    {ev.eventType}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 border-r border-gray-200 align-top font-medium text-gray-900">
                                {ev.venue || 'N/A'}
                              </td>
                              <td className="p-2 border-r border-gray-200 align-top text-[11px]">
                                <span className="font-semibold block text-black">
                                  {startDateFormatted}
                                </span>
                                {startDateFormatted !== endDateFormatted && (
                                  <span className="text-[10px] text-gray-600 block">
                                    to {endDateFormatted}
                                  </span>
                                )}
                                {ev.duration && (
                                  <span className="text-[9px] text-gray-500 font-mono block mt-0.5">
                                    ({ev.duration})
                                  </span>
                                )}
                              </td>
                              <td className="p-2 align-top text-[11px] text-gray-700 leading-tight">
                                <p className="line-clamp-3">{ev.description || 'N/A'}</p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Section 3: Institutional Directives */}
              <section className="space-y-1.5 text-left border border-gray-300 p-2.5 rounded bg-gray-50 text-[10px] text-gray-700">
                <span className="font-bold text-black uppercase block tracking-wider">
                  Important Notes &amp; Guidelines for Execution:
                </span>
                <ol className="list-decimal pl-4 space-y-0.5 leading-relaxed">
                  <li>
                    Approval of this Yearly Calendar Plan provides institutional schedule reservation; each individual event must still submit an Event Approval Requisition 7 days prior to execution.
                  </li>
                  <li>
                    Any schedule revisions or venue alterations require formal endorsement from the Faculty Advisor and re-clearance from the DSA office.
                  </li>
                </ol>
              </section>
            </div>

            {/* Section 4: Official Sign-Off Block */}
            <div className="pt-6 border-t-2 border-black mt-6">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                {/* 1. Society President */}
                <div className="flex flex-col justify-end">
                  <div className="border-b border-black w-4/5 mx-auto mb-1.5 h-10" />
                  <span className="font-bold text-black uppercase text-[10px] block">
                    Society President
                  </span>
                  <span className="text-[9px] text-gray-600 block">Prepared &amp; Submitted</span>
                </div>

                {/* 2. Faculty Advisor */}
                <div className="flex flex-col justify-end">
                  <div className="border-b border-black w-4/5 mx-auto mb-1.5 h-10" />
                  <span className="font-bold text-black uppercase text-[10px] block">
                    Faculty Advisor
                  </span>
                  <span className="text-[9px] text-gray-600 block">
                    {advisor?.user?.fullName || 'Endorsed & Verified'}
                  </span>
                </div>

                {/* 3. Director Student Affairs */}
                <div className="flex flex-col justify-end">
                  <div className="border-b border-black w-4/5 mx-auto mb-1.5 h-10" />
                  <span className="font-bold text-black uppercase text-[10px] block">
                    Director Student Affairs
                  </span>
                  <span className="text-[9px] text-gray-600 block">DSA Official Sanction</span>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-gray-200 text-center text-[9px] text-gray-500 font-mono flex items-center justify-between">
                <span>Campus GIKI Portal • Official Student Affairs Document</span>
                <span>Generated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );

  return createPortal(modalContent, document.body);

};
