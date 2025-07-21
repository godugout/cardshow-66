// Unified Component Library - Enhanced CRD Modal
import React from 'react';
import { createPortal } from 'react-dom';
import { useSubdomainRouting } from '@/hooks/useSubdomainRouting';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { CRDButton } from './CRDButton';

interface CRDModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export const CRDModal: React.FC<CRDModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true
}) => {
  const { currentSubdomain } = useSubdomainRouting();

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  const borderColorClass = cn(
    currentSubdomain.primaryColor === 'orange' && 'border-crd-orange/30',
    currentSubdomain.primaryColor === 'blue' && 'border-crd-blue/30',
    currentSubdomain.primaryColor === 'green' && 'border-crd-green/30'
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="crd-modal-overlay fixed inset-0"
        onClick={handleOverlayClick}
      />
      
      {/* Modal Content */}
      <div className={cn(
        'crd-modal-content relative w-full max-h-[90vh] overflow-hidden flex flex-col',
        sizeClasses[size],
        borderColorClass
      )}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-crd-border">
            {title && (
              <h2 className="text-xl font-semibold text-crd-text">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <CRDButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-auto"
              >
                <X size={18} />
              </CRDButton>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};