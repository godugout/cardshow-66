
import { supabase } from '@/integrations/supabase/client';
import type { Memory } from '@/types/memory';

export const getMemoryById = async (id: string): Promise<Memory | null> => {
  try {
    // Use cards table since memories table doesn't exist
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching card:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Get like counts from card_likes table
    const { count: likeCount } = await supabase
      .from('card_likes')
      .select('*', { count: 'exact', head: true })
      .eq('card_id', id);
      
    // Mock reaction data since reactions table doesn't exist
    const reactions = likeCount ? [{ type: 'like', count: likeCount }] : [];
      
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      teamId: '', // Default since not in cards table
      gameId: null,
      location: null,
      visibility: data.is_public ? 'public' : 'private',
      createdAt: data.created_at,
      tags: data.tags || [],
      metadata: {},
      media: [],
      commentCount: 0, // Default since comments table doesn't exist
      reactions
    };
  } catch (error) {
    console.error('Error in getMemoryById:', error);
    return null;
  }
};
