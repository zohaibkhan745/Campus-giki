import { createPortal } from 'react-dom';
import React from 'react';

interface CouncilNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CouncilNoticeModal: React.FC<CouncilNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen bg-black/20 backdrop-blur-md flex justify-center items-center p-5 z-[1000] opacity-100 transition-opacity">
      <div className="w-full max-w-[420px] min-h-[340px] bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 flex flex-col justify-between gap-5 shadow-[0_24px_60px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.2)] scale-100 transition-transform">
        <div className="flex flex-col gap-3">
          <h3 className="text-white text-xl font-semibold shadow-sm">Action Required</h3>
          <p className="text-white/90 text-sm leading-relaxed shadow-sm">
            Please complete your Executive Council details to make your society account functional.
          </p>
          
          <div className="bg-white/10 border border-white/30 rounded-xl p-4 mt-2 flex flex-col gap-1.5">
            <span className="text-[12px] uppercase tracking-wide text-white/60 font-semibold">Navigation Path</span>
            <div className="text-sm font-medium text-white leading-snug">
              Dashboard &rarr; Manage Info &rarr; Executive Council
            </div>
          </div>
        </div>

        <div className="flex mt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-xl text-[15px] font-semibold bg-white border border-white text-slate-900 shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:bg-slate-100 hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] active:translate-y-0 transition-all outline-none cursor-pointer"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  , document.body);
};


