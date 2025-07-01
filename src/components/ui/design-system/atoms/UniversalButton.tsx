
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader } from 'lucide-react';

const universalButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#4ade80] text-black hover:bg-[#22c55e] focus-visible:ring-[#4ade80]",
        secondary: "bg-[#1a1f2e] text-white border border-[#334155] hover:bg-[#242428] hover:border-[#475569]",
        outline: "border border-[#334155] text-white hover:bg-[#1a1f2e] hover:border-[#4ade80]",
        ghost: "text-white hover:bg-[#1a1f2e]",
        destructive: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
        success: "bg-[#10b981] text-white hover:bg-[#059669]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
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
