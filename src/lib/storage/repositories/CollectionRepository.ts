
import { supabase } from '@/lib/supabase-client';
import { UnifiedRepository } from '../UnifiedRepository';

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
      const { data, error } = await supabase
        .rpc('update_collection_card_count', { collection_id: collectionId });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating card count:', error);
    }
  }
}

export const collectionRepository = new CollectionRepository();
