import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 border border-slate-700 p-8 rounded-xl max-w-md w-full text-center shadow-2xl"
          >
            <div className="text-6xl mb-6">💥</div>
            <h1 className="text-2xl font-bold text-white mb-2">Oops, something went wrong</h1>
            <p className="text-slate-400 mb-8">
              We're sorry, an unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors w-full"
            >
              Reload Page
            </button>
            {import.meta.env.DEV && (
              <div className="mt-6 text-left bg-slate-900 p-4 rounded overflow-auto max-h-40">
                <p className="text-red-400 font-mono text-xs whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
