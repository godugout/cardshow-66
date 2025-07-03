import { supabase } from '@/integrations/supabase/client';

export interface Card {
  id: string;
  title: string;
  description?: string;
  user_id: string; // Use user_id to match database schema
  image_url?: string;
  thumbnail_url?: string;
  rarity: string;
  tags: string[];
  price?: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardCreateParams {
  title: string;
  description?: string;
  user_id: string;
  image_url?: string;
  thumbnail_url?: string;
  rarity: string;
  tags?: string[];
  price?: number;
  is_public?: boolean;
}

export interface CardUpdateParams {
  id: string;
  title?: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  rarity?: string;
  tags?: string[];
  price?: number;
  is_public?: boolean;
}

export interface CardListOptions {
  page?: number;
  pageSize?: number;
  user_id?: string;
  tags?: string[];
  rarity?: string;
  search?: string;
  includePrivate?: boolean;
}

export interface PaginatedCards {
  cards: Card[];
  total: number;
}

export const CardRepository = {
  async getCardById(id: string): Promise<Card | null> {
    try {
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
      
      return data as unknown as Card;
    } catch (error) {
      console.error('Error in getCardById:', error);
      return null;
    }
  },

  async createCard(params: CardCreateParams): Promise<Card | null> {
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({
          title: params.title,
          description: params.description,
          user_id: params.user_id,
          image_url: params.image_url,
          thumbnail_url: params.thumbnail_url,
          rarity: params.rarity,
          tags: params.tags || [],
          price: params.price,
          is_public: params.is_public || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create card:', error.message);
        return null;
      }

      return data as unknown as Card;
    } catch (error) {
      console.error('Error in createCard:', error);
      return null;
    }
  },

  async updateCard(params: CardUpdateParams): Promise<Card | null> {
    try {
      const updates: any = {};
      
      if (params.title !== undefined) updates.title = params.title;
      if (params.description !== undefined) updates.description = params.description;
      if (params.image_url !== undefined) updates.image_url = params.image_url;
      if (params.thumbnail_url !== undefined) updates.thumbnail_url = params.thumbnail_url;
      if (params.rarity !== undefined) updates.rarity = params.rarity;
      if (params.tags !== undefined) updates.tags = params.tags;
      if (params.price !== undefined) updates.price = params.price;
      if (params.is_public !== undefined) updates.is_public = params.is_public;

      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update card:', error.message);
        return null;
      }

      return data as unknown as Card;
    } catch (error) {
      console.error('Error in updateCard:', error);
      return null;
    }
  },

  async getCards(options: CardListOptions = {}): Promise<PaginatedCards> {
    try {
      const {
        page = 1,
        pageSize = 10,
        user_id,
        tags,
        rarity,
        search,
        includePrivate = false
      } = options;

      let query = supabase
        .from('cards')
        .select('*', { count: 'exact' });
        
      // Apply filters
      if (!includePrivate) {
        query = query.eq('is_public', true);
      }
      
      if (user_id) {
        query = query.eq('user_id', user_id);
      }
      
      if (rarity) {
        query = query.eq('rarity', rarity);
      }
      
      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      // Pagination
      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Failed to fetch cards:', error.message);
        return { cards: [], total: 0 };
      }
      
      return {
        cards: (data as unknown as Card[]) || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error in getCards:', error);
      return { cards: [], total: 0 };
    }
  }
};