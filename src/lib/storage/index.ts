
// Unified storage system exports
export { UnifiedRepository } from './UnifiedRepository';
export { cardRepository } from './repositories/CardRepository';
export { collectionRepository } from './repositories/CollectionRepository';
export { syncManager } from './SyncManager';
export { useRepository } from '../../hooks/useRepository';

// Legacy exports for backward compatibility
export { localStorageManager } from './LocalStorageManager';
export { useUnifiedStorage } from '../../hooks/useUnifiedStorage';

// Types
export type { BaseEntity } from './UnifiedRepository';
export type { Card } from './repositories/CardRepository';
export type { Collection } from './repositories/CollectionRepository';
export type { SyncStatus } from './SyncManager';
