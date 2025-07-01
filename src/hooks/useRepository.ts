
import { useState, useEffect } from 'react';
import { UnifiedRepository, BaseEntity } from '@/lib/storage/UnifiedRepository';

export interface UseRepositoryOptions {
  autoFetch?: boolean;
  filters?: Record<string, any>;
}

export function useRepository<T extends BaseEntity>(
  repository: UnifiedRepository<T>,
  options: UseRepositoryOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoFetch = true, filters } = options;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await repository.findAll(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newItem = await repository.create(item);
      setData(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const updatedItem = await repository.update(id, updates);
      if (updatedItem) {
        setData(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ));
      }
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      const success = await repository.delete(id);
      if (success) {
        setData(prev => prev.filter(item => item.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  };

  const findById = async (id: string) => {
    try {
      return await repository.findById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find item');
      return null;
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, JSON.stringify(filters)]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    remove,
    findById
  };
}
