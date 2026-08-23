import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';

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
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col justify-center items-center p-6 text-center">
          <div className="bg-[#1c1d22] p-8 rounded-3xl border border-white/5 max-w-md w-full space-y-5 shadow-2xl relative z-10">
            <div className="p-3.5 bg-red-500 text-white rounded-full w-fit mx-auto shadow-lg shadow-red-500/20">
              <TriangleAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">
                Application Error Encountered
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                An unexpected error occurred while rendering this interface. The session remains secure.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl border border-white/10 bg-[#0d0d0d] text-left text-xs font-mono text-gray-300 break-words max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full px-4 py-3 bg-white hover:bg-gray-100 text-black rounded-xl text-sm font-bold transition-all shadow-lg"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
