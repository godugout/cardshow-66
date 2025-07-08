import React from 'react';
import { FeatureErrorBoundary } from './FeatureErrorBoundary';

interface FeatureErrorBoundaryWrapperProps {
  children: React.ReactNode;
  featureName: string;
  fallbackMessage?: string;
}

/**
 * Convenient wrapper for FeatureErrorBoundary that can be used as a hook-compatible component
 */
export const FeatureErrorBoundaryWrapper: React.FC<FeatureErrorBoundaryWrapperProps> = ({
  children,
  featureName,
  fallbackMessage
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Feature error in ${featureName}:`, error, errorInfo);
    
    // Report to monitoring service if available
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError({
        feature: featureName,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  };

  return (
    <FeatureErrorBoundary
      featureName={featureName}
      fallbackMessage={fallbackMessage}
      onError={handleError}
    >
      {children}
    </FeatureErrorBoundary>
  );
};