import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface CRDErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  featureName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class CRDErrorBoundary extends Component<CRDErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: CRDErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`CRD Error Boundary - ${this.props.featureName || 'Unknown'}:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Add your error reporting service here
      (window as any).reportError?.({
        feature: this.props.featureName || 'unknown',
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            reset={this.handleReset}
          />
        );
      }

      // Default error fallback
      return (
        <div className="min-h-screen bg-crd-black flex items-center justify-center p-4">
          <CRDCard className="max-w-md w-full text-center">
            <div className="p-8">
              <AlertTriangle className="w-16 h-16 text-crd-warning mx-auto mb-4" />
              
              <h2 className="text-xl font-semibold text-crd-text mb-2">
                {this.props.featureName ? `${this.props.featureName} Error` : 'Something went wrong'}
              </h2>
              
              <p className="text-crd-text-dim mb-6">
                An unexpected error occurred. You can try refreshing the page or return to the home page.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <CRDButton
                  variant="primary"
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </CRDButton>
                
                <CRDButton
                  variant="secondary"
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </CRDButton>
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-crd-text-dim text-sm mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs text-crd-text-muted bg-crd-surface p-3 rounded overflow-auto max-h-40">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </CRDCard>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper with error reporting
export const CRDFeatureErrorBoundary: React.FC<{
  children: ReactNode;
  featureName: string;
  fallbackMessage?: string;
}> = ({ children, featureName, fallbackMessage }) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error(`Feature error in ${featureName}:`, error, errorInfo);
  };

  return (
    <CRDErrorBoundary
      featureName={featureName}
      onError={handleError}
    >
      {children}
    </CRDErrorBoundary>
  );
};