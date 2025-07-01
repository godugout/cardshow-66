import localforage from 'localforage';

export type StorageDataType = 'card' | 'collection' | 'user' | 'settings' | 'other' | 'studio-state' | 'uploads' | 'recovery-data' | 'cards' | 'drafts' | 'memories' | 'sessions' | 'cache';
export type SyncPriority = 'high' | 'medium' | 'low' | 'critical';

interface StorageMetadata {
  dataType: StorageDataType;
  priority: SyncPriority;
  needsSync: boolean;
  lastModified: number;
  lastSynced?: number;
  syncStatus?: 'pending' | 'synced' | 'failed' | 'syncing' | 'local-only';
  syncRetries?: number;
}

export interface StorageItemMetadata {
  key: string;
  dataType: StorageDataType;
  priority: SyncPriority;
  lastModified: number;
  lastSynced?: number;
  syncStatus: 'pending' | 'synced' | 'failed' | 'syncing' | 'local-only';
  syncRetries: number;
}

export interface PendingSyncItem {
  key: string;
  value: any;
  dataType: StorageDataType;
  priority: SyncPriority;
  lastModified: number;
}

export class LocalStorageManager {
  private prefix = 'crd_';
  private testingMode = false;
  private config = {
    enableSync: true,
    testingMode: false,
    autoSyncInterval: 5 * 60 * 1000, // 5 minutes
  };

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const configStr = localStorage.getItem(this.prefix + 'config');
      if (configStr) {
        this.config = JSON.parse(configStr);
        this.testingMode = this.config.testingMode || false;
      }
    } catch (error) {
      console.error('Failed to load config from localStorage:', error);
    }
  }

  updateConfig(newConfig: Partial<typeof this.config>) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(this.prefix + 'config', JSON.stringify(this.config));
  }

  getConfig() {
    return { ...this.config };
  }

  setItem<T>(key: string, value: T, dataType: StorageDataType, priority: SyncPriority = 'medium'): void {
    if (!this.config.enableSync) {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return;
    }

    const metadata: StorageMetadata = {
      dataType,
      priority,
      needsSync: true,
      lastModified: Date.now(),
    };

    localStorage.setItem(this.prefix + key, JSON.stringify(value));
    localStorage.setItem(this.prefix + key + '_meta', JSON.stringify(metadata));
  }

  getItem<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      return itemStr ? JSON.parse(itemStr) as T : null;
    } catch (error) {
      console.error(`Failed to parse item ${key} from localStorage:`, error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
    localStorage.removeItem(this.prefix + key + '_meta');
  }

  getItemMetadata(key: string): StorageMetadata | null {
    try {
      const metadataStr = localStorage.getItem(key + '_meta');
      return metadataStr ? JSON.parse(metadataStr) as StorageMetadata : null;
    } catch (error) {
      console.error(`Failed to parse metadata for item ${key} from localStorage:`, error);
      return null;
    }
  }

  getPendingSyncItems(): PendingSyncItem[] {
    const items: PendingSyncItem[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.prefix)) continue;
      
      const metadata = this.getItemMetadata(key);
      if (metadata && metadata.needsSync) {
        const value = this.getItem(key.replace(this.prefix, ''));
        if (value) {
          items.push({
            key: key.replace(this.prefix, ''),
            value,
            dataType: metadata.dataType,
            priority: metadata.priority,
            lastModified: metadata.lastModified
          });
        }
      }
    }
    
    // Sort by priority and timestamp
    return items.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.lastModified - a.lastModified;
    });
  }

  markAsSynced(key: string): void {
    const fullKey = this.prefix + key;
    const metadata = this.getItemMetadata(fullKey);
    
    if (metadata) {
      const updatedMetadata = {
        ...metadata,
        needsSync: false,
        lastSynced: Date.now()
      };
      
      localStorage.setItem(fullKey + '_meta', JSON.stringify(updatedMetadata));
    }
  }

  clearAll(): void {
    if (!this.testingMode) {
      console.warn('localStorageManager.clearAll() called in production mode. This is likely a mistake.');
      return;
    }
    localStorage.clear();
  }

  setTestingMode(enabled: boolean): void {
    this.testingMode = enabled;
    this.config.testingMode = enabled;
    localStorage.setItem(this.prefix + 'config', JSON.stringify(this.config));
  }

  isTestingMode(): boolean {
    return this.testingMode;
  }

  getDebugInfo() {
    let totalSize = 0;
    const items = [];
    const itemsByType: Record<string, number> = {};
    let pendingSync = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key);
      if (value) {
        const size = value.length * 2; // 2 bytes per character
        totalSize += size;
        items.push({ key, size });

        // Count by data type
        if (key.startsWith(this.prefix) && !key.endsWith('_meta')) {
          const metadata = this.getItemMetadata(key);
          if (metadata) {
            itemsByType[metadata.dataType] = (itemsByType[metadata.dataType] || 0) + 1;
            if (metadata.needsSync) {
              pendingSync++;
            }
          }
        }
      }
    }

    const sizeInKB = (totalSize / 1024).toFixed(2);
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

    return {
      itemCount: localStorage.length,
      totalItems: items.length,
      totalSizeKB: sizeInKB,
      totalSizeMB: sizeInMB,
      pendingSync,
      syncQueue: pendingSync, // Alias for compatibility
      itemsByType,
      items: items.sort((a, b) => b.size - a.size),
      config: this.config,
    };
  }

  getPendingSyncCount(): number {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.prefix)) continue;
      const metadata = this.getItemMetadata(key);
      if (metadata && metadata.needsSync) {
        count++;
      }
    }
    return count;
  }

  // Additional methods needed by other components
  getAllMetadata(): StorageItemMetadata[] {
    const items: StorageItemMetadata[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.prefix) || key.endsWith('_meta')) continue;
      
      const metadata = this.getItemMetadata(key);
      if (metadata) {
        items.push({
          key: key.replace(this.prefix, ''),
          dataType: metadata.dataType,
          priority: metadata.priority,
          lastModified: metadata.lastModified,
          lastSynced: metadata.lastSynced,
          syncStatus: metadata.syncStatus || (metadata.needsSync ? 'pending' : 'synced'),
          syncRetries: metadata.syncRetries || 0
        });
      }
    }
    
    return items;
  }

  clearAllData(): void {
    this.clearAll();
  }

  getItemsByType(dataType: StorageDataType): Array<{ key: string; value: any }> {
    const items: Array<{ key: string; value: any }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.prefix) || key.endsWith('_meta')) continue;
      
      const metadata = this.getItemMetadata(key);
      if (metadata && metadata.dataType === dataType) {
        const value = this.getItem(key.replace(this.prefix, ''));
        if (value) {
          items.push({
            key: key.replace(this.prefix, ''),
            value
          });
        }
      }
    }
    
    return items;
  }

  getMetadata(key: string): StorageMetadata | null {
    return this.getItemMetadata(this.prefix + key);
  }
}

export const localStorageManager = new LocalStorageManager();
