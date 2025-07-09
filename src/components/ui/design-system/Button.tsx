
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crd-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-crd-orange text-black hover:bg-crd-orange/90 shadow-lg hover:shadow-xl',
        primary: 'bg-crd-green text-black hover:bg-crd-green/90 shadow-lg hover:shadow-xl',
        secondary: 'bg-crd-green text-black hover:bg-crd-green/90 shadow-lg hover:shadow-xl',
        outline: 'border-2 border-crd-orange text-crd-orange hover:bg-crd-orange hover:text-black',
        ghost: 'text-white hover:bg-white/10 hover:text-crd-green',
        gradient: 'bg-gradient-to-r from-crd-orange via-crd-green to-crd-blue text-white hover:opacity-90 shadow-lg hover:shadow-xl'
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 px-6 text-lg',
        xl: 'h-12 px-8 text-xl',
        icon: 'h-10 w-10 p-0'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children?: React.ReactNode;
  asChild?: boolean;
  icon?: React.ReactNode;
}

export const CRDButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, icon, asChild, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

CRDButton.displayName = 'CRDButton';

export { buttonVariants };
