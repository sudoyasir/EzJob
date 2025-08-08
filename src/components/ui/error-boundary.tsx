import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-destructive/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-destructive/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-2xl relative z-10">
        <Card className="p-8 lg:p-12 bg-card/80 backdrop-blur-lg border-border shadow-2xl rounded-2xl text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-card-foreground">
                Something went wrong
              </h1>
              <h2 className="text-xl font-medium text-muted-foreground">
                We encountered an unexpected error
              </h2>
            </div>
          </div>

          {/* Error Details */}
          <div className="mb-8 space-y-3">
            <p className="text-muted-foreground">
              Don't worry, this has been automatically reported to our team. You can try refreshing the page or going back to the dashboard.
            </p>
            {error && process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-4 bg-muted rounded-lg text-left">
                <summary className="cursor-pointer font-medium text-sm">
                  Technical Details (Development Mode)
                </summary>
                <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-32">
                  {error.toString()}
                </pre>
              </details>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={resetError}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 px-6"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto border-border hover:bg-accent hover:text-accent-foreground px-6"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              className="w-full sm:w-auto px-6"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              If this problem persists, please{' '}
              <a 
                href="mailto:support@ezjob.com" 
                className="text-primary hover:text-primary/80 transition-colors underline"
              >
                contact our support team
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Report to error tracking service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};
