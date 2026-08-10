import { supabase } from '@/integrations/supabase/client';
import {
  OutboxRecord,
  PendingFile,
  deleteRecord,
  getFile,
  listRecords,
  markFileUploaded,
  newId,
  notifyOfflineChange,
  putFile,
  putRecord,
  requestPersistentStorage,
} from './db';

export type { OutboxRecord } from './db';

export function isOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function isNetworkError(err: any): boolean {
  if (!isOnline()) return true;
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed') ||
    msg.includes('network request failed') ||
    msg.includes('err_internet_disconnected') ||
    msg.includes('fetch failed')
  );
}

/* ------------------------------------------------------------------ */
/* File capture                                                        */
/* ------------------------------------------------------------------ */

let pendingFileIds: string[] = [];

function drainPendingFileIds() {
  const out = pendingFileIds;
  pendingFileIds = [];
  return out;
}

/**
 * Upload a file to Supabase Storage, or persist it in IndexedDB when offline.
 * The storage `path` is decided by the caller, so the payload written to the
 * database is identical whether the submission happened online or offline.
 */
export async function offlineUpload(
  bucket: string,
  path: string,
  file: File | Blob,
): Promise<{ error: { message: string } | null; queued: boolean }> {
  if (isOnline()) {
    try {
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (!error) return { error: null, queued: false };
      if (!isNetworkError(error)) return { error, queued: false };
    } catch (e: any) {
      if (!isNetworkError(e)) return { error: { message: e?.message || String(e) }, queued: false };
    }
  }
  await requestPersistentStorage();
  const id = newId('file');
  const entry: PendingFile = {
    id,
    bucket,
    path,
    name: (file as File).name || path.split('/').pop() || 'file',
    type: file.type || 'application/octet-stream',
    size: file.size,
    blob: file,
    uploaded: false,
    createdAt: Date.now(),
  };
  await putFile(entry);
  pendingFileIds.push(id);
  notifyOfflineChange();
  return { error: null, queued: true };
}

/* ------------------------------------------------------------------ */
/* Database writes                                                     */
/* ------------------------------------------------------------------ */

export interface WriteSpec {
  type: string;
  label: string;
  table: string;
  operation: 'insert' | 'update' | 'upsert';
  payload: Record<string, any>;
  /** locates the target row on sync — keeps Site ID relationships intact */
  match?: { column: string; value: string } | null;
  siteIdCode?: string | null;
  siteRowId?: string | null;
  userId?: string | null;
  role?: string | null;
  /** row.updated_at at the time the user started editing (conflict detection) */
  baseUpdatedAt?: string | null;
  /** notifications / audit trail — safe to drop after repeated failures */
  bestEffort?: boolean;
}

async function runWrite(spec: WriteSpec): Promise<{ error: { message: string } | null; conflict?: boolean }> {
  const table = supabase.from(spec.table as any);
  if (spec.match) {
    const { data: existing, error: selErr } = await supabase
      .from(spec.table as any)
      .select('id, updated_at')
      .eq(spec.match.column, spec.match.value)
      .maybeSingle();
    if (selErr && isNetworkError(selErr)) throw selErr;

    if (existing) {
      const remoteUpdated = (existing as any).updated_at ?? null;
      if (spec.baseUpdatedAt && remoteUpdated && remoteUpdated !== spec.baseUpdatedAt) {
        return { error: { message: 'Record changed by another user while offline.' }, conflict: true };
      }
      const { id: _omit, ...rest } = spec.payload;
      const { error } = await supabase
        .from(spec.table as any)
        .update(rest as any)
        .eq('id', (existing as any).id);
      return { error: error ? { message: error.message } : null };
    }
    const { error } = await supabase
      .from(spec.table as any)
      .insert({ ...spec.payload, [spec.match.column]: spec.match.value } as any);
    return { error: error ? { message: error.message } : null };
  }

  if (spec.operation === 'insert') {
    const { error } = await table.insert(spec.payload as any);
    return { error: error ? { message: error.message } : null };
  }
  const { error } = await table.upsert(spec.payload as any);
  return { error: error ? { message: error.message } : null };
}

/**
 * Persist a submission. Goes straight to the central database when online;
 * otherwise it is stored locally and marked "Pending Sync".
 */
