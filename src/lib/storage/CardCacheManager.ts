import { openDB, IDBPDatabase } from 'idb';

interface CachedCard {
  id: string;
  serialNumber: string;
  compositeUrl: string;
  imageBlob: Blob;
  metadata: {
    title: string;
    rarity: string;
    frameId: string;
    effects: Record<string, any>;
    createdAt: string;
  };
  cachedAt: number;
}

class CardCacheManager {
  private db: IDBPDatabase | null = null;
  private readonly DB_NAME = 'CRDCardCache';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'cards';
  private readonly MAX_CACHE_SIZE = 100; // Max cards to cache
  private readonly CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

  async init(): Promise<void> {
    try {
      this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('cards')) {
            const store = db.createObjectStore('cards', { keyPath: 'id' });
            store.createIndex('serialNumber', 'serialNumber', { unique: true });
            store.createIndex('cachedAt', 'cachedAt');
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize card cache:', error);
    }
  }

  async cacheCard(card: CachedCard): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    try {
      // Clean old cache entries first
      await this.cleanExpiredCache();
      
      // Check cache size and remove oldest if needed
      const count = await this.db.count(this.STORE_NAME);
      if (count >= this.MAX_CACHE_SIZE) {
        await this.removeOldestCard();
      }

      await this.db.put(this.STORE_NAME, {
        ...card,
        cachedAt: Date.now()
      });

      console.log(`Card ${card.serialNumber} cached successfully`);
    } catch (error) {
      console.error('Failed to cache card:', error);
    }
  }

  async getCachedCard(cardId: string): Promise<CachedCard | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    try {
      const card = await this.db.get(this.STORE_NAME, cardId);
      
      if (!card) return null;

      // Check if cache is expired
      if (Date.now() - card.cachedAt > this.CACHE_EXPIRY) {
        await this.db.delete(this.STORE_NAME, cardId);
        return null;
      }

      return card;
    } catch (error) {
      console.error('Failed to get cached card:', error);
      return null;
    }
  }

  async getCachedCardBySerial(serialNumber: string): Promise<CachedCard | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    try {
      const tx = this.db.transaction(this.STORE_NAME, 'readonly');
      const index = tx.store.index('serialNumber');
      const card = await index.get(serialNumber);
      
      if (!card) return null;

      // Check if cache is expired
      if (Date.now() - card.cachedAt > this.CACHE_EXPIRY) {
        await this.db.delete(this.STORE_NAME, card.id);
        return null;
      }

      return card;
    } catch (error) {
      console.error('Failed to get cached card by serial:', error);
      return null;
    }
  }

  async getAllCachedCards(): Promise<CachedCard[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];

    try {
      const cards = await this.db.getAll(this.STORE_NAME);
      const now = Date.now();
      
      // Filter out expired cards
      const validCards = cards.filter(card => 
        now - card.cachedAt <= this.CACHE_EXPIRY
      );

      // Remove expired cards from cache
      const expiredCards = cards.filter(card => 
        now - card.cachedAt > this.CACHE_EXPIRY
      );
      
      for (const expiredCard of expiredCards) {
        await this.db.delete(this.STORE_NAME, expiredCard.id);
      }

      return validCards.sort((a, b) => b.cachedAt - a.cachedAt);
    } catch (error) {
      console.error('Failed to get all cached cards:', error);
      return [];
    }
  }

  async downloadAndCacheCard(cardId: string, compositeUrl: string, metadata: CachedCard['metadata']): Promise<void> {
    try {
      // Download the image
      const response = await fetch(compositeUrl);
      if (!response.ok) throw new Error('Failed to download card image');
      
      const imageBlob = await response.blob();
      
      // Cache the card
      await this.cacheCard({
        id: cardId,
        serialNumber: metadata.title, // Temporary, should be actual serial
        compositeUrl,
        imageBlob,
        metadata,
        cachedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to download and cache card:', error);
    }
  }

  async getCachedImageUrl(cardId: string): Promise<string | null> {
    const cachedCard = await this.getCachedCard(cardId);
    if (!cachedCard) return null;
    
    return URL.createObjectURL(cachedCard.imageBlob);
  }

  async getCacheStats(): Promise<{ count: number; sizeEstimate: string }> {
    if (!this.db) await this.init();
    if (!this.db) return { count: 0, sizeEstimate: '0 MB' };

    try {
      const cards = await this.db.getAll(this.STORE_NAME);
      const totalSize = cards.reduce((sum, card) => sum + card.imageBlob.size, 0);
      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      
      return {
        count: cards.length,
        sizeEstimate: `${sizeInMB} MB`
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { count: 0, sizeEstimate: '0 MB' };
    }
  }

  private async cleanExpiredCache(): Promise<void> {
    if (!this.db) return;

    try {
      const now = Date.now();
      const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.store;
      const cards = await store.getAll();
      
      for (const card of cards) {
        if (now - card.cachedAt > this.CACHE_EXPIRY) {
          await store.delete(card.id);
        }
      }
    } catch (error) {
      console.error('Failed to clean expired cache:', error);
    }
  }

  private async removeOldestCard(): Promise<void> {
    if (!this.db) return;

    try {
      const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
      const index = tx.store.index('cachedAt');
      const cursor = await index.openCursor();
      
      if (cursor) {
        await cursor.delete();
      }
    } catch (error) {
      console.error('Failed to remove oldest card:', error);
    }
  }

  async clearCache(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    try {
      await this.db.clear(this.STORE_NAME);
      console.log('Card cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

export const cardCacheManager = new CardCacheManager();