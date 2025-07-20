import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ViewerErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Viewer error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <Card className="p-8 bg-black/40 backdrop-blur-sm border-red-500/20 text-white text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">3D Viewer Error</h3>
            <p className="text-gray-300 mb-6">
              {this.state.error?.message || 'Something went wrong with the 3D viewer. This might be due to graphics capabilities or browser compatibility.'}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => this.setState({ hasError: false })}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <div className="text-xs text-gray-400">
                <p>Troubleshooting tips:</p>
                <ul className="list-disc list-inside text-left mt-2 space-y-1">
                  <li>Check if your browser supports WebGL</li>
                  <li>Update your graphics drivers</li>
                  <li>Try a different browser</li>
                  <li>Disable browser extensions</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}