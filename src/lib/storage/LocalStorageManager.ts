import localforage from 'localforage';

export type StorageDataType = 'card' | 'collection' | 'user' | 'settings' | 'other' | 'studio-state' | 'recovery-data' | 'uploads';
export type SyncPriority = 'high' | 'medium' | 'low' | 'critical';

export interface StorageMetadata {
  dataType: StorageDataType;
  priority: SyncPriority;
  needsSync: boolean;
  lastModified: number;
  lastSynced?: number;
  syncStatus?: 'pending' | 'syncing' | 'synced' | 'failed';
  syncRetries?: number;
}

export interface StorageItemMetadata extends StorageMetadata {
  key: string;
  size: number;
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
      syncStatus: 'pending',
      syncRetries: 0,
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
      const metadataStr = localStorage.getItem(this.prefix + key + '_meta');
      return metadataStr ? JSON.parse(metadataStr) as StorageMetadata : null;
    } catch (error) {
      console.error(`Failed to parse metadata for item ${key} from localStorage:`, error);
      return null;
    }
  }

  getAllMetadata(): StorageItemMetadata[] {
    const items: StorageItemMetadata[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.prefix) || key.endsWith('_meta')) continue;
      
      const cleanKey = key.replace(this.prefix, '');
      const metadata = this.getItemMetadata(cleanKey);
      const value = localStorage.getItem(key);
      
      if (metadata && value) {
        items.push({
          key: cleanKey,
          size: value.length * 2, // 2 bytes per character
          ...metadata
        });
      }
    }
    
    return items;
  }

  getItemsByType(dataType: StorageDataType): Array<{ key: string; value: any }> {
    const items: Array<{ key: string; value: any }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.prefix) || key.endsWith('_meta')) continue;
      
      const cleanKey = key.replace(this.prefix, '');
      const metadata = this.getItemMetadata(cleanKey);
      
      if (metadata && metadata.dataType === dataType) {
        const value = this.getItem(cleanKey);
        if (value) {
          items.push({ key: cleanKey, value });
        }
      }
    }
    
    return items;
  }

  getPendingSyncItems(): PendingSyncItem[] {
    const items: PendingSyncItem[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.prefix) || key.endsWith('_meta')) continue;
      
      const cleanKey = key.replace(this.prefix, '');
      const metadata = this.getItemMetadata(cleanKey);
      if (metadata && metadata.needsSync) {
        const value = this.getItem(cleanKey);
        if (value) {
          items.push({
            key: cleanKey,
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
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.lastModified - a.lastModified;
    });
  }

  markAsSynced(key: string): void {
    const metadata = this.getItemMetadata(key);
    
    if (metadata) {
      const updatedMetadata = {
        ...metadata,
        needsSync: false,
        lastSynced: Date.now(),
        syncStatus: 'synced' as const,
      };
      
      localStorage.setItem(this.prefix + key + '_meta', JSON.stringify(updatedMetadata));
    }
  }

  clearAll(): void {
    if (!this.testingMode) {
      console.warn('localStorageManager.clearAll() called in production mode. This is likely a mistake.');
      return;
    }
    localStorage.clear();
  }

  clearAllData(): void {
    this.clearAll();
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
    const itemsByType: Record<StorageDataType, number> = {
      card: 0,
      collection: 0,
      user: 0,
      settings: 0,
      other: 0,
      'studio-state': 0,
      'recovery-data': 0,
      uploads: 0
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key);
      if (value) {
        const size = value.length * 2; // 2 bytes per character
        totalSize += size;
        items.push({ key, size });

        // Count by type
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '');
          const metadata = this.getItemMetadata(cleanKey);
          if (metadata) {
            itemsByType[metadata.dataType]++;
          }
        }
      }
    }

    const sizeInKB = (totalSize / 1024).toFixed(2);
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    const pendingSync = this.getPendingSyncCount();

    return {
      itemCount: localStorage.length,
      totalItems: localStorage.length,
      totalSizeKB: sizeInKB,
      totalSizeMB: sizeInMB,
      items: items.sort((a, b) => b.size - a.size),
      config: this.config,
      pendingSync,
      syncQueue: pendingSync,
      itemsByType,
    };
  }

  getPendingSyncCount(): number {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.prefix) || key.endsWith('_meta')) continue;
      const cleanKey = key.replace(this.prefix, '');
      const metadata = this.getItemMetadata(cleanKey);
      if (metadata && metadata.needsSync) {
        count++;
      }
    }
    return count;
  }
}

export const localStorageManager = new LocalStorageManager();
