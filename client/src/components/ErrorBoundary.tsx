import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

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
        <div className="min-h-screen bg-lumen-cream text-vast-ink flex flex-col justify-center items-center p-6 text-center">
          <div className="bg-lumen-cream p-8 rounded-cards border border-white/10 max-w-md w-full space-y-5 bg-lumen-stone/90 shadow-2xl">
            <div className="p-3 bg-pure-white border border-vast-ink text-red-500 rounded-cards border border-white/10 w-fit mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-vast-ink">
                Application Error Encountered
              </h2>
              <p className="text-xs text-fog leading-relaxed">
                An unexpected error occurred while rendering this interface. The session remains secure.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-lumen-cream rounded-inputs border border-white/10 bg-[#0d0d0d] text-left text-xs font-mono text-gray-300 break-words">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-inputs text-xs font-bold transition-colors shadow-lg shadow-indigo-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

