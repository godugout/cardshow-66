import React from 'react';
import { Loader2, FileImage, Sparkles, Layers } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const loadingVariants = cva(
  "flex flex-col items-center justify-center",
  {
    variants: {
      variant: {
        default: "py-8",
        fullscreen: "fixed inset-0 bg-crd-black z-50",
        card: "p-6 bg-crd-surface rounded-lg border border-crd-border",
        inline: "py-4",
      },
      size: {
        sm: "",
        default: "",
        lg: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconVariants = cva(
  "animate-spin mb-3",
  {
    variants: {
      size: {
        sm: "w-4 h-4",
        default: "w-8 h-8", 
        lg: "w-12 h-12",
      },
      color: {
        primary: "text-crd-blue",
        orange: "text-crd-orange",
        green: "text-crd-green",
        yellow: "text-crd-yellow",
      },
    },
    defaultVariants: {
      size: "default",
      color: "primary",
    },
  }
);

export interface CRDLoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  icon?: 'spinner' | 'file' | 'sparkles' | 'layers';
  iconColor?: VariantProps<typeof iconVariants>['color'];
  iconSize?: VariantProps<typeof iconVariants>['size'];
}

const LoadingIcon: React.FC<{
  type: CRDLoadingStateProps['icon'];
  className: string;
}> = ({ type, className }) => {
  switch (type) {
    case 'file':
      return <FileImage className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'layers':
      return <Layers className={className} />;
    default:
      return <Loader2 className={className} />;
  }
};

export const CRDLoadingState = React.forwardRef<HTMLDivElement, CRDLoadingStateProps>(
  ({ 
    className, 
    variant, 
    size,
    message = "Loading...",
    progress,
    showProgress = false,
    icon = 'spinner',
    iconColor = 'primary',
    iconSize = 'default',
    ...props 
  }, ref) => {
    return (
      <div
        className={cn(loadingVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <LoadingIcon 
          type={icon}
          className={iconVariants({ size: iconSize, color: iconColor })}
        />
        
        <p className="text-crd-text-dim text-sm font-medium mb-2">
          {message}
        </p>
        
        {showProgress && typeof progress === 'number' && (
          <div className="w-64 max-w-full bg-crd-surface border border-crd-border rounded-full h-2 mb-2">
            <div 
              className="bg-crd-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        )}
        
        {variant === 'fullscreen' && (
          <p className="text-crd-text-muted text-xs text-center max-w-md px-4">
            Please wait while we process your request...
          </p>
        )}
      </div>
    );
  }
);

CRDLoadingState.displayName = "CRDLoadingState";

// Specialized loading components
export const PSDLoadingState: React.FC<{
  message?: string;
  progress?: number;
  showProgress?: boolean;
}> = ({ 
  message = "Processing PSD file...", 
  progress, 
  showProgress = false 
}) => (
  <CRDLoadingState
    variant="card"
    icon="file"
    iconColor="orange"
    iconSize="lg"
    message={message}
    progress={progress}
    showProgress={showProgress}
  />
);

export const ThreeDLoadingState: React.FC<{
  message?: string;
}> = ({ 
  message = "Loading 3D viewer..." 
}) => (
  <CRDLoadingState
    variant="card"
    icon="sparkles"
    iconColor="green"
    iconSize="lg"
    message={message}
  />
);

export const LayerLoadingState: React.FC<{
  message?: string;
}> = ({ 
  message = "Processing layers..." 
}) => (
  <CRDLoadingState
    variant="inline"
    icon="layers"
    iconColor="orange"
    message={message}
  />
);