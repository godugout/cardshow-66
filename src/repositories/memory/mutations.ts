
import { supabase } from '@/integrations/supabase/client';
import type { Memory } from '@/types/memory';
import type { CreateMemoryParams, UpdateMemoryParams } from './types';
import { getMemoryById } from './queries';
// Removed getAppId import - not available

export const createMemory = async (params: CreateMemoryParams): Promise<Memory> => {
  try {
    // Mock app_id
    const appId = null;
    
    const { data, error } = await (supabase as any)
      .from('cards')
      .insert({
        user_id: params.userId,
        title: params.title,
        description: params.description,
        // team_id: params.teamId, // Not in cards schema
        // game_id: params.gameId, // Not in cards schema
        // location: params.location, // Not in cards schema
        // visibility: params.visibility, // Not in cards schema
        tags: params.tags || [],
        // metadata: params.metadata, // Not in cards schema
        is_public: params.visibility === 'public'
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create memory: ${error.message}`);
    if (!data) throw new Error('No data returned after creating memory');

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
      commentCount: 0,
      reactions: []
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
    if (params.visibility !== undefined) cardUpdates.is_public = params.visibility === 'public';
    if (params.tags !== undefined) cardUpdates.tags = params.tags;

    const { data, error } = await (supabase as any)
      .from('cards')
      .update(cardUpdates)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update memory: ${error.message}`);
    if (!data) throw new Error(`Memory not found: ${params.id}`);

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
      commentCount: 0,
      reactions: []
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
