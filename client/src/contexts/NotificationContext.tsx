import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

type NotificationPayload = { type: 'success' | 'failed', message?: string } | null;

export const globalNotification = {
  triggerSuccess: (message?: string) => document.dispatchEvent(new CustomEvent('global-notification', { detail: { type: 'success', message } })),
  triggerFailed: (message?: string) => document.dispatchEvent(new CustomEvent('global-notification', { detail: { type: 'failed', message } })),
};

const NotificationContext = createContext(null);

const assets = {
  success: {
    className: 'state-approve',
    text: 'Success',
    svg: (
      <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    )
  },
  failed: {
    className: 'state-delete',
    text: 'Failed',
    svg: (
      <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    )
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationPayload>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let activeTimeout: NodeJS.Timeout;
    let sequenceTimeout: NodeJS.Timeout;
    
    const handleEvent = (e: Event) => {
      const payload = (e as CustomEvent).detail as NotificationPayload;
      
      clearTimeout(activeTimeout);
      clearTimeout(sequenceTimeout);
      
      if (!payload?.type) return;
      
      setExpanded(false);
      setVisible(false);
      setNotification(payload);
      
      setTimeout(() => {
        setVisible(true);
        sequenceTimeout = setTimeout(() => {
          setExpanded(true);
        }, 50);
        
        activeTimeout = setTimeout(() => {
          setExpanded(false);
          setTimeout(() => {
            setVisible(false);
            setTimeout(() => setNotification(null), 300);
          }, 300);
        }, 3000);
      }, 10);
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
          --icon-size: 20px;
        }

        .notification-pill {
          display: inline-flex;
          align-items: center;
          height: var(--pill-height);
          color: #ffffff;
          border-radius: calc(var(--pill-height) / 2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          white-space: nowrap;
          box-sizing: border-box;
          
          padding: 0;
          max-width: var(--pill-height);
          opacity: 0;
          transform: scale(0.5);
          
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), max-width 0.4s ease, padding 0.4s ease;
        }

        .notification-pill.visible {
          opacity: 1;
          transform: scale(1);
        }

        .notification-pill.expanded {
          max-width: 400px;
          padding: 0 5px;
        }

        .state-approve { background-color: #10b981; }
        .state-delete { background-color: #ef4444; }

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
          font-size: 15px;
          font-weight: 600;
          padding-right: 16px;
          opacity: 0;
          transform: translateX(-10px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .notification-pill.expanded .notification-text {
          opacity: 1;
          transform: translateX(0);
          transition-delay: 0.1s;
        }
      `}</style>
      
      {notification?.type && typeof document !== "undefined" && createPortal(
        <div className="notification-container-fixed">
          <div className={`notification-pill ${assets[notification.type].className} ${visible ? 'visible' : ''} ${expanded ? 'expanded' : ''}`}>
            <div className="icon-container">{assets[notification.type].svg}</div>
            <span className="notification-text">{notification.message || assets[notification.type].text}</span>
          </div>
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
};
