import { supabase } from '@/integrations/supabase/client';

// Simplified media fetching for existing media_assets table
export const getMediaByMemoryId = async (memoryId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('asset_reference_id', memoryId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching media:', error.message);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error('Error in getMediaByMemoryId:', error);
    return [];
  }
};