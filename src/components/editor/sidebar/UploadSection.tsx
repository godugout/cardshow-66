
import React from 'react';
import { MediaUploadZone } from '@/components/media/MediaUploadZone';
import { useCardEditor } from '@/hooks/useCardEditor';
import { useCustomAuth } from '@/features/auth/hooks/useCustomAuth';
import { CRDMediaManager } from '@/lib/storage/CRDMediaManager';
import { toast } from 'sonner';

interface UploadSectionProps {
  cardEditor?: ReturnType<typeof useCardEditor>;
}

export const UploadSection = ({ cardEditor }: UploadSectionProps) => {
  const { user } = useCustomAuth();

  const handleUploadComplete = async (files: File[]) => {
    if (files.length > 0 && cardEditor && user) {
      const file = files[0];
      
      // Upload using CRDMediaManager
      const result = await CRDMediaManager.uploadCRDAsset(file, {
        bucket: 'card-images',
        asset_type: 'user_content',
        folder: `cards`,
        category: 'card-image',
        tags: ['card-image'],
        is_public: false,
        generateThumbnail: true,
        optimize: true
      });
      
      if (result) {
        const publicUrl = CRDMediaManager.getPublicUrl(result.bucket_id, result.file_path);
        
        // Update card with the uploaded image
        cardEditor.updateCardField('image_url', publicUrl);
        
        if (result.thumbnail_path) {
          const thumbnailUrl = CRDMediaManager.getPublicUrl(result.bucket_id, result.thumbnail_path);
          cardEditor.updateCardField('thumbnail_url', thumbnailUrl);
          cardEditor.updateDesignMetadata('thumbnailUrl', thumbnailUrl);
        }
        
        toast.success('Card image updated successfully!');
      }
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
    <div className="space-y-4" role="section" aria-label="File upload section">
      <h3 className="text-white font-medium">Upload Image</h3>
      
      <MediaUploadZone
        bucket="card-images"
        folder={`${user.id}`}
        maxFiles={1}
        generateThumbnail={true}
        optimize={true}
        tags={['card-image']}
        onUploadComplete={handleUploadComplete}
        className="min-h-[200px]"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-crd-green/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🖼️</span>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-medium mb-2">
              Upload Card Image
            </h3>
            <p className="text-crd-lightGray">
              Drag & drop your image here or click to browse
            </p>
          </div>
          
          <div className="text-sm text-crd-lightGray">
            PNG, JPG, WebP up to 50MB
          </div>
        </div>
      </MediaUploadZone>
    </div>
  );
};
