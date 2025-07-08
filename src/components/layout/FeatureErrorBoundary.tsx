import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  fallbackMessage?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class FeatureErrorBoundary extends React.Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FeatureErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`FeatureErrorBoundary (${this.props.featureName}) caught an error:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <FeatureErrorFallback 
          featureName={this.props.featureName}
          fallbackMessage={this.props.fallbackMessage}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface FeatureErrorFallbackProps {
  featureName: string;
  fallbackMessage?: string;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onRetry: () => void;
}

const FeatureErrorFallback: React.FC<FeatureErrorFallbackProps> = ({ 
  featureName,
  fallbackMessage,
  error,
  errorInfo,
  onRetry 
}) => {
  const isDevelopment = window.location.hostname === 'localhost';

  return (
    <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {featureName} Unavailable
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {fallbackMessage || `There was a problem loading the ${featureName.toLowerCase()} feature.`}
          </p>
        </div>

        {isDevelopment && error && (
          <details className="text-left bg-background p-3 rounded border">
            <summary className="cursor-pointer text-xs text-muted-foreground mb-2 flex items-center gap-2">
              <Bug className="w-3 h-3" />
              Development Error Details
            </summary>
            <div className="text-xs font-mono text-red-600 dark:text-red-400">
              <div className="mb-2">
                {error.name}: {error.message}
              </div>
              {error.stack && (
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                  {error.stack.split('\n').slice(0, 5).join('\n')}
                </pre>
              )}
            </div>
          </details>
        )}

        <Button 
          onClick={onRetry} 
          variant="outline" 
          size="sm"
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </Card>
  );
};