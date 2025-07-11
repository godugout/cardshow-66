
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader } from 'lucide-react';

const universalButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-crd-green text-black hover:bg-crd-green/90 focus-visible:ring-crd-green shadow-sm hover:shadow-md",
        secondary: "bg-card text-foreground border border-border hover:bg-accent/20 hover:border-accent/30 shadow-sm",
        outline: "border border-border text-foreground hover:bg-accent/10 hover:border-accent hover:text-accent",
        ghost: "text-foreground hover:bg-accent/10 hover:text-accent",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        success: "bg-crd-green text-black hover:bg-crd-green/90 shadow-sm",
        gradient: "bg-gradient-to-r from-crd-orange via-crd-green to-crd-blue text-white hover:opacity-90 shadow-md hover:shadow-lg",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface UniversalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof universalButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const UniversalButton = React.forwardRef<HTMLButtonElement, UniversalButtonProps>(
  ({ className, variant, size, asChild = false, loading, icon, children, disabled, ...props }, ref) => {
    return (
      <Button
        className={cn(universalButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : icon ? (
          <span className="flex items-center gap-2">
            {icon}
            {children}
          </span>
        ) : (
          children
        )}
      </Button>
    );
  }
);

UniversalButton.displayName = "UniversalButton";
