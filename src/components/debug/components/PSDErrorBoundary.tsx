
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PSDErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface PSDErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class PSDErrorBoundary extends React.Component<PSDErrorBoundaryProps, PSDErrorBoundaryState> {
  constructor(props: PSDErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PSDErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PSD Error Boundary caught an error:', error, errorInfo);
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} reset={this.handleReset} />;
      }

      return (
        <div className="min-h-screen bg-[#0a0a0b] p-6 flex items-center justify-center">
          <Card className="max-w-md w-full bg-[#131316] border-red-500/30 p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
              <h2 className="text-xl font-semibold text-white">PSD Processing Error</h2>
              
              <Alert className="border-red-700 bg-red-900/20 text-left">
                <AlertDescription className="text-red-300 text-sm">
                  {this.state.error?.message || 'An unexpected error occurred while processing the PSD file.'}
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  className="bg-crd-green text-black hover:bg-crd-green/90"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  asChild
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="text-left">
                  <summary className="text-gray-400 cursor-pointer text-sm">Error Details</summary>
                  <pre className="text-xs text-gray-500 mt-2 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
