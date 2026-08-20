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
    <>
      <style>{`
        :root {
          --pill-height: 48px;
          --icon-size: 24px;
        }

        .notification-container-fixed {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          pointer-events: none;
        }

        .notification-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          height: var(--pill-height);
          color: #ffffff;
          border-radius: calc(var(--pill-height) / 2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .notification-pill.state-sync {
          background-color: #3b82f6;
          animation: sync-sequence 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .notification-pill.state-committed {
          background-color: #10b981;
          animation: complete-sequence 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .notification-pill.state-failed {
          background-color: #ef4444;
          animation: complete-sequence 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--pill-height);
          height: var(--pill-height);
          flex-shrink: 0;
        }

        .status-icon {
          width: var(--icon-size);
          height: var(--icon-size);
          display: block;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .notification-text {
          font-size: 16px;
          font-weight: 600;
          padding-right: 20px;
          margin-left: -4px;
          opacity: 0;
        }

        .state-sync .notification-text {
          animation: text-fade-sync 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .state-committed .notification-text,
        .state-failed .notification-text {
          animation: text-fade-complete 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes sync-sequence {
          0% { opacity: 0; width: var(--pill-height); transform: scale(0.5); }
          15% { opacity: 1; width: var(--pill-height); transform: scale(1); }
          30%, 85% { width: 140px; opacity: 1; transform: scale(1); }
          95% { width: var(--pill-height); opacity: 1; transform: scale(1); }
          100% { opacity: 0; width: var(--pill-height); transform: scale(0.5); }
        }

        @keyframes text-fade-sync {
          0%, 25% { opacity: 0; }
          35%, 80% { opacity: 1; }
          90%, 100% { opacity: 0; }
        }

        @keyframes complete-sequence {
          0% { opacity: 0; width: var(--pill-height); transform: scale(0.5); }
          8% { opacity: 1; width: var(--pill-height); transform: scale(1); }
          15%, 85% { width: max-content; min-width: 200px; opacity: 1; transform: scale(1); }
          92% { width: var(--pill-height); opacity: 1; transform: scale(1); }
          100% { opacity: 0; width: var(--pill-height); transform: scale(0.5); }
        }

        @keyframes text-fade-complete {
          0%, 12% { opacity: 0; }
          18%, 82% { opacity: 1; }
          88%, 100% { opacity: 0; }
        }
      `}</style>
      <div className="notification-container-fixed">
        <div className={`notification-pill ${assets.className}`}>
          <div className="icon-container">{assets.svg}</div>
          <span className="notification-text">{assets.text}</span>
        </div>
      </div>
    </>
  );
};
