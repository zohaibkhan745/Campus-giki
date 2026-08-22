import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined} 
      />
      <div className="relative w-full max-w-md bg-[rgba(255,255,255,0.08)] backdrop-blur-[25px] border border-white/20 rounded-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-6 overflow-hidden flex flex-col gap-4 text-white transform transition-all">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 text-red-400">
          <div className="p-2.5 rounded-full bg-red-500/20 border border-red-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-[0.95rem] text-white/85 leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm font-semibold"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-red-500/50 bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold flex items-center gap-2"
          >
            {isLoading ? <span className="animate-pulse">Deleting...</span> : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
