import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isDevelopment } from './env';

type State = {
  error?: Error;
};

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (isDevelopment) {
      console.error(error, errorInfo);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-paper p-6 text-ink">
          <div className="mx-auto max-w-2xl rounded-md border border-red-200 bg-red-50 p-5">
            <h1 className="text-xl font-semibold">Something broke</h1>
            <p className="mt-2 text-sm text-red-950">{this.state.error.message}</p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
