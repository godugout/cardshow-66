
import { localStorageManager, StorageDataType } from './LocalStorageManager';
import { cardRepository } from './repositories/CardRepository';
import { collectionRepository } from './repositories/CollectionRepository';

export interface SyncProgress {
  total: number;
  completed: number;
  success: number;
  failed: number;
  current?: string;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  errors: string[];
}

export class UnifiedSyncService {
  async syncAllData(onProgress?: (progress: SyncProgress) => void): Promise<SyncResult> {
    const pendingItems = localStorageManager.getPendingSyncItems();
    const total = pendingItems.length;
    let completed = 0;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    const updateProgress = (current?: string) => {
      if (onProgress) {
        onProgress({ total, completed, success, failed, current });
      }
    };

    for (const item of pendingItems) {
      updateProgress(item.key);
      
      try {
        const syncSuccess = await this.syncItem(item);
        if (syncSuccess) {
          success++;
          localStorageManager.markAsSynced(item.key);
        } else {
          failed++;
          errors.push(`Failed to sync ${item.key}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Error syncing ${item.key}: ${error}`);
      }
      
      completed++;
      updateProgress();
    }

    return {
      success: failed === 0,
      syncedItems: success,
      failedItems: failed,
      errors
    };
  }

  async forceSyncItem(key: string): Promise<boolean> {
    const item = localStorageManager.getItem(key);
    if (!item) return false;

    const metadata = localStorageManager.getItemMetadata(key);
    if (!metadata) return false;

    const pendingItem = {
      key,
      value: item,
      dataType: metadata.dataType,
      priority: metadata.priority,
      lastModified: metadata.lastModified
    };

    try {
      const success = await this.syncItem(pendingItem);
      if (success) {
        localStorageManager.markAsSynced(key);
      }
      return success;
    } catch (error) {
      console.error(`Failed to force sync item ${key}:`, error);
      return false;
    }
  }

  private async syncItem(item: { key: string; value: any; dataType: StorageDataType }): Promise<boolean> {
    try {
      if (item.dataType === 'card') {
        if (item.value._offline) {
          await cardRepository.create(item.value);
        } else if (item.value._deleted) {
          await cardRepository.delete(item.key);
        } else {
          await cardRepository.update(item.key, item.value);
        }
        return true;
      } else if (item.dataType === 'collection') {
        if (item.value._offline) {
          await collectionRepository.create(item.value);
        } else if (item.value._deleted) {
          await collectionRepository.delete(item.key);
        } else {
          await collectionRepository.update(item.key, item.value);
        }
        return true;
      }
      
      // For other data types, just mark as synced for now
      return true;
    } catch (error) {
      console.error(`Failed to sync item ${item.key}:`, error);
      return false;
    }
  }
}

export const unifiedSyncService = new UnifiedSyncService();
