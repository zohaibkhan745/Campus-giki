import React from 'react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface FeedbackBlock {
  date: string | null;
  status: string | null;
  role: string | null;
  text: string;
}

interface FeedbackHistoryProps {
  rawComments: string;
}

export const FeedbackHistory: React.FC<FeedbackHistoryProps> = ({ rawComments }) => {
  if (!rawComments) return null;

  const parseComments = (raw: string): FeedbackBlock[] => {
    const blocks = raw.split('\n\n---\n\n');
    return blocks.map(block => {
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
    }).reverse(); // Show latest first
  };

  const parsed = parseComments(rawComments);

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'CHANGES_REQUESTED':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'APPROVED':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'CHANGES_REQUESTED':
        return 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'border-border-subtle bg-surface-elevated/40 text-text-secondary';
    }
  };

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-bold text-text-muted uppercase tracking-wide mb-2">Comments History</h3>
      <div className="space-y-3">
        {parsed.map((item, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-xl border ${getStatusColor(item.status)} relative overflow-hidden`}
          >
            {item.date && (
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(item.status)}
                <span className="text-xs font-bold opacity-70 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.date}
                </span>
                {item.role && (
                  <span className="text-[10px] font-bold text-text-muted bg-surface-glass px-2 py-0.5 rounded-full ml-2 border border-border-subtle">
                    By {item.role}
                  </span>
                )}
                {item.status && (
                  <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-surface-glass text-text-primary border border-border-subtle tracking-wider">
                    {item.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}
            <p className="text-sm font-medium whitespace-pre-line leading-relaxed text-text-primary">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
