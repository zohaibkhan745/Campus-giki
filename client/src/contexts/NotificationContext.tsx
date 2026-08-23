import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

type NotificationPayload = { type: 'success' | 'failed', message?: string } | null;

// Global event emitter for non-React files like queryClient
export const globalNotification = {
  triggerSuccess: (message?: string) => document.dispatchEvent(new CustomEvent('global-notification', { detail: { type: 'success', message } })),
  triggerFailed: (message?: string) => document.dispatchEvent(new CustomEvent('global-notification', { detail: { type: 'failed', message } })),
};

const NotificationContext = createContext(null);

const assets = {
  success: {
    className: 'state-committed',
    text: 'Success',
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
  const [notification, setNotification] = useState<NotificationPayload>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleEvent = (e: Event) => {
      const payload = (e as CustomEvent).detail as NotificationPayload;
      setNotification(payload);
      
      if (timeout) clearTimeout(timeout);
      
      if (payload?.type === 'success' || payload?.type === 'failed') {
        timeout = setTimeout(() => {
          setNotification(null);
        }, 3000);
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

        .notification-pill.state-committed {
          background-color: #10b981; /* Green */
          animation: pop-sequence 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .notification-pill.state-failed {
          background-color: #ef4444; /* Red */
          animation: pop-sequence 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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

        .notification-container-fixed .notification-text {
          font-size: 16px;
          font-weight: 600;
          padding-right: 20px;
          margin-left: -4px;
          opacity: 0;
        }

        .state-committed .notification-text,
        .state-failed .notification-text {
          animation: text-fade-complete 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes pop-sequence {
          0% { opacity: 0; width: var(--pill-height); transform: scale(0.5) translateY(-20px); }
          10% { opacity: 1; width: var(--pill-height); transform: scale(1) translateY(0); }
          20%, 80% { width: max-content; padding-right: 8px; opacity: 1; transform: scale(1) translateY(0); }
          90% { width: var(--pill-height); opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; width: var(--pill-height); transform: scale(0.5) translateY(-20px); }
        }

        @keyframes text-fade-complete {
          0%, 15% { opacity: 0; }
          22%, 78% { opacity: 1; }
          85%, 100% { opacity: 0; }
        }
      `}</style>
      
      {notification?.type && typeof document !== "undefined" && createPortal(
        <div className="notification-container-fixed">
          <div className={`notification-pill ${assets[notification.type].className}`}>
            <div className="icon-container">{assets[notification.type].svg}</div>
            <span className="notification-text">{notification.message || assets[notification.type].text}</span>
          </div>
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
};

