import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  variant?: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'error',
  title,
  message,
  className,
}) => {
  const styles = {
    error: {
      container: 'bg-danger/10 border-danger/30 text-danger',
      icon: <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-success/10 border-success/30 text-success',
      icon: <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />,
    },
    info: {
      container: 'bg-info/10 border-info/30 text-info',
      icon: <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />,
    },
  };

  const selected = styles[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-inputs border text-sm transition-all',
        selected.container,
        className,
      )}
    >
      {selected.icon}
      <div className="space-y-0.5 text-left">
        {title && <h4 className="font-semibold text-sm leading-none">{title}</h4>}
        <p className="text-xs leading-relaxed opacity-90">{message}</p>
      </div>
    </div>
  );
};
