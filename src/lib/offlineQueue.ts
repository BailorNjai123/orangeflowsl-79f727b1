import { get, set, del, keys } from 'idb-keyval';
import { supabase } from '@/integrations/supabase/client';

interface QueuedAction {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'upsert';
  data: Record<string, unknown>;
  timestamp: number;
}

const QUEUE_PREFIX = 'offline_queue_';

export async function queueAction(action: Omit<QueuedAction, 'id' | 'timestamp'>) {
  const entry: QueuedAction = {
    ...action,
    id: `${QUEUE_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  };
  await set(entry.id, entry);
  return entry.id;
}

export async function processQueue(): Promise<{ processed: number; failed: number }> {
  const allKeys = await keys();
  const queueKeys = allKeys.filter(k => String(k).startsWith(QUEUE_PREFIX));
  
  if (queueKeys.length === 0) return { processed: 0, failed: 0 };

  // Sort by timestamp (oldest first)
  const entries: QueuedAction[] = [];
  for (const key of queueKeys) {
    const val = await get<QueuedAction>(key);
    if (val) entries.push(val);
  }
  entries.sort((a, b) => a.timestamp - b.timestamp);

  let processed = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      let result: { error: unknown } | undefined;
      const table = supabase.from(entry.table as any);
      if (entry.operation === 'insert') {
        result = await table.insert(entry.data as any);
      } else if (entry.operation === 'update') {
        const { id, ...rest } = entry.data;
        result = await table.update(rest as any).eq('id', id as string);
      } else if (entry.operation === 'upsert') {
        result = await table.upsert(entry.data as any);
      }

      if (result?.error) {
        console.error('[OfflineSync] Failed to sync:', entry, result.error);
        failed++;
      } else {
        await del(entry.id);
        processed++;
      }
    } catch (err) {
      console.error('[OfflineSync] Error processing:', entry, err);
      failed++;
    }
  }

  return { processed, failed };
}

export async function getQueueSize(): Promise<number> {
  const allKeys = await keys();
  return allKeys.filter(k => String(k).startsWith(QUEUE_PREFIX)).length;
}