export async function offlineWrite(
  spec: WriteSpec,
): Promise<{ error: { message: string } | null; queued: boolean; conflict?: boolean }> {
  const fileIds = drainPendingFileIds();

  if (isOnline() && fileIds.length === 0) {
    try {
      const res = await runWrite(spec);
      if (!res.error) return { error: null, queued: false };
      if (res.conflict) return { ...res, queued: false };
      if (!isNetworkError(res.error)) return { error: res.error, queued: false };
    } catch (e: any) {
      if (!isNetworkError(e)) return { error: { message: e?.message || String(e) }, queued: false };
    }
  }

  await requestPersistentStorage();
  const now = Date.now();
  const rec: OutboxRecord = {
    id: newId('rec'),
    type: spec.type,
    label: spec.label,
    siteIdCode: spec.siteIdCode ?? null,
    siteRowId: spec.siteRowId ?? null,
    userId: spec.userId ?? null,
    role: spec.role ?? null,
    createdAt: now,
    updatedAt: now,
    status: 'pending',
    attempts: 0,
    error: null,
    table: spec.table,
    operation: spec.operation,
    match: spec.match ?? null,
    payload: spec.payload,
    fileIds,
    baseUpdatedAt: spec.baseUpdatedAt ?? null,
    bestEffort: !!spec.bestEffort,
  };
  await putRecord(rec);
  // If we are actually online (e.g. queued only because files were captured
  // offline earlier), try to flush immediately.
  if (isOnline()) void processOutbox();
  return { error: null, queued: true };
}

/** Fire-and-forget writes (activity log). Never blocks the user. */
export async function bestEffortWrite(spec: Omit<WriteSpec, 'bestEffort'>) {
  try {
    await offlineWrite({ ...spec, bestEffort: true });
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Synchronisation                                                     */
/* ------------------------------------------------------------------ */

let syncing = false;

export async function processOutbox(): Promise<{ synced: number; failed: number; conflicts: number }> {
  if (syncing || !isOnline()) return { synced: 0, failed: 0, conflicts: 0 };
  syncing = true;
  let synced = 0;
  let failed = 0;
  let conflicts = 0;
  try {
    const records = await listRecords();
    for (const rec of records) {
      if (rec.status === 'conflict' || rec.status === 'synced') continue;
      await putRecord({ ...rec, status: 'syncing', updatedAt: Date.now() });

      try {
        // 1. Upload every attachment first so the stored paths resolve.
        for (const fid of rec.fileIds) {
          const f = await getFile(fid);
          if (!f || f.uploaded) continue;
          const { error } = await supabase.storage
            .from(f.bucket)
            .upload(f.path, f.blob, { upsert: true, contentType: f.type });
          if (error && !String(error.message).includes('already exists')) throw error;
          await markFileUploaded(fid);
        }

        // 2. Write the record itself.
        const res = await runWrite(rec);
        if (res.conflict) {
          conflicts++;
          await putRecord({ ...rec, status: 'conflict', error: res.error?.message || 'Conflict', updatedAt: Date.now() });
          continue;
        }
        if (res.error) throw new Error(res.error.message);

        synced++;
        await deleteRecord(rec.id);
      } catch (e: any) {
        if (isNetworkError(e)) {
          await putRecord({ ...rec, status: 'pending', updatedAt: Date.now() });
          break; // connection dropped again — stop and retry later
        }
        const attempts = rec.attempts + 1;
        failed++;
        if (rec.bestEffort && attempts >= 3) {
          await deleteRecord(rec.id);
        } else {
          await putRecord({
            ...rec,
            status: 'failed',
            attempts,
            error: e?.message || String(e),
            updatedAt: Date.now(),
          });
        }
      }
    }
  } finally {
    syncing = false;
    notifyOfflineChange();
  }
  return { synced, failed, conflicts };
}

/** Retry a failed record on demand. */
export async function retryRecord(id: string) {
  const records = await listRecords();
  const rec = records.find(r => r.id === id);
  if (!rec) return;
  await putRecord({ ...rec, status: 'pending', error: null, updatedAt: Date.now() });
  await processOutbox();
}

/** Conflict resolution — apply the local copy anyway, or discard it. */
export async function resolveConflict(id: string, action: 'apply' | 'discard') {
  const records = await listRecords();
  const rec = records.find(r => r.id === id);
  if (!rec) return;
  if (action === 'discard') {
    await deleteRecord(rec.id);
    return;
  }
  await putRecord({ ...rec, status: 'pending', baseUpdatedAt: null, error: null, updatedAt: Date.now() });
  await processOutbox();
}

export async function outboxStats() {
  const records = await listRecords();
  return {
    total: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    syncing: records.filter(r => r.status === 'syncing').length,
    failed: records.filter(r => r.status === 'failed').length,
    conflicts: records.filter(r => r.status === 'conflict').length,
    records,
  };
}
