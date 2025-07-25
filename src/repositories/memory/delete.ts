
import { deleteMedia } from '@/lib/mediaManager';
import { getMemoryById } from './queries';
import { supabase } from '@/integrations/supabase/client';

export const deleteMemory = async (id: string): Promise<void> => {
  // Since memories table doesn't exist, use cards table instead
  const { data: card, error: fetchError } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !card) throw new Error(`Card not found: ${id}`);

  // Delete associated media if any
  const { error: mediaError } = await supabase
    .from('media_assets')
    .delete()
    .eq('asset_reference_id', id);

  if (mediaError) console.warn('Failed to delete associated media:', mediaError);

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete card: ${error.message}`);
};

