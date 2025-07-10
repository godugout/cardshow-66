
import { supabase } from '@/integrations/supabase/client';
import type { Memory } from '@/types/memory';

export const getMemoryById = async (id: string): Promise<Memory | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching memory:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Get like count from card_likes table
    const { count: commentCount } = await (supabase as any)
      .from('card_likes')
      .select('*', { count: 'exact', head: true })
      .eq('card_id', id);
      
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      teamId: '', // Not in cards schema
      gameId: '', // Not in cards schema
      location: null, // Not in cards schema
      visibility: data.is_public ? 'public' : 'private',
      createdAt: data.created_at,
      tags: data.tags || [],
      metadata: {}, // Not in cards schema
      media: [], // Will be handled separately
      commentCount: commentCount || 0,
      reactions: []
    };
  } catch (error) {
    console.error('Error in getMemoryById:', error);
    return null;
  }
};
