import React, { forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { CRDButton } from './Button';

const modalVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center p-4',
  {
    variants: {
      variant: {
        default: '',
        fullscreen: 'p-0'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

const modalContentVariants = cva(
  'relative bg-card border border-border rounded-xl shadow-2xl backdrop-blur-sm transition-all duration-300 ease-out',
  {
    variants: {
      size: {
        sm: 'max-w-sm w-full',
        md: 'max-w-md w-full',
        lg: 'max-w-lg w-full',
        xl: 'max-w-xl w-full',
        '2xl': 'max-w-2xl w-full',
        '3xl': 'max-w-3xl w-full',
        '4xl': 'max-w-4xl w-full',
        full: 'w-full h-full rounded-none'
      },
      variant: {
        default: 'max-h-[90vh] overflow-y-auto',
        fullscreen: 'h-full rounded-none'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: VariantProps<typeof modalContentVariants>['size'];
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  title?: string;
  description?: string;
}

export const CRDModal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    isOpen, 
    onClose, 
    children, 
    variant, 
    size, 
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    title,
    description,
    ...props 
  }, ref) => {
    
    // Handle escape key
    useEffect(() => {
      if (!closeOnEscape || !isOpen) return;
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [closeOnEscape, isOpen, onClose]);
    
    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);
    
    if (!isOpen) return null;
    
    const modalContent = (
      <div 
        className={cn(modalVariants({ variant }))}
        onClick={closeOnOverlayClick ? onClose : undefined}
        {...props}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        {/* Modal Content */}
        <div 
          className={cn(modalContentVariants({ size, variant }))}
          onClick={(e) => e.stopPropagation()}
          ref={ref}
        >
          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="space-y-1">
                {title && (
                  <h2 className="text-xl font-semibold text-white">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <CRDButton
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </CRDButton>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className={cn('px-6', (title || description || showCloseButton) ? 'pb-6' : 'py-6')}>
            {children}
          </div>
        </div>
      </div>
    );
    
    return createPortal(modalContent, document.body);
  }
);

CRDModal.displayName = 'CRDModal';

export { modalVariants, modalContentVariants };