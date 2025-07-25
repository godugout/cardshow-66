
import { supabase } from '@/integrations/supabase/client';
// Removed getAppId import - not available
import type { MemoryListOptions, PaginatedMemories } from '../types';
import { calculateOffset } from '../core';

export const getPublicMemories = async (
  options: MemoryListOptions = {}
): Promise<PaginatedMemories> => {
  try {
    const {
      page = 1,
      pageSize = 10,
      teamId,
      tags,
      search
    } = options;

    let query = supabase
      .from('cards')
      .select('*', { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false });
      
    // Skip app_id filter for now
    
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

    if (error) throw new Error(`Failed to fetch public cards: ${error.message}`);
    
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
    console.error('Error in getPublicMemories:', error);
    
    // Try using the mock API as a fallback
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('visibility', 'public');
      queryParams.append('page', options.page?.toString() || '1');
      queryParams.append('limit', options.pageSize?.toString() || '10');
      if (options.teamId) queryParams.append('teamId', options.teamId);
      if (options.search) queryParams.append('search', options.search);
      if (options.tags && options.tags.length > 0) {
        queryParams.append('tags', options.tags.join(','));
      }
      
      const response = await fetch(`/api/cards?${queryParams.toString()}`);
      const data = await response.json();
      
      return {
        memories: data.items || [],
        total: data.total || 0
      };
    } catch (e) {
      console.error('Mock API fallback failed:', e);
      return {
        memories: [],
        total: 0
      };
    }
  }
};
