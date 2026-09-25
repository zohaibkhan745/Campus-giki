import React, { useEffect, useState } from 'react';

export type NotificationState = 'sync' | 'committed' | 'failed' | null;

interface NotificationPillProps {
  state: NotificationState;
  message?: string;
  onClose?: () => void;
}

export const NotificationPill: React.FC<NotificationPillProps> = ({ state, message, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state) {
      setVisible(true);
      // Auto-hide after 4 seconds (duration of the complete-sequence animation)
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  if (!state || !visible) return null;

  const getAssets = (currentState: NotificationState) => {
    switch (currentState) {
      case 'sync':
        return {
          className: 'state-sync',
          text: message || 'Syncing',
          svg: (
            <svg className="status-icon spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
          )
        };
      case 'committed':
        return {
          className: 'state-committed',
          text: message || 'Committed',
          svg: (
            <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )
        };
      case 'failed':
        return {
          className: 'state-failed',
          text: message || 'Failed',
          svg: (
            <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )
        };
      default:
        return null;
    }
  };

  const assets = getAssets(state);
  if (!assets) return null;

  return (
    <div className="notification-container-fixed">
      <div className={`notification-pill ${assets.className}`}>
        <div className="icon-container">{assets.svg}</div>
        <span className="notification-text">{assets.text}</span>
      </div>
    </div>
  );
};

