import * as React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-gray-900">
          <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800 max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Something went wrong</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              An unexpected rendering error occurred. Please refresh the page.
            </p>
            <pre className="mt-4 overflow-auto rounded bg-gray-100 p-3 text-left text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200 max-h-40">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
