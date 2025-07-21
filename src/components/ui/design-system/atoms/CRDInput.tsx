// Unified Component Library - Enhanced CRD Input
import React from 'react';
import { useSubdomainRouting } from '@/hooks/useSubdomainRouting';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface CRDInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const CRDInput: React.FC<CRDInputProps> = ({
  label,
  error,
  helperText,
  icon,
  className,
  ...props
}) => {
  const { currentSubdomain } = useSubdomainRouting();

  const baseClasses = 'crd-input w-full transition-all duration-200';
  
  const focusClasses = cn(
    'focus:ring-2 focus:ring-offset-2 focus:ring-offset-crd-black',
    currentSubdomain.primaryColor === 'orange' && 'focus:border-crd-orange focus:ring-crd-orange/50',
    currentSubdomain.primaryColor === 'blue' && 'focus:border-crd-blue focus:ring-crd-blue/50',
    currentSubdomain.primaryColor === 'green' && 'focus:border-crd-green focus:ring-crd-green/50'
  );

  const errorClasses = error ? 'border-crd-error focus:border-crd-error focus:ring-crd-error/50' : '';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-crd-text">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-crd-text-muted">
            {icon}
          </div>
        )}
        
        <input
          className={cn(
            baseClasses,
            focusClasses,
            errorClasses,
            icon && 'pl-10',
            className
          )}
          {...props}
        />
        
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-crd-error">
            <AlertCircle size={16} />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-crd-error flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-crd-text-dim">
          {helperText}
        </p>
      )}
    </div>
  );
};