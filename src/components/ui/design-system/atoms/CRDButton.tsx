// Enhanced CRD Button Component - Mobile-first with 44px touch targets
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const crdButtonVariants = cva(
  // Base styles - ensures 44px minimum touch target
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-crd-black min-h-[44px] touch-manipulation",
  {
    variants: {
      variant: {
        // Primary CRD button - use current subdomain color
        primary: "bg-crd-green text-crd-black hover:bg-crd-green/90 focus:ring-crd-green shadow-lg hover:shadow-xl hover:shadow-crd-green/25",
        // Orange variant for CRDMKR subdomain
        orange: "bg-crd-orange text-crd-black hover:bg-crd-orange/90 focus:ring-crd-orange shadow-lg hover:shadow-xl hover:shadow-crd-orange/25",
        // Blue variant for Studio and Marketplace
        blue: "bg-crd-blue text-white hover:bg-crd-blue/90 focus:ring-crd-blue shadow-lg hover:shadow-xl hover:shadow-crd-blue/25",
        // Secondary outline variant
        secondary: "border-2 border-crd-border text-crd-text hover:border-crd-green hover:text-crd-green hover:bg-crd-green/10 focus:ring-crd-green",
        // Ghost variant for subtle actions
        ghost: "text-crd-text-dim hover:text-crd-text hover:bg-crd-surface focus:ring-crd-border",
        // Destructive for dangerous actions
        destructive: "bg-crd-error text-white hover:bg-crd-error/90 focus:ring-crd-error shadow-lg hover:shadow-xl hover:shadow-crd-error/25",
        // Success variant
        success: "bg-crd-success text-crd-black hover:bg-crd-success/90 focus:ring-crd-success shadow-lg hover:shadow-xl hover:shadow-crd-success/25"
      },
      size: {
        // Small for compact interfaces
        sm: "px-3 py-2 text-sm min-h-[36px]",
        // Default size with proper touch target
        default: "px-6 py-3 text-base min-h-[44px]",
        // Large for primary actions
        lg: "px-8 py-4 text-lg min-h-[52px]",
        // Icon-only square buttons
        icon: "w-11 h-11 p-0"
      },
      loading: {
        true: "cursor-wait"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export interface CRDButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof crdButtonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const CRDButton = React.forwardRef<HTMLButtonElement, CRDButtonProps>(
  ({ className, variant, size, loading, icon, iconPosition = 'left', children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        className={cn(crdButtonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className={cn("mr-2", size === 'sm' && "mr-1.5")}>{icon}</span>
        )}
        
        {children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className={cn("ml-2", size === 'sm' && "ml-1.5")}>{icon}</span>
        )}
      </button>
    );
  }
);

CRDButton.displayName = "CRDButton";

export { crdButtonVariants };