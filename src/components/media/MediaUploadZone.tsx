
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MediaUploadZoneProps {
  bucket: string;
  folder?: string;
  maxFiles?: number;
  generateThumbnail?: boolean;
  optimize?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  onUploadComplete: (files: any[]) => void;
  className?: string;
  children?: React.ReactNode;
}

export const MediaUploadZone: React.FC<MediaUploadZoneProps> = ({
  bucket,
  folder = '',
  maxFiles = 1,
  metadata,
  onUploadComplete,
  className,
  children
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    console.log('MediaUploadZone: Starting upload for file:', file.name);
    console.log('MediaUploadZone: User:', user);
    console.log('MediaUploadZone: Bucket:', bucket);
    console.log('MediaUploadZone: Folder:', folder);
    
    if (!user) {
      console.error('MediaUploadZone: No user found');
      toast.error('Please sign in to upload files');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;
    
    console.log('MediaUploadZone: Upload path:', filePath);

    try {
      console.log('MediaUploadZone: Starting upload to bucket:', bucket, 'with path:', filePath);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        console.error('MediaUploadZone: Upload error details:', {
          error: error,
          errorMessage: error.message,
          bucket,
          filePath,
          fileSize: file.size,
          fileType: file.type
        });
        throw error;
      }

      console.log('MediaUploadZone: Upload successful to bucket:', bucket, 'data:', data);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('MediaUploadZone: Generated public URL:', publicUrl);

      return {
        path: data.path,
        publicUrl,
        metadata: {
          originalName: file.name,
          size: file.size,
          type: file.type,
          publicUrl,
          ...metadata
        }
      };
    } catch (error) {
      console.error('MediaUploadZone: Upload failed:', error);
      throw error;
    }
  }, [user, bucket, folder, metadata]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('MediaUploadZone: onDrop called with files:', acceptedFiles);
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    
    try {
      console.log('MediaUploadZone: Starting upload process...');
      const uploadPromises = acceptedFiles.slice(0, maxFiles).map(uploadFile);
      
      console.log('MediaUploadZone: Waiting for upload promises...');
      const results = await Promise.all(uploadPromises);
      
      console.log('MediaUploadZone: Upload results:', results);
      const successfulUploads = results.filter(Boolean);
      
      console.log('MediaUploadZone: Successful uploads:', successfulUploads);
      
      if (successfulUploads.length > 0) {
        console.log('MediaUploadZone: Calling onUploadComplete with:', successfulUploads);
        onUploadComplete(successfulUploads);
        toast.success(`${successfulUploads.length} file(s) uploaded successfully`);
      } else {
        console.error('MediaUploadZone: No successful uploads');
        toast.error('Upload failed - no files were uploaded successfully');
      }
    } catch (error) {
      console.error('MediaUploadZone: Upload failed with error:', error);
      toast.error('Upload failed: ' + (error as Error).message);
    } finally {
      console.log('MediaUploadZone: Setting uploading to false');
      setUploading(false);
    }
  }, [maxFiles, uploadFile, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles,
    disabled: uploading
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive 
          ? "border-crd-green bg-crd-green/10" 
          : "border-crd-mediumGray hover:border-crd-green",
        uploading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input {...getInputProps()} />
      
      {uploading ? (
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="w-8 h-8 text-crd-green animate-spin" />
          <p className="text-white">Uploading...</p>
        </div>
      ) : children ? (
        children
      ) : (
        <div className="flex flex-col items-center space-y-4">
          {isDragActive ? (
            <>
              <Upload className="w-12 h-12 text-crd-green" />
              <p className="text-white">Drop files here...</p>
            </>
          ) : (
            <>
              <Image className="w-12 h-12 text-crd-lightGray" />
              <div>
                <p className="text-white mb-1">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-crd-lightGray text-sm">
                  PNG, JPG, WebP up to 50MB
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
