import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  FileText,
  FileCheck,
} from 'lucide-react';
import { eventService } from '@/services/event.service';
import { globalNotification } from '@/contexts/NotificationContext';
import { resolveImageUrl } from '@/lib/utils';
import type { EventItem } from '@/types/event.types';

interface UploadSignedSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const UploadSignedSlipModal: React.FC<UploadSignedSlipModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetForm = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Keyboard navigation (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleFileChange = (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a JPG, PNG, WebP image or PDF document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit.');
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return eventService.uploadVenueSlip(event.id, file);
    },
    onSuccess: () => {
      globalNotification.triggerSuccess('Signed venue permission slip uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
      queryClient.invalidateQueries({ queryKey: ['mySocietyEventsList'] });
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminEventsList'] });
      handleClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to upload signed slip. Please try again.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  if (!isOpen || !event) return null;

  const currentSlipUrl = resolveImageUrl(event.signedVenueSlipUrl);

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#13151b] border border-white/10 text-white rounded-2xl shadow-2xl p-6 my-8 text-left space-y-5">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {/* Minimal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-bold text-base text-white">Upload Signed Slip</h3>
            <p className="text-xs text-gray-400 mt-0.5">PS to Dean / Venue Custodian Endorsement</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Status Banner (only if previously submitted) */}
        {event.venueClearanceStatus && event.venueClearanceStatus !== 'PENDING_UPLOAD' && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              event.venueClearanceStatus === 'VERIFIED'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : event.venueClearanceStatus === 'REJECTED'
                ? 'bg-red-500/10 border-red-500/20 text-red-300'
                : 'bg-white/5 border-white/10 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-1.5">
                {event.venueClearanceStatus === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {event.venueClearanceStatus === 'REJECTED' && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                {event.venueClearanceStatus === 'SUBMITTED' && <Clock className="w-3.5 h-3.5 text-gray-400" />}
                <span>
                  {event.venueClearanceStatus === 'SUBMITTED' ? 'Under Review by DSA' : event.venueClearanceStatus}
                </span>
              </div>
              {currentSlipUrl && (
                <a
                  href={currentSlipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] underline opacity-80 hover:opacity-100"
                >
                  <span>View Current</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {event.venueClearanceNotes && (
              <p className="text-[11px] opacity-80">Remarks: {event.venueClearanceNotes}</p>
            )}
          </div>
        )}

        {/* Main Upload Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!selectedFile ? (
            /* Empty State: Minimalist Dropzone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragOver
                  ? 'border-white/50 bg-white/10'
                  : 'border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className="p-3 rounded-full bg-white/5 text-gray-300">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Click to upload <span className="text-gray-400 font-normal">or drag and drop</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, WebP or PDF (max 10MB)
                </p>
              </div>
            </div>
          ) : (
            /* Selected State: Clean Minimalist Preview Card */
            <div className="border border-white/10 bg-white/[0.02] rounded-xl overflow-hidden">
              {/* File Info Bar */}
              <div className="p-3.5 flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.01]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-white/5 text-gray-300 shrink-0">
                    {selectedFile.type === 'application/pdf' ? (
                      <FileText className="w-4 h-4 text-rose-400" />
                    ) : (
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[280px]" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    title="Remove file"
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Minimalist Preview Container */}
              {previewUrl && (
                <div className="p-3 bg-black/40 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Slip preview"
                    className="max-h-52 max-w-full rounded-lg object-contain"
                  />
                </div>
              )}

              {selectedFile.type === 'application/pdf' && (
                <div className="p-6 text-center text-xs text-gray-400">
                  PDF document attached and ready for upload
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>{event.signedVenueSlipUrl ? 'Upload Replacement' : 'Submit Slip'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default UploadSignedSlipModal;
