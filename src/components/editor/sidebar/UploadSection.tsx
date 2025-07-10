import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCustomAuth } from '@/features/auth/hooks/useCustomAuth';
import { UploadSection as UploadSectionComponent } from './elements/UploadSection';
import { toast } from 'sonner';

interface UploadSectionProps {
  onImageUploaded?: (imageUrl: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImageUploaded }) => {
  const { user } = useCustomAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error('Please sign in to upload images');
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('UploadSection: Starting upload...', file.name);
      
      // Create unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('card-images')
        .upload(filePath, file);

      if (error) {
        console.error('UploadSection: Upload error:', error);
        toast.error('Upload failed: ' + error.message);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('card-images')
        .getPublicUrl(filePath);

      console.log('UploadSection: Upload successful');
      console.log('  - File path:', filePath);
      console.log('  - Public URL:', publicUrl);
      
      toast.success('Image uploaded successfully!');
      
      if (onImageUploaded) {
        onImageUploaded(publicUrl);
      }
      
    } catch (error) {
      console.error('UploadSection: Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-crd-lightGray mb-4">Please sign in to upload images</p>
      </div>
    );
  }

  return (
    <UploadSectionComponent 
      onFileSelect={handleFileUpload}
      isUploading={isUploading}
    />
  );
};