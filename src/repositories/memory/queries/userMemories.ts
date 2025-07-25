
import { supabase } from '@/integrations/supabase/client';
// Removed getAppId import - not available
import type { MemoryListOptions, PaginatedMemories } from '../types';
import { calculateOffset } from '../core';

export const getMemoriesByUserId = async (
  userId: string,
  options: MemoryListOptions = {}
): Promise<PaginatedMemories> => {
  try {
    const {
      page = 1,
      pageSize = 10,
      visibility,
      teamId,
      tags,
      search
    } = options;

    let query = supabase
      .from('cards')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    // Skip app_id filter for now
    
    if (visibility && visibility !== 'all') {
      query = query.eq('is_public', visibility === 'public');
    }
    
    // Skip teamId filter since not in cards table
    
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    query = query.range(
      calculateOffset(page, pageSize),
      calculateOffset(page, pageSize) + pageSize - 1
    );

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch cards: ${error.message}`);
    
    // Transform cards to Memory interface
    const memories = (data || []).map(card => ({
      id: card.id,
      userId: card.user_id,
      title: card.title,
      description: card.description,
      teamId: '', // Default since not in cards table
      gameId: null,
      location: null,
      visibility: (card.is_public ? 'public' : 'private') as 'public' | 'private' | 'shared',
      createdAt: card.created_at,
      tags: card.tags || [],
      metadata: {},
      media: []
    }));
    
    return {
      memories,
      total: count || 0
    };
  } catch (error) {
    console.error('Error in getMemoriesByUserId:', error);
    
    return {
      memories: [],
      total: 0
    };
  }
};
