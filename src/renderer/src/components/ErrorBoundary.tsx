import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-zed-bg text-zed-text">
          <div className="max-w-lg w-full mx-auto text-center p-6">
            <div className="bg-zed-surface border border-zed-border rounded-lg p-8 shadow-soft">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6 text-commit-fix">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h2 className="text-lg font-medium text-zed-text mb-2">
                Something went wrong
              </h2>

              <p className="text-zed-muted text-sm mb-6">
                An unexpected error occurred while rendering the application.
              </p>

              {this.state.error && (
                <details className="mb-6 text-left bg-zed-bg border border-zed-border rounded overflow-hidden">
                  <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-zed-text bg-zed-element hover:bg-zed-border/50 transition-colors select-none">
                    Error Details
                  </summary>
                  <div className="p-4 text-xs font-mono text-zed-text overflow-auto max-h-40 whitespace-pre-wrap">
                    <div className="mb-2 text-commit-fix">
                      {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div className="text-zed-muted opacity-80">
                        {this.state.error.stack}
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() =>
                    this.setState({
                      hasError: false,
                      error: null,
                      errorInfo: null,
                    })
                  }
                  className="btn-secondary"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Reload App
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
