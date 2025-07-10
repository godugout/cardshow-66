
import { supabase } from '@/integrations/supabase/client';
import type { MediaItem } from '@/types/media';

export const getMediaByMemoryId = async (memoryId: string): Promise<MediaItem[]> => {
  try {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('asset_reference_id', memoryId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(`Error fetching media: ${error.message}`);
    }
    
    return (data || []).map(item => ({
      id: item.id,
      memoryId: item.asset_reference_id || memoryId,
      type: item.asset_type.startsWith('image') ? 'image' as const : 
            item.asset_type.startsWith('video') ? 'video' as const : 'audio' as const,
      url: `https://qlggzunfzhhemntwbisn.supabase.co/storage/v1/object/public/${item.bucket_id}/${item.file_path}`,
      thumbnailUrl: item.thumbnail_path ? `https://qlggzunfzhhemntwbisn.supabase.co/storage/v1/object/public/${item.bucket_id}/${item.thumbnail_path}` : undefined,
      name: item.file_name,
      originalFilename: item.file_name,
      size: item.file_size || 0,
      createdAt: item.created_at || new Date().toISOString(),
      width: item.width || 0,
      height: item.height || 0,
      mimeType: item.mime_type || '',
      duration: item.duration || 0,
      metadata: (item.metadata && typeof item.metadata === 'object') ? item.metadata as any : {}
    }));
    
  } catch (error) {
    console.error('Error in getMediaByMemoryId:', error);
    throw error;
  }
};
