import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  'animate-pulse rounded-lg bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40 bg-[length:200%_100%]',
  {
    variants: {
      variant: {
        default: 'bg-muted/60',
        shimmer: 'bg-gradient-to-r from-muted/40 via-muted/80 to-muted/40 animate-[shimmer_2s_ease-in-out_infinite]',
        pulse: 'bg-muted/60 animate-pulse',
        wave: 'bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40 bg-[length:200%_100%] animate-[wave_1.5s_ease-in-out_infinite]'
      },
      size: {
        sm: 'h-4',
        md: 'h-6',
        lg: 'h-8',
        xl: 'h-10'
      },
      shape: {
        rectangle: 'rounded-lg',
        circle: 'rounded-full aspect-square',
        line: 'rounded-full h-2'
      }
    },
    defaultVariants: {
      variant: 'shimmer',
      size: 'md',
      shape: 'rectangle'
    }
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

export const CRDSkeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, shape, width, height, style, ...props }, ref) => {
    const customStyle = {
      width: width,
      height: shape === 'circle' ? width : height,
      ...style
    };

    return (
      <div
        className={cn(skeletonVariants({ variant, size, shape, className }))}
        style={customStyle}
        ref={ref}
        {...props}
      />
    );
  }
);

CRDSkeleton.displayName = 'CRDSkeleton';

// Common skeleton patterns
export const CRDSkeletonText = forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'shape'> & { lines?: number }
>(({ lines = 1, className, ...props }, ref) => {
  if (lines === 1) {
    return (
      <CRDSkeleton
        shape="line"
        className={cn('w-full', className)}
        ref={ref}
        {...props}
      />
    );
  }

  return (
    <div className="space-y-2" ref={ref}>
      {Array.from({ length: lines }).map((_, i) => (
        <CRDSkeleton
          key={i}
          shape="line"
          className={cn(
            'w-full',
            i === lines - 1 && 'w-3/4', // Last line is shorter
            className
          )}
          {...props}
        />
      ))}
    </div>
  );
});
CRDSkeletonText.displayName = 'CRDSkeletonText';

export const CRDSkeletonAvatar = forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'shape'>
>(({ className, ...props }, ref) => (
  <CRDSkeleton
    shape="circle"
    width="40px"
    className={className}
    ref={ref}
    {...props}
  />
));
CRDSkeletonAvatar.displayName = 'CRDSkeletonAvatar';

export const CRDSkeletonCard = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn('space-y-3 p-4 border border-border rounded-xl', className)}
    ref={ref}
    {...props}
  >
    <div className="flex items-center space-x-3">
      <CRDSkeletonAvatar />
      <div className="space-y-2 flex-1">
        <CRDSkeleton className="h-4 w-3/4" />
        <CRDSkeleton className="h-3 w-1/2" />
      </div>
    </div>
    <CRDSkeleton className="h-32 w-full rounded-lg" />
    <CRDSkeletonText lines={2} />
  </div>
));
CRDSkeletonCard.displayName = 'CRDSkeletonCard';

export { skeletonVariants };