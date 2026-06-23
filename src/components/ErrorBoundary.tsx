import React from 'react';
import { AlertCircle } from 'lucide-react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  resetKey: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('React surface failed', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="glass-card border-red/20 p-12 text-center space-y-6">
        <AlertCircle className="mx-auto h-16 w-16 text-red" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight">Surface interrupted</h2>
          <p className="mx-auto max-w-sm text-sm font-bold uppercase tracking-tight text-muted">
            This view failed to render. Retry the current route or return to the studio.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => this.setState({ error: null })} className="btn-orange px-10">
            Retry
          </button>
          <button
            onClick={() => {
              window.location.hash = '#/';
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-10 py-3 text-xs font-black uppercase tracking-widest text-white"
          >
            Home
          </button>
        </div>
      </div>
    );
  }
}
