import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface RequestChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comments?: string) => void;
  isLoading?: boolean;
  reviewerRole?: 'ADVISOR' | 'DSA_ADMIN';
  eventTitle?: string;
  initialComments?: string;
  title?: string;
  description?: string;
  placeholder?: string;
}

export const RequestChangesModal: React.FC<RequestChangesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  reviewerRole = 'DSA_ADMIN',
  eventTitle,
  initialComments = '',
  title = 'Request Changes',
  description,
  placeholder,
}) => {
  const [comments, setComments] = useState(initialComments);

  useEffect(() => {
    if (isOpen) {
      setComments(initialComments);
    }
  }, [isOpen, initialComments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(comments.trim() ? comments.trim() : undefined);
  };

  const defaultPlaceholder = 'Add feedback or revision notes (optional)...';

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-surface-elevated/95 backdrop-blur-[25px] border border-border-medium rounded-[24px] shadow-2xl p-6 overflow-hidden flex flex-col gap-5 text-text-primary animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          disabled={isLoading}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shrink-0 mt-0.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-text-primary tracking-tight">
              {title}
            </h3>
            {description || eventTitle ? (
              <p className="text-xs text-text-muted mt-0.5 font-medium">
                {description || eventTitle}
              </p>
            ) : null}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="change-request-notes" className="font-semibold text-text-primary">
                Feedback
              </label>
              <span className="text-[11px] text-text-muted">Optional</span>
            </div>
            <textarea
              id="change-request-notes"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isLoading}
              placeholder={placeholder || defaultPlaceholder}
              className="w-full text-sm outline-none bg-surface text-text-primary placeholder:text-text-muted rounded-inputs p-3.5 border border-border-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-y disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<AlertCircle className="w-4 h-4" />}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white border-amber-500/30"
            >
              Request Changes
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};
