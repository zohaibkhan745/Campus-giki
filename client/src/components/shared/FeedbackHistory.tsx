import React from 'react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';

export interface FeedbackBlock {
  date: string | null;
  status: string | null;
  role: string | null;
  text: string;
}

export interface FeedbackHistoryProps {
  rawComments?: string | null;
  currentStatus?: string;
  filterRole?: 'Advisor' | 'DSA Admin' | 'all';
  title?: string;
}

export const FeedbackHistory: React.FC<FeedbackHistoryProps> = ({
  rawComments,
  currentStatus,
  filterRole = 'all',
  title = 'Revision Feedback History',
}) => {
  if (!rawComments) return null;

  const parseComments = (raw: string): FeedbackBlock[] => {
    const blocks = raw.split('\n\n---\n\n');
    return blocks
      .map((block) => {
        // Matches [Date] STATUS:\n Comment Text OR [Date] STATUS - ROLE:\n Comment Text
        const match = block.match(/^\[(.*?)\] (.*?)(?: - (.*?))?:\n([\s\S]*)$/);
        if (match) {
          return {
            date: match[1],
            status: match[2],
            role: match[3] || null,
            text: match[4],
          };
        }
        return {
          date: null,
          status: null,
          role: null,
          text: block,
        };
      })
      .reverse(); // Show latest first
  };

  const allBlocks = parseComments(rawComments);

  // Filter by role if requested
  const blocks = allBlocks.filter((item) => {
    if (filterRole === 'all') return true;
    if (filterRole === 'DSA Admin') {
      return item.role === 'DSA Admin';
    }
    if (filterRole === 'Advisor') {
      return item.role === 'Advisor' || !item.role;
    }
    return true;
  });

  if (blocks.length === 0) return null;

  return (
    <div className="bg-surface-glass border border-border-medium rounded-2xl p-5 sm:p-7 backdrop-blur-md shadow-elevation-1 space-y-4">
      {title && (
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-primary" />
          <h2 className="text-base sm:text-lg font-bold text-text-primary">{title}</h2>
        </div>
      )}
      <div className="space-y-3">
        {blocks.map((item, idx) => {
          // Check if this request has already been addressed by society in resubmission
          const isAddressed =
            item.status === 'CHANGES_REQUESTED' &&
            (currentStatus === 'PENDING_ADVISOR' ||
              currentStatus === 'PENDING_ADMIN' ||
              currentStatus === 'APPROVED');

          if (isAddressed) {
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-text-primary relative overflow-hidden space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
                  {item.date && (
                    <span className="text-xs font-semibold text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.date}
                    </span>
                  )}
                  {item.role && (
                    <span className="text-[10px] font-bold text-text-muted bg-surface-glass px-2 py-0.5 rounded-full border border-border-subtle">
                      By {item.role}
                    </span>
                  )}
                  <span className="ml-auto text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 tracking-wider">
                    RESUBMITTED WITH REVISIONS
                  </span>
                </div>
                <div className="pt-1">
                  <p className="text-[11px] font-semibold text-text-muted mb-1">
                    Previous feedback (addressed by society):
                  </p>
                  <p className="text-sm font-medium whitespace-pre-line leading-relaxed text-text-primary">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          }

          const isApproved = item.status === 'APPROVED';
          const isChangesRequested = item.status === 'CHANGES_REQUESTED';

          const cardColor = isApproved
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : isChangesRequested
            ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
            : 'border-border-subtle bg-surface-elevated/40 text-text-secondary';

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${cardColor} relative overflow-hidden`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {isApproved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
                {item.date && (
                  <span className="text-xs font-semibold opacity-70 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.date}
                  </span>
                )}
                {item.role && (
                  <span className="text-[10px] font-bold text-text-muted bg-surface-glass px-2 py-0.5 rounded-full ml-1 border border-border-subtle">
                    By {item.role}
                  </span>
                )}
                {item.status && (
                  <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-surface-glass text-text-primary border border-border-subtle tracking-wider">
                    {item.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium whitespace-pre-line leading-relaxed text-text-primary">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
      {currentStatus === 'CHANGES_REQUESTED' && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-inputs text-xs font-semibold shadow-sm flex items-center gap-2 mt-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Please adjust your planned event dates or notes as requested above and click &quot;Resubmit for Approval&quot;.</span>
        </div>
      )}
    </div>
  );
};
