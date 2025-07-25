
import { supabase } from '@/integrations/supabase/client';
import type { Collection, CreateCollectionParams, UpdateCollectionParams } from './types';
import { getCollectionById } from './queries';
// Removed getAppId import - not available

export const createCollection = async (params: CreateCollectionParams): Promise<Collection> => {
  // Mock app_id
  const appId = null;
  
  // Create the collection
  const { data, error } = await supabase
    .from('collections')
    .insert({
      title: params.title,
      description: params.description,
      user_id: params.owner_id,
      is_public: params.visibility === 'public'
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create collection: ${error.message}`);
  if (!data) throw new Error('No data returned after creating collection');

  return {
    ...data,
    owner_id: data.user_id,
    visibility: data.is_public ? 'public' : 'private',
    cover_image_url: null,
    views_count: 0,
    likes_count: 0,
    shares_count: 0,
    completion_rate: 0,
    is_template: false,
    tags: [],
    last_activity_at: data.updated_at,
    design_metadata: {},
    allow_comments: true
  } as Collection;
};

export const updateCollection = async (params: UpdateCollectionParams): Promise<Collection> => {
  const updates: Record<string, any> = {};
  
  if (params.title !== undefined) updates.title = params.title;
  if (params.description !== undefined) updates.description = params.description;
  if (params.visibility !== undefined) updates.is_public = params.visibility === 'public';

  const { data, error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update collection: ${error.message}`);
  if (!data) throw new Error(`Collection not found: ${params.id}`);

  return {
    ...data,
    owner_id: data.user_id,
    visibility: data.is_public ? 'public' : 'private',
    cover_image_url: null,
    views_count: 0,
    likes_count: 0,
    shares_count: 0,
    completion_rate: 0,
    is_template: false,
    tags: [],
    last_activity_at: data.updated_at,
    design_metadata: {},
    allow_comments: true
  } as Collection;
};

export const updateCollectionCards = async (collectionId: string, cardIds: string[]): Promise<void> => {
  // First, remove all existing items
  const { error: deleteError } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId);
    
  if (deleteError) throw new Error(`Failed to update collection cards: ${deleteError.message}`);
  
  // Then add the new cards
  if (cardIds.length > 0) {
    const collectionItems = cardIds.map((cardId, index) => ({
      collection_id: collectionId,
      card_id: cardId,
      display_order: index
    }));
    
    const { error: insertError } = await supabase
      .from('collection_items')
      .insert(collectionItems.map(item => ({
        collection_id: item.collection_id,
        card_id: item.card_id,
        position: item.display_order
      })));
      
    if (insertError) throw new Error(`Failed to add cards to collection: ${insertError.message}`);
  }
};

export const deleteCollection = async (id: string): Promise<void> => {
  // Get the collection first to make sure it exists
  const collection = await getCollectionById(id);
  if (!collection) throw new Error(`Collection not found: ${id}`);

  // Delete all collection items first
  const { error: itemsError } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', id);
    
  if (itemsError) {
    console.error('Failed to delete collection items:', itemsError);
  }

  // Then delete the collection
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete collection: ${error.message}`);
};
