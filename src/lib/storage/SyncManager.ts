
import { localStorageManager } from './LocalStorageManager';
import { cardRepository } from './repositories/CardRepository';
import { collectionRepository } from './repositories/CollectionRepository';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  syncInProgress: boolean;
}

export class SyncManager {
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: null,
    pendingOperations: 0,
    syncInProgress: false
  };

  private listeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    this.initializeNetworkListeners();
    this.initializeAutoSync();
  }

  private initializeNetworkListeners() {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    });
  }

  private initializeAutoSync() {
    // Auto-sync every 5 minutes when online
    setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.syncInProgress) {
        this.syncAll();
      }
    }, 5 * 60 * 1000);
  }

  async syncAll(): Promise<void> {
    if (this.syncStatus.syncInProgress || !this.syncStatus.isOnline) {
      return;
    }

    this.syncStatus.syncInProgress = true;
    this.notifyListeners();

    try {
      await this.syncPendingOperations();
      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingOperations = 0;
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncStatus.syncInProgress = false;
      this.notifyListeners();
    }
  }

  private async syncPendingOperations(): Promise<void> {
    const pendingItems = localStorageManager.getPendingSyncItems();
    
    for (const item of pendingItems) {
      try {
        if (item.dataType === 'card') {
          if (item.value._offline) {
            await cardRepository.create(item.value);
          } else if (item.value._deleted) {
            await cardRepository.delete(item.key);
          } else {
            await cardRepository.update(item.key, item.value);
          }
        } else if (item.dataType === 'collection') {
          if (item.value._offline) {
            await collectionRepository.create(item.value);
          } else if (item.value._deleted) {
            await collectionRepository.delete(item.key);
          } else {
            await collectionRepository.update(item.key, item.value);
          }
        }

        localStorageManager.markAsSynced(item.key);
      } catch (error) {
        console.error(`Failed to sync item ${item.key}:`, error);
      }
    }
  }

  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getStatus()));
  }

  async forceSyncItem(key: string): Promise<boolean> {
    try {
      const item = localStorageManager.getItem(key);
      if (!item) return false;

      // Implement force sync logic here
      return true;
    } catch (error) {
      console.error(`Failed to force sync item ${key}:`, error);
      return false;
    }
  }
}

export const syncManager = new SyncManager();
