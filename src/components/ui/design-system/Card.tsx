import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'shadow-lg hover:shadow-xl',
        elevated: 'shadow-xl hover:shadow-2xl hover:-translate-y-1',
        flat: 'shadow-none border-border',
        glow: 'shadow-lg shadow-crd-green/20 hover:shadow-xl hover:shadow-crd-green/30'
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md'
    }
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

export const CRDCard = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, children, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, padding, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CRDCard.displayName = 'CRDCard';

export const CRDCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));
CRDCardHeader.displayName = 'CRDCardHeader';

export const CRDCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold leading-none tracking-tight text-white', className)}
    {...props}
  />
));
CRDCardTitle.displayName = 'CRDCardTitle';

export const CRDCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CRDCardDescription.displayName = 'CRDCardDescription';

export const CRDCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CRDCardContent.displayName = 'CRDCardContent';

export const CRDCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CRDCardFooter.displayName = 'CRDCardFooter';

export { cardVariants };