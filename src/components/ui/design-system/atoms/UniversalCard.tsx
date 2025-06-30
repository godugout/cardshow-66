
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const universalCardVariants = cva(
  "rounded-lg border shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-[#131316] border-[#334155] text-white",
        elevated: "bg-[#1a1f2e] border-[#475569] text-white shadow-md",
        ghost: "bg-transparent border-transparent text-white",
        accent: "bg-[#131316] border-[#4ade80]/20 text-white",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
      hover: {
        none: "",
        lift: "hover:shadow-lg hover:-translate-y-1",
        glow: "hover:border-[#4ade80]/40 hover:shadow-[0_0_20px_rgba(74,222,128,0.1)]",
        scale: "hover:scale-[1.02]",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "none",
    },
  }
);

export interface UniversalCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof universalCardVariants> {
  asChild?: boolean;
}

export const UniversalCard = React.forwardRef<HTMLDivElement, UniversalCardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => {
    return (
      <Card
        className={cn(universalCardVariants({ variant, padding, hover, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

UniversalCard.displayName = "UniversalCard";
