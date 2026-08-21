import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

type NotificationType = 'sync' | 'committed' | 'failed' | null;

// Global event emitter for non-React files like queryClient
export const globalNotification = {
  triggerSync: () => document.dispatchEvent(new CustomEvent('global-notification', { detail: 'sync' })),
  triggerCommitted: () => document.dispatchEvent(new CustomEvent('global-notification', { detail: 'committed' })),
  triggerFailed: () => document.dispatchEvent(new CustomEvent('global-notification', { detail: 'failed' })),
};

const NotificationContext = createContext(null);

const assets = {
  sync: {
    className: 'state-sync',
    text: 'Syncing',
    svg: (
      <svg className="status-icon spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
      </svg>
    )
  },
  committed: {
    className: 'state-committed',
    text: 'Committed',
    svg: (
      <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    )
  },
  failed: {
    className: 'state-failed',
    text: 'Failed',
    svg: (
      <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    )
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationType>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleEvent = (e: Event) => {
      const type = (e as CustomEvent).detail as NotificationType;
      setNotification(type);
      
      if (timeout) clearTimeout(timeout);
      
      if (type === 'committed' || type === 'failed') {
        timeout = setTimeout(() => {
          setNotification(null);
        }, 4000);
      }
    };

    document.addEventListener('global-notification', handleEvent);
    return () => document.removeEventListener('global-notification', handleEvent);
  }, []);

  return (
    <NotificationContext.Provider value={null}>
      {children}
      
      <style>{`
        .notification-container-fixed {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999999;
          pointer-events: none;
          --pill-height: 48px;
          --icon-size: 24px;
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

        .notification-container-fixed .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--pill-height);
          height: var(--pill-height);
          flex-shrink: 0;
        }

        .notification-container-fixed .status-icon {
          width: var(--icon-size);
          height: var(--icon-size);
          display: block;
        }

        .notification-container-fixed .spinner {
          animation: spin-notification 1s linear infinite;
        }

        @keyframes spin-notification {
          100% { transform: rotate(360deg); }
        }

        .notification-container-fixed .notification-text {
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
          15%, 85% { width: 160px; opacity: 1; transform: scale(1); }
          92% { width: var(--pill-height); opacity: 1; transform: scale(1); }
          100% { opacity: 0; width: var(--pill-height); transform: scale(0.5); }
        }

        @keyframes text-fade-complete {
          0%, 12% { opacity: 0; }
          18%, 82% { opacity: 1; }
          88%, 100% { opacity: 0; }
        }
      `}</style>
      
      {notification && typeof document !== "undefined" && createPortal(
        <div className="notification-container-fixed">
          <div className={`notification-pill ${assets[notification].className}`}>
            <div className="icon-container">{assets[notification].svg}</div>
            <span className="notification-text">{assets[notification].text}</span>
          </div>
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
};
