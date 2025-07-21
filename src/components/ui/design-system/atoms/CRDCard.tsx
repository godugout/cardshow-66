// Enhanced CRD Card Component - Trading card aspect ratio and responsive
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const crdCardVariants = cva(
  // Base styles - 2.5:3.5 trading card aspect ratio by default
  "relative overflow-hidden transition-all duration-300 border border-crd-border bg-crd-surface",
  {
    variants: {
      variant: {
        // Default card styling
        default: "rounded-xl shadow-lg hover:shadow-xl hover:shadow-crd-border/20",
        // Trading card specific styling
        trading: "rounded-xl shadow-lg hover:shadow-2xl hover:shadow-crd-green/20 aspect-[2.5/3.5] hover:-translate-y-1 hover:scale-105",
        // Flat card for forms and content
        flat: "rounded-lg shadow-sm",
        // Elevated card for important content
        elevated: "rounded-xl shadow-xl border-crd-border-light",
        // Ghost card for subtle layouts
        ghost: "rounded-lg border-transparent bg-transparent hover:bg-crd-surface/50"
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8"
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-2 hover:scale-102",
        glow: "hover:shadow-2xl hover:shadow-current/10",
        border: "hover:border-crd-green/50"
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "none"
    }
  }
);

export interface CRDCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof crdCardVariants> {
  asChild?: boolean;
}

export const CRDCard = React.forwardRef<HTMLDivElement, CRDCardProps>(
  ({ className, variant, padding, hover, asChild, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(crdCardVariants({ variant, padding, hover, className }))}
        {...props}
      />
    );
  }
);

CRDCard.displayName = "CRDCard";

// Card content components
export const CRDCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));

CRDCardHeader.displayName = "CRDCardHeader";

export const CRDCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight text-crd-text", className)}
    {...props}
  />
));

CRDCardTitle.displayName = "CRDCardTitle";

export const CRDCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-crd-text-dim", className)}
    {...props}
  />
));

CRDCardDescription.displayName = "CRDCardDescription";

export const CRDCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

CRDCardContent.displayName = "CRDCardContent";

export const CRDCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));

CRDCardFooter.displayName = "CRDCardFooter";

export { crdCardVariants };