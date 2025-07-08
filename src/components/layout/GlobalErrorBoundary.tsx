import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw, Bug, Palette, Camera } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report error to monitoring service (if configured)
    if (window.location.hostname !== 'localhost') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // This could be sent to Sentry, LogRocket, or another error monitoring service
    console.error('Error reported:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        onRetry={this.handleRetry}
        onReload={this.handleReload}
      />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onRetry: () => void;
  onReload: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  onRetry, 
  onReload 
}) => {
  const navigate = useNavigate();
  const isDevelopment = window.location.hostname === 'localhost';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="p-8 space-y-6">
          {/* Error Icon */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-muted-foreground">
              Don't worry, your data is safe. We've been notified of this issue.
            </p>
          </div>

          {/* Error Details (Development only) */}
          {isDevelopment && error && (
            <div className="bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-sm">Development Info</span>
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground mb-2">
                  Error Details
                </summary>
                <div className="bg-background p-3 rounded border font-mono whitespace-pre-wrap">
                  <div className="text-red-500 mb-2">
                    {error.name}: {error.message}
                  </div>
                  {error.stack && (
                    <div className="text-muted-foreground text-xs">
                      {error.stack}
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onRetry} variant="default" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={onReload} variant="outline" className="flex-1">
              Reload Page
            </Button>
          </div>

          {/* Navigation Options */}
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Or continue with these options:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button 
                onClick={() => navigate('/')} 
                variant="ghost" 
                className="flex flex-col h-auto p-4"
              >
                <Home className="w-6 h-6 mb-2 text-muted-foreground" />
                <span className="text-sm">Home</span>
              </Button>
              <Button 
                onClick={() => navigate('/create')} 
                variant="ghost" 
                className="flex flex-col h-auto p-4"
              >
                <Palette className="w-6 h-6 mb-2 text-crd-orange" />
                <span className="text-sm">Create</span>
              </Button>
              <Button 
                onClick={() => navigate('/studio')} 
                variant="ghost" 
                className="flex flex-col h-auto p-4"
              >
                <Camera className="w-6 h-6 mb-2 text-crd-green" />
                <span className="text-sm">Studio</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};