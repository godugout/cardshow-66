import React, { Suspense, Component } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// Simple 3D Viewer placeholder - will enhance once basic loading works
const Simple3DViewer: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-crd-darkest rounded-lg border border-crd-border">
      <div className="text-center space-y-4">
        <div className="w-32 h-44 bg-crd-gradient rounded-lg mx-auto opacity-50"></div>
        <p className="text-crd-text-secondary text-sm">3D Card Preview</p>
      </div>
    </div>
  );
};

// Simple error boundary component
class ViewportErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Viewport error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            3D Viewport failed to load. Using fallback view.
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="ml-2 text-crd-accent hover:underline"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export const ProfessionalViewport: React.FC = () => {
  return (
    <div className="w-full h-full bg-crd-dark">
      <ViewportErrorBoundary>
        <Suspense 
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-crd-accent border-t-transparent rounded-full"></div>
            </div>
          }
        >
          <Simple3DViewer />
        </Suspense>
      </ViewportErrorBoundary>
    </div>
  );
};