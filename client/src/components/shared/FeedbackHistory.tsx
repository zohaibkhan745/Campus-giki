import React from 'react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface FeedbackBlock {
  date: string | null;
  status: string | null;
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
      // Matches [Date] STATUS:\n Comment Text
      const match = block.match(/^\[(.*?)\] (.*?):\n([\s\S]*)$/);
      if (match) {
        return {
          date: match[1],
          status: match[2],
          text: match[3],
        };
      }
      return {
        date: null,
        status: null,
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
        return <MessageSquare className="w-4 h-4 text-vast-ink" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'APPROVED':
        return 'border-emerald-500 bg-emerald-50';
      case 'CHANGES_REQUESTED':
        return 'border-amber-500 bg-amber-50';
      default:
        return 'border-vast-ink bg-pure-white';
    }
  };

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-bold text-vast-ink flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-forest-ink" />
        Feedback History
      </h3>
      <div className="space-y-3">
        {parsed.map((item, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-cards border-2 ${getStatusColor(item.status)} relative overflow-hidden`}
          >
            {item.date && (
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(item.status)}
                <span className="text-xs font-bold text-vast-ink opacity-70 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.date}
                </span>
                {item.status && (
                  <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-vast-ink text-pure-white tracking-wider">
                    {item.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}
            <p className="text-sm text-vast-ink font-medium whitespace-pre-line leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
