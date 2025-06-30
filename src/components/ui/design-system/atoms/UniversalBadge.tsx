
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const universalBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#4ade80] text-black",
        secondary: "bg-[#1a1f2e] text-white border border-[#334155]",
        success: "bg-[#10b981] text-white",
        warning: "bg-[#f59e0b] text-black",
        error: "bg-[#ef4444] text-white",
        info: "bg-[#3b82f6] text-white",
        outline: "border border-[#334155] text-white bg-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface UniversalBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof universalBadgeVariants> {
  icon?: React.ReactNode;
}

export const UniversalBadge = React.forwardRef<HTMLDivElement, UniversalBadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(universalBadgeVariants({ variant, size, className }))}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    );
  }
);

UniversalBadge.displayName = "UniversalBadge";
