
import { useState, useEffect } from 'react';
import { syncManager, SyncStatus } from '@/lib/storage/SyncManager';

export const useSyncStatus = () => {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    const unsubscribe = syncManager.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const sync = () => {
    syncManager.syncAll();
  };

  const forceSyncItem = (key: string) => {
    return syncManager.forceSyncItem(key);
  };

  return {
    ...status,
    sync,
    forceSyncItem
  };
};
