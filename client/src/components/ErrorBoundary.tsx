import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught React Component Error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0d0d0d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <img 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              zIndex: 0
            }}
            src="/Assets_Images/Template 1.avif" 
            alt="Background" 
          />

          <div style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '440px',
            padding: '40px 28px',
            borderRadius: '18px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '5rem',
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.2) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 12px rgba(255, 255, 255, 0.15)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))'
            }}>
              500
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              lineHeight: 1.3,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              margin: 0
            }}>
              Internal Server Error
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.6,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
              margin: 0
            }}>
              Oops! Something went wrong on our end. Please try again later or return to the homepage.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              width: '100%',
              marginTop: '8px'
            }}>
              <a 
                href="/" 
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#ffffff',
                  color: '#0d0d0d',
                  border: '1px solid #ffffff'
                }}
              >
                Return Home
              </a>
              <button 
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
