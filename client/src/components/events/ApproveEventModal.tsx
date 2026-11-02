import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X, ShieldCheck, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ApproveEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { rules?: string; requiresVenueClearance: boolean }) => void;
  isLoading?: boolean;
  eventTitle?: string;
  venueName?: string;
  initialRules?: string;
}

export const ApproveEventModal: React.FC<ApproveEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  eventTitle,
  venueName,
  initialRules = '',
}) => {
  const [rules, setRules] = useState(initialRules);
  const [requiresVenueClearance, setRequiresVenueClearance] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      rules: rules.trim() || undefined,
      requiresVenueClearance,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-surface-elevated/95 backdrop-blur-[25px] border border-border-medium rounded-[24px] shadow-2xl p-6 overflow-hidden flex flex-col gap-5 text-text-primary animate-in fade-in zoom-in-95 duration-200">
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

        {/* Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 shrink-0 mt-0.5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-text-primary tracking-tight">
              Approve &amp; Publish Event
            </h3>
            <p className="text-xs text-text-secondary mt-1 font-medium leading-relaxed">
              {eventTitle ? (
                <>Approve <strong className="text-text-primary">{eventTitle}</strong> to make it live across campus feed and calendars.</>
              ) : (
                <>Configure venue clearance requirements and optional guidelines before publishing.</>
              )}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* 1. Venue Clearance Toggle Card */}
          <div className="p-4 rounded-2xl border border-border-subtle bg-surface/80 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                <span className="text-sm font-bold text-text-primary">
                  Physical Venue Clearance
                </span>
                <span
                  className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                    requiresVenueClearance
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {requiresVenueClearance ? 'Required' : 'Exempted'}
                </span>
              </div>

              {/* iOS-style / Modern Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={requiresVenueClearance}
                disabled={isLoading}
                onClick={() => setRequiresVenueClearance(!requiresVenueClearance)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary/40 ${
                  requiresVenueClearance ? 'bg-amber-500' : 'bg-surface-hover'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    requiresVenueClearance ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              {requiresVenueClearance ? (
                <>Society must print and submit the official venue slip signed by the respective authority for <strong className="text-text-primary">{venueName || 'the venue'}</strong>.</>
              ) : (
                <>Exempted — Society does not need to submit a signed venue slip.</>
              )}
            </p>
          </div>

          {/* 2. Optional Rules & Directives Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="dsa-event-rules" className="font-bold text-text-primary flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span>Event Directives &amp; Rules</span>
              </label>
              <span className="text-text-muted font-normal text-[11px]">Optional</span>
            </div>
            <textarea
              id="dsa-event-rules"
              rows={3}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. Bring GIKI student ID cards, outdoor sound stops at 10 PM..."
              className="w-full text-sm outline-none bg-surface text-text-primary placeholder:text-text-muted rounded-inputs p-3.5 border border-border-medium focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all resize-y disabled:opacity-50"
            />
            <p className="text-[11px] text-text-muted leading-relaxed">
              Special guidelines displayed on the event page. Leave blank if none needed.
            </p>
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
              leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30"
            >
              Confirm &amp; Publish Event
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

