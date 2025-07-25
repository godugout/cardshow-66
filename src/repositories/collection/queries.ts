
import { supabase } from '@/integrations/supabase/client';
import { calculateOffset } from './core';
import type { Collection, CollectionListOptions, PaginatedCollections } from './types';

export const getCollectionById = async (id: string): Promise<Collection | null> => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to fetch collection: ${error.message}`);
  if (!data) return null;

  // Transform database response to Collection interface
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    owner_id: data.user_id,
    visibility: data.is_public ? 'public' : 'private',
    cover_image_url: null,
    created_at: data.created_at,
    updated_at: data.updated_at,
    views_count: 0,
    likes_count: 0,
    shares_count: 0,
    completion_rate: 0,
    is_template: false,
    template_category: null,
    tags: [],
    featured_until: null,
    last_activity_at: data.updated_at,
    design_metadata: {},
    allow_comments: true,
    team_id: null,
    app_id: null
  } as Collection;
};

export const getUserCollections = async (userId: string, options: CollectionListOptions = {}): Promise<PaginatedCollections> => {
  const { page = 1, pageSize = 10, search } = options;
  const offset = calculateOffset(page, pageSize);

  let query = supabase
    .from('collections')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch user collections: ${error.message}`);

  // Transform database responses to Collection interface
  const collections: Collection[] = (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    owner_id: item.user_id,
    visibility: item.is_public ? 'public' : 'private',
    cover_image_url: null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    views_count: 0,
    likes_count: 0,
    shares_count: 0,
    completion_rate: 0,
    is_template: false,
    template_category: null,
    tags: [],
    featured_until: null,
    last_activity_at: item.updated_at,
    design_metadata: {},
    allow_comments: true,
    team_id: null,
    app_id: null
  }));

  return {
    collections,
    total: count || 0
  };
};

export const getAllCollections = async (options: CollectionListOptions = {}): Promise<PaginatedCollections> => {
  const { page = 1, pageSize = 10, search } = options;
  const offset = calculateOffset(page, pageSize);

  let query = supabase
    .from('collections')
    .select('*', { count: 'exact' })
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch collections: ${error.message}`);

  // Transform database responses to Collection interface
  const collections: Collection[] = (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    owner_id: item.user_id,
    visibility: item.is_public ? 'public' : 'private',
    cover_image_url: null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    views_count: 0,
    likes_count: 0,
    shares_count: 0,
    completion_rate: 0,
    is_template: false,
    template_category: null,
    tags: [],
    featured_until: null,
    last_activity_at: item.updated_at,
    design_metadata: {},
    allow_comments: true,
    team_id: null,
    app_id: null
  }));

  return {
    collections,
    total: count || 0
  };
};

export const getHotCollections = async (limit = 10): Promise<Collection[]> => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch hot collections: ${error.message}`);

  // Transform database responses to Collection interface
  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    owner_id: item.user_id,
    visibility: item.is_public ? 'public' : 'private',
    cover_image_url: null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    views_count: 0,
    likes_count: 0,
    shares_count: 0,
    completion_rate: 0,
    is_template: false,
    template_category: null,
    tags: [],
    featured_until: null,
    last_activity_at: item.updated_at,
    design_metadata: {},
    allow_comments: true,
    team_id: null,
    app_id: null
  }));
};
