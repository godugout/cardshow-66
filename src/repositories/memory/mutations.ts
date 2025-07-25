
import { supabase } from '@/integrations/supabase/client';
import type { Memory } from '@/types/memory';
import type { CreateMemoryParams, UpdateMemoryParams } from './types';
import { getMemoryById } from './queries';
// Removed getAppId import - not available

export const createMemory = async (params: CreateMemoryParams): Promise<Memory> => {
  try {
    // Mock app_id
    const appId = null;
    
    const { data, error } = await supabase
      .from('cards')
      .insert({
        user_id: params.userId,
        title: params.title,
        description: params.description,
        tags: params.tags || [],
        is_public: params.visibility === 'public',
        category: 'memory'
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create card: ${error.message}`);
    if (!data) throw new Error('No data returned after creating card');

    // Transform card to Memory interface
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      teamId: params.teamId,
      gameId: params.gameId,
      location: params.location,
      visibility: params.visibility,
      createdAt: data.created_at,
      tags: data.tags || [],
      metadata: params.metadata || {},
      media: []
    } as Memory;
  } catch (error) {
    console.error('Error in createMemory:', error);
    
    // Try using the mock API as a fallback
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: params.userId,
          title: params.title,
          description: params.description,
          teamId: params.teamId,
          gameId: params.gameId,
          location: params.location,
          visibility: params.visibility,
          tags: params.tags,
          metadata: params.metadata
        })
      });
      
      if (!response.ok) {
        throw new Error(`Mock API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (e) {
      console.error('Mock API fallback failed:', e);
      throw error;
    }
  }
};

export const updateMemory = async (params: UpdateMemoryParams): Promise<Memory> => {
  try {
    const updates: Partial<Memory> = {};
    
    if (params.title !== undefined) updates.title = params.title;
    if (params.description !== undefined) updates.description = params.description;
    if (params.location !== undefined) updates.location = params.location;
    if (params.visibility !== undefined) updates.visibility = params.visibility;
    if (params.tags !== undefined) updates.tags = params.tags;
    if (params.metadata !== undefined) updates.metadata = params.metadata;

    const cardUpdates: any = {};
    if (params.title !== undefined) cardUpdates.title = params.title;
    if (params.description !== undefined) cardUpdates.description = params.description;
    if (params.tags !== undefined) cardUpdates.tags = params.tags;
    if (params.visibility !== undefined) cardUpdates.is_public = params.visibility === 'public';

    const { data, error } = await supabase
      .from('cards')
      .update(cardUpdates)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update card: ${error.message}`);
    if (!data) throw new Error(`Card not found: ${params.id}`);

    // Transform card to Memory interface
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      teamId: '', // Default values since not stored in cards
      gameId: null,
      location: params.location || null,
      visibility: data.is_public ? 'public' : 'private',
      createdAt: data.created_at,
      tags: data.tags || [],
      metadata: params.metadata || {},
      media: []
    } as Memory;
  } catch (error) {
    console.error('Error in updateMemory:', error);
    
    // Try using the mock API as a fallback
    try {
      const updates: any = {};
      
      if (params.title !== undefined) updates.title = params.title;
      if (params.description !== undefined) updates.description = params.description;
      if (params.location !== undefined) updates.location = params.location;
      if (params.visibility !== undefined) updates.visibility = params.visibility;
      if (params.tags !== undefined) updates.tags = params.tags;
      if (params.metadata !== undefined) updates.metadata = params.metadata;
      
      const response = await fetch(`/api/cards/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error(`Mock API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (e) {
      console.error('Mock API fallback failed:', e);
      throw error;
    }
  }
};
