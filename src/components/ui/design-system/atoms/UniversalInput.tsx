
import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const universalInputVariants = cva(
  "flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#131316] border-[#334155] text-white focus-visible:ring-[#4ade80] focus-visible:border-[#4ade80]",
        ghost: "bg-transparent border-transparent text-white focus-visible:ring-[#4ade80] focus-visible:bg-[#131316]",
        error: "bg-[#131316] border-[#ef4444] text-white focus-visible:ring-[#ef4444]",
      },
      inputSize: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface UniversalInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof universalInputVariants> {
  error?: boolean;
  icon?: React.ReactNode;
}

export const UniversalInput = React.forwardRef<HTMLInputElement, UniversalInputProps>(
  ({ className, variant, inputSize, error, icon, ...props }, ref) => {
    const inputVariant = error ? 'error' : variant;
    
    if (icon) {
      return (
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748b]">
            {icon}
          </div>
          <Input
            className={cn(universalInputVariants({ variant: inputVariant, inputSize, className }), "pl-10")}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    return (
      <Input
        className={cn(universalInputVariants({ variant: inputVariant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

UniversalInput.displayName = "UniversalInput";
