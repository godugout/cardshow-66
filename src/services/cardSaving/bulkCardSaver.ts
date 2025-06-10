
import { supabase } from '@/lib/supabase-client';
import type { FramedImage } from '@/components/cards/types/bulkUploadTypes';
import { toast } from 'sonner';

export interface SavedCard {
  id: string;
  title: string;
  image_url: string;
  collection_id: string;
  created_at: string;
}

export interface BulkSaveResult {
  success: boolean;
  savedCards: SavedCard[];
  errors: string[];
  totalProcessed: number;
}

export const bulkCardSaver = {
  async saveFramedImages(
    framedImages: FramedImage[],
    collectionId: string,
    userId: string
  ): Promise<BulkSaveResult> {
    const result: BulkSaveResult = {
      success: false,
      savedCards: [],
      errors: [],
      totalProcessed: framedImages.length
    };

    try {
      console.log(`🚀 Starting bulk save of ${framedImages.length} cards to collection ${collectionId}`);

      for (const framedImage of framedImages) {
        try {
          // Convert image URL to blob
          const response = await fetch(framedImage.imageUrl);
          const blob = await response.blob();

          // Generate unique filename
          const filename = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
          
          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('card-images')
            .upload(`bulk-uploads/${userId}/${filename}`, blob, {
              contentType: 'image/jpeg',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            result.errors.push(`Failed to upload image: ${uploadError.message}`);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('card-images')
            .getPublicUrl(uploadData.path);

          // Create card record
          const cardData = {
            title: `Extracted Card ${Date.now()}`,
            description: 'Bulk uploaded card',
            image_url: publicUrl,
            rarity: 'common' as const,
            tags: ['bulk-upload'],
            creator_id: userId,
            collection_id: collectionId,
            is_public: false,
            design_metadata: {
              uploadMethod: 'bulk',
              originalFile: framedImage.originalFile.name,
              extractedAt: new Date().toISOString()
            }
          };

          const { data: cardRecord, error: cardError } = await supabase
            .from('cards')
            .insert(cardData)
            .select()
            .single();

          if (cardError) {
            console.error('Card creation error:', cardError);
            result.errors.push(`Failed to create card: ${cardError.message}`);
            continue;
          }

          result.savedCards.push(cardRecord);
          console.log(`✅ Successfully saved card: ${cardRecord.id}`);

        } catch (error) {
          console.error('Error processing card:', error);
          result.errors.push(`Failed to process card: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.savedCards.length > 0;
      console.log(`📊 Bulk save completed: ${result.savedCards.length} saved, ${result.errors.length} errors`);

      return result;

    } catch (error) {
      console.error('💥 Bulk save failed:', error);
      result.errors.push(`Bulk save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }
};
