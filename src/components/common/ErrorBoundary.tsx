import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Card } from '../ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <AlertTriangle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              fullWidth
            >
              Refresh Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;