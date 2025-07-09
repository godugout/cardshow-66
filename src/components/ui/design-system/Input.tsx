
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-background px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-border focus-visible:ring-crd-orange',
        crd: 'bg-background border-border text-white placeholder:text-muted-foreground focus-visible:ring-crd-blue focus-visible:border-crd-blue',
        success: 'border-green-500 focus-visible:ring-green-500 text-green-700',
        error: 'border-red-500 focus-visible:ring-red-500 text-red-700',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500 text-yellow-700'
      },
      inputSize: {
        sm: 'h-9 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-11 px-4 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md'
    }
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  required?: boolean;
}

export const CRDInput = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize, 
    type, 
    label, 
    error, 
    success, 
    warning, 
    required,
    id,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    // Determine variant based on validation states
    const validationVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    return (
      <div className="w-full space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-white flex items-center gap-1"
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            type={type}
            className={cn(inputVariants({ variant: validationVariant, inputSize, className }))}
            ref={ref}
            id={inputId}
            {...props}
          />
          
          {/* Validation Icons */}
          {(error || success || warning) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {error && <AlertCircle className="h-4 w-4 text-red-500" />}
              {success && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {warning && <AlertCircle className="h-4 w-4 text-yellow-500" />}
            </div>
          )}
        </div>
        
        {/* Validation Messages */}
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-green-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {success}
          </p>
        )}
        {warning && (
          <p className="text-xs text-yellow-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {warning}
          </p>
        )}
      </div>
    );
  }
);

CRDInput.displayName = 'CRDInput';

export { inputVariants };
