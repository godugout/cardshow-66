
import { supabase } from '@/integrations/supabase/client';

export const deleteMedia = async (mediaId: string, userId: string): Promise<void> => {
  try {
    const { data: mediaItem, error: fetchError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', mediaId)
      .single();
      
    if (fetchError) {
      throw new Error(`Error fetching media to delete: ${fetchError.message}`);
    }
    
    if (!mediaItem) {
      throw new Error('Media item not found');
    }
    
    const bucket = mediaItem.bucket_id;
    const filePath = mediaItem.file_path;
    
    const { error: deleteFileError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
      
    if (deleteFileError) {
      console.error(`Warning: Failed to delete main file: ${deleteFileError.message}`);
    }
    
    if (mediaItem.thumbnail_path) {
      const { error: deleteThumbError } = await supabase.storage
        .from(bucket)
        .remove([mediaItem.thumbnail_path]);
        
      if (deleteThumbError) {
        console.error(`Warning: Failed to delete thumbnail: ${deleteThumbError.message}`);
      }
    }
    
    const { error: deleteRecordError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', mediaId);
      
    if (deleteRecordError) {
      throw new Error(`Error deleting media record: ${deleteRecordError.message}`);
    }
    
  } catch (error) {
    console.error('Error in deleteMedia:', error);
    throw error;
  }
};
