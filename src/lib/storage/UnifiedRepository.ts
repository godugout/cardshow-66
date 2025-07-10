// Simplified UnifiedRepository with better type safety
import { supabase } from '@/integrations/supabase/client';
import { localStorageManager } from './LocalStorageManager';

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface RepositoryOptions {
  enableOffline?: boolean;
  syncOnRead?: boolean;
  cacheTimeout?: number;
}

export class UnifiedRepository<T extends BaseEntity> {
  private tableName: string;
  private options: RepositoryOptions;

  constructor(tableName: string, options: RepositoryOptions = {}) {
    this.tableName = tableName;
    this.options = {
      enableOffline: true,
      syncOnRead: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      ...options
    };
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    try {
      // Use specific table operations instead of generic ones
      if (this.tableName === 'cards') {
        const { data: result, error } = await supabase
          .from('cards')
          .insert([data as any])
          .select()
          .single();

        if (error) throw error;
        return result as unknown as T;
      }

      // Fallback for other tables - simplified
      const offlineData = {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        _offline: true
      } as unknown as T;
      
      if (this.options.enableOffline) {
        localStorageManager.setItem(`${this.tableName}_${offlineData.id}`, offlineData, 'card', 'high');
      }
      
      return offlineData;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      // Check cache first
      if (this.options.enableOffline) {
        const cached = localStorageManager.getItem<T>(`${this.tableName}_${id}`);
        if (cached && !this.isCacheExpired(cached)) {
          return cached;
        }
      }

      // Use specific table operations
      if (this.tableName === 'cards') {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('id', id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return (data as unknown as T) || null;
      }

      return null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by id:`, error);
      return null;
    }
  }

  async findAll(filters?: Record<string, any>): Promise<T[]> {
    try {
      // Use specific table operations
      if (this.tableName === 'cards') {
        let query = supabase.from('cards').select('*');
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data as unknown as T[]) || [];
      }

      return [];
    } catch (error) {
      console.error(`Error finding all ${this.tableName}:`, error);
      return [];
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      // Use specific table operations
      if (this.tableName === 'cards') {
        const { data: result, error } = await supabase
          .from('cards')
          .update(data as any)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return result as unknown as T;
      }

      return null;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Use specific table operations
      if (this.tableName === 'cards') {
        const { error } = await supabase
          .from('cards')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      return false;
    }
  }

  private isCacheExpired(item: any): boolean {
    if (!this.options.cacheTimeout) return false;
    const cacheTime = new Date(item.updated_at || item.created_at).getTime();
    return Date.now() - cacheTime > this.options.cacheTimeout;
  }
}
