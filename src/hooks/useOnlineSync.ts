import { useEffect, useRef } from 'react';
import { processQueue, getQueueSize } from '@/lib/offlineQueue';
import { processOutbox } from '@/lib/offline/outbox';
import { requestPersistentStorage } from '@/lib/offline/db';
import { useToast } from '@/hooks/use-toast';

export function useOnlineSync() {
  const { toast } = useToast();
  const syncing = useRef(false);

  const sync = async () => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      // New offline-first outbox (forms + attachments)
      const out = await processOutbox();
      if (out.synced > 0) {
        toast({ title: 'Offline data synchronised', description: `${out.synced} submission(s) sent to the central database.` });
      }
      if (out.conflicts > 0) {
        toast({ variant: 'destructive', title: 'Sync conflict', description: `${out.conflicts} record(s) changed by another user — review them in the sync panel.` });
      }
      if (out.failed > 0) {
        toast({ variant: 'destructive', title: 'Sync issues', description: `${out.failed} submission(s) failed. They will be retried.` });
      }

      // Legacy queue
      const size = await getQueueSize();
      if (size === 0) return;
      const { processed, failed } = await processQueue();
      if (processed > 0) {
        toast({ title: 'Data synced', description: `${processed} item(s) synced successfully.` });
      }
      if (failed > 0) {
        toast({ variant: 'destructive', title: 'Sync issues', description: `${failed} item(s) failed to sync. Will retry.` });
      }
    } catch (e) {
      if (import.meta.env.DEV) console.error('[OnlineSync] error:', e);
    } finally {
      syncing.current = false;
    }
  };

  useEffect(() => {
    requestPersistentStorage();
    // Sync on mount if online
    if (navigator.onLine) sync();

    const handleOnline = () => {
      toast({ title: 'Back online', description: 'Syncing queued data...' });
      sync();
    };

    window.addEventListener('online', handleOnline);
    // Periodic sync every 30 seconds
    const interval = setInterval(() => {
      if (navigator.onLine) sync();
    }, 30_000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, []);
}
