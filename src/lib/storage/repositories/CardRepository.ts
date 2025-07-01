
import { supabase } from '@/lib/supabase-client';
import { UnifiedRepository } from '../UnifiedRepository';

export interface Card {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  collection_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export class CardRepository extends UnifiedRepository<Card> {
  constructor() {
    super('cards', {
      enableOffline: true,
      syncOnRead: true,
      cacheTimeout: 10 * 60 * 1000 // 10 minutes for cards
    });
  }

  async findByCollection(collectionId: string): Promise<Card[]> {
    return this.findAll({ collection_id: collectionId });
  }

  async findByUser(userId: string): Promise<Card[]> {
    return this.findAll({ user_id: userId });
  }

  async searchCards(query: string): Promise<Card[]> {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching cards:', error);
      // Fallback to local search
      const allCards = await this.findAll();
      return allCards.filter(card => 
        card.title.toLowerCase().includes(query.toLowerCase()) ||
        (card.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
      );
    }
  }
}

export const cardRepository = new CardRepository();
