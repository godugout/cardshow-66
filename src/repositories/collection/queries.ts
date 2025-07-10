
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

  return data as unknown as Collection;
};

export const getUserCollections = async (userId: string, options: CollectionListOptions = {}): Promise<PaginatedCollections> => {
  const { page = 1, pageSize = 10, search } = options;
  const offset = calculateOffset(page, pageSize);

  let query = (supabase as any)
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

  const collections: Collection[] = (data as unknown as Collection[]) || [];

  return {
    collections,
    total: count || 0
  };
};

export const getAllCollections = async (options: CollectionListOptions = {}): Promise<PaginatedCollections> => {
  const { page = 1, pageSize = 10, search } = options;
  const offset = calculateOffset(page, pageSize);

  let query = (supabase as any)
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

  const collections: Collection[] = (data as unknown as Collection[]) || [];

  return {
    collections,
    total: count || 0
  };
};

export const getHotCollections = async (limit = 10): Promise<Collection[]> => {
  const { data, error } = await (supabase as any)
    .from('collections')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch hot collections: ${error.message}`);

  return (data as unknown as Collection[]) || [];
};
