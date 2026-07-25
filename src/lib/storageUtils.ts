import { supabase } from '@/integrations/supabase/client';

/**
 * Extracts the storage path from a value that could be:
 * - A plain storage path (e.g. "userId/filename.pdf")
 * - A full signed URL containing the path
 * - null/undefined/empty
 */
export function extractStoragePath(value: string | null | undefined, bucket: string): string | null {
  if (!value || value.trim() === '') return null;

  if (value.includes('supabase.co/storage/')) {
    try {
      const url = new URL(value);
      const pathParts = url.pathname.split(`/${bucket}/`);
      if (pathParts.length > 1) {
        return decodeURIComponent(pathParts[1]);
      }
    } catch {
      // ignore
    }
    return null;
  }

  return value;
}

/**
 * Gets a fresh signed URL for a storage path.
 * NOTE: Prefer downloadAsBlob / openFileInNewTab for viewing to avoid
 * ERR_BLOCKED_BY_CLIENT from privacy extensions blocking *.supabase.co.
 */
export async function getSignedUrl(bucket: string, path: string | null | undefined): Promise<string | null> {
  const storagePath = extractStoragePath(path, bucket);
  if (!storagePath) return null;

  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 3600);
    if (error) {
      if (import.meta.env.DEV) console.error('[Storage] Failed to create signed URL:', error.message, 'path:', storagePath);
      return null;
    }
    return data?.signedUrl ?? null;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[Storage] Error creating signed URL:', err);
    return null;
  }
}

/**
 * Download a file via the Supabase SDK and return a same-origin blob:// URL.
 * Bypasses browser/extension blocking of raw supabase.co URLs.
 * Caller is responsible for revoking the returned URL when done.
 */
export async function fetchAsObjectUrl(
  bucket: string,
  path: string | null | undefined,
): Promise<{ url: string; blob: Blob; filename: string } | null> {
  const storagePath = extractStoragePath(path, bucket);
  if (!storagePath) return null;
  try {
    const { data, error } = await supabase.storage.from(bucket).download(storagePath);
    if (error || !data) {
      if (import.meta.env.DEV) console.error('[Storage] Download failed:', error?.message, 'path:', storagePath);
      return null;
    }
    const url = URL.createObjectURL(data);
    const filename = storagePath.split('/').pop() || 'document';
    return { url, blob: data, filename };
  } catch (err) {
    if (import.meta.env.DEV) console.error('[Storage] Download exception:', err);
    return null;
  }
}

/**
 * Fetch the file via the SDK and open it in a new tab as a same-origin blob URL.
 * Falls back to a signed URL if blob download is unavailable.
 */
export async function openFileInNewTab(bucket: string, path: string | null | undefined): Promise<boolean> {
  const result = await fetchAsObjectUrl(bucket, path);
  if (result) {
    const win = window.open(result.url, '_blank', 'noopener,noreferrer');
    // Revoke after a delay so the new tab has time to load the blob.
    setTimeout(() => URL.revokeObjectURL(result.url), 60_000);
    if (!win) {
      // Popup blocked — trigger a download instead so the user still gets the file.
      triggerBlobDownload(result.blob, result.filename);
    }
    return true;
  }
  const signed = await getSignedUrl(bucket, path);
  if (signed) {
    window.open(signed, '_blank', 'noopener,noreferrer');
    return true;
  }
  return false;
}

/**
 * Fetch via the SDK and trigger a local download (no external navigation).
 */
export async function downloadFile(
  bucket: string,
  path: string | null | undefined,
  filename?: string,
): Promise<boolean> {
  const result = await fetchAsObjectUrl(bucket, path);
  if (!result) return false;
  triggerBlobDownload(result.blob, filename || result.filename);
  URL.revokeObjectURL(result.url);
  return true;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
