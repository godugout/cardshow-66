
import { supabase } from '@/lib/supabase-client';
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
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      // Cache offline
      if (this.options.enableOffline) {
        localStorageManager.setItem(`${this.tableName}_${result.id}`, result, 'card');
      }

      return result;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      
      // Fallback to offline storage
      if (this.options.enableOffline) {
        const offlineData = {
          ...data,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          _offline: true
        } as unknown as T;
        
        localStorageManager.setItem(`${this.tableName}_${offlineData.id}`, offlineData, 'card', 'high');
        return offlineData;
      }
      
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

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Update cache
      if (data && this.options.enableOffline) {
        localStorageManager.setItem(`${this.tableName}_${id}`, data, 'card');
      }

      return data || null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by id:`, error);
      
      // Fallback to offline storage
      if (this.options.enableOffline) {
        return localStorageManager.getItem<T>(`${this.tableName}_${id}`);
      }
      
      return null;
    }
  }

  async findAll(filters?: Record<string, any>): Promise<T[]> {
    try {
      let query = supabase.from(this.tableName).select('*');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Update cache
      if (data && this.options.enableOffline) {
        data.forEach(item => {
          localStorageManager.setItem(`${this.tableName}_${item.id}`, item, 'card');
        });
      }

      return data || [];
    } catch (error) {
      console.error(`Error finding all ${this.tableName}:`, error);
      
      // Fallback to offline storage
      if (this.options.enableOffline) {
        const allKeys = Object.keys(localStorage).filter(key => 
          key.startsWith(`${this.tableName}_`)
        );
        
        return allKeys.map(key => {
          const item = localStorageManager.getItem<T>(key.replace(`${this.tableName}_`, ''));
          return item;
        }).filter(Boolean) as T[];
      }
      
      return [];
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      if (this.options.enableOffline) {
        localStorageManager.setItem(`${this.tableName}_${id}`, result, 'card');
      }

      return result;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      
      // Fallback to offline storage
      if (this.options.enableOffline) {
        const existing = localStorageManager.getItem<T>(`${this.tableName}_${id}`);
        if (existing) {
          const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
          localStorageManager.setItem(`${this.tableName}_${id}`, updated, 'card', 'high');
          return updated;
        }
      }
      
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from cache
      if (this.options.enableOffline) {
        localStorageManager.removeItem(`${this.tableName}_${id}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      
      // Mark as deleted in offline storage
      if (this.options.enableOffline) {
        const existing = localStorageManager.getItem<T>(`${this.tableName}_${id}`);
        if (existing) {
          localStorageManager.setItem(`${this.tableName}_${id}`, 
            { ...existing, _deleted: true } as T, 'card', 'high');
        }
      }
      
      return false;
    }
  }

  private isCacheExpired(item: any): boolean {
    if (!this.options.cacheTimeout) return false;
    const cacheTime = new Date(item.updated_at || item.created_at).getTime();
    return Date.now() - cacheTime > this.options.cacheTimeout;
  }
}
