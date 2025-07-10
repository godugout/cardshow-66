import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { CRDButton } from '@/components/ui/design-system';

interface UploadSectionProps {
  onFileSelect?: (file: File) => void;
  isUploading?: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ 
  onFileSelect, 
  isUploading = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div role="section" aria-label="Upload assets section">
      <h4 className="text-crd-white font-medium text-sm uppercase tracking-wide mb-4">
        Upload Image
      </h4>
      
      <div className="p-6 border-2 border-dashed border-crd-mediumGray rounded-xl text-center hover:border-crd-green transition-colors">
        <div className="mb-4">
          {isUploading ? (
            <div className="w-12 h-12 mx-auto animate-spin">
              <div className="w-full h-full border-4 border-crd-green border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <ImageIcon className="w-12 h-12 text-crd-lightGray mb-2 mx-auto" />
          )}
        </div>
        
        <p className="text-crd-white font-medium mb-2">
          {isUploading ? 'Uploading...' : 'Upload Card Image'}
        </p>
        
        <p className="text-xs text-crd-lightGray mb-4">
          PNG, JPG, WebP up to 10MB
        </p>
        
        <CRDButton 
          variant="primary"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="bg-crd-green hover:bg-crd-green/90 rounded-lg text-black"
          aria-label="Browse and select files to upload"
        >
          {isUploading ? 'Uploading...' : 'Browse Files'}
        </CRDButton>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  );
};