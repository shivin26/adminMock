import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              An unexpected runtime error occurred. Our team has been notified.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Button leftIcon={<RefreshCw className="h-4 w-4" />} onClick={this.handleReset}>
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
