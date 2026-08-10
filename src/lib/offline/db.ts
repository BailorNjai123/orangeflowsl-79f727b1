import { createStore, get, set, del, values } from 'idb-keyval';

/**
 * Persistent offline stores (IndexedDB).
 * - outbox : queued submissions waiting to reach the central database
 * - files  : the actual binary attachments captured while offline
 */
export const outboxStore = createStore('orangeflow-offline', 'outbox');
export const fileStore = createStore('orangeflow-offline', 'files');

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';

export interface PendingFile {
  id: string;
  bucket: string;
  path: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  uploaded: boolean;
  createdAt: number;
}

export interface OutboxRecord {
  /** unique local record id */
  id: string;
  /** submission type, e.g. planning_form, planning_excel, procurement_form, power_form, rollout_form */
  type: string;
  label: string;
  /** business Site ID (site_id_code) — preserved across all domains */
  siteIdCode: string | null;
  /** database row id when the site already exists centrally */
  siteRowId: string | null;
  userId: string | null;
  role: string | null;
  createdAt: number;
  updatedAt: number;
  status: SyncStatus;
  attempts: number;
  error: string | null;
  table: string;
  operation: 'insert' | 'update' | 'upsert';
  /** how to locate the target row on sync (prevents duplicates) */
  match: { column: string; value: string } | null;
  payload: Record<string, any>;
  fileIds: string[];
  /** snapshot of the row's updated_at when the edit began — used for conflict detection */
  baseUpdatedAt: string | null;
  /** best-effort records (activity log, notifications) are dropped after repeated failure */
  bestEffort: boolean;
}

const CHANGE_EVENT = 'orangeflow-offline-changed';

export function notifyOfflineChange() {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function onOfflineChange(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
}

export async function putRecord(rec: OutboxRecord) {
  await set(rec.id, rec, outboxStore);
  notifyOfflineChange();
}

export async function deleteRecord(id: string) {
  const rec = await get<OutboxRecord>(id, outboxStore);
  if (rec) for (const fid of rec.fileIds) await del(fid, fileStore);
  await del(id, outboxStore);
  notifyOfflineChange();
}

export async function listRecords(): Promise<OutboxRecord[]> {
  const all = (await values<OutboxRecord>(outboxStore)) || [];
  return all.filter(Boolean).sort((a, b) => a.createdAt - b.createdAt);
}

export async function putFile(file: PendingFile) {
  await set(file.id, file, fileStore);
}

export async function getFile(id: string) {
  return get<PendingFile>(id, fileStore);
}

export async function markFileUploaded(id: string) {
  const f = await get<PendingFile>(id, fileStore);
  if (f) await set(id, { ...f, uploaded: true }, fileStore);
}

export function newId(prefix: string) {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${rand}`;
}

/** Ask the browser to keep our offline data even under storage pressure. */
export async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    /* ignore */
  }
}
