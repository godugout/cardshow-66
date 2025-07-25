
import { UnifiedRepository } from '../UnifiedRepository';
import { supabase } from '@/integrations/supabase/client';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  card_count?: number;
}

export class CollectionRepository extends UnifiedRepository<Collection> {
  constructor() {
    super('collections', {
      enableOffline: true,
      syncOnRead: true,
      cacheTimeout: 15 * 60 * 1000 // 15 minutes for collections
    });
  }

  async findByUser(userId: string): Promise<Collection[]> {
    return this.findAll({ user_id: userId });
  }

  async findPublicCollections(): Promise<Collection[]> {
    return this.findAll({ is_public: true });
  }

  async updateCardCount(collectionId: string): Promise<void> {
    try {
      // Count cards directly since RPC doesn't exist
      const { count } = await supabase
        .from('collection_items')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collectionId);
      
      // Update collection with count (if needed)
      console.log(`Collection ${collectionId} has ${count} cards`);
    } catch (error) {
      console.error('Error updating card count:', error);
    }
  }
}

export const collectionRepository = new CollectionRepository();
