import { supabase } from '@/integrations/supabase/client';

/**
 * Extracts the storage path from a value that could be:
 * - A plain storage path (e.g. "userId/filename.pdf")
 * - A full signed URL containing the path
 * - null/undefined/empty
 */
export function extractStoragePath(value: string | null | undefined, bucket: string): string | null {
  if (!value || value.trim() === '') return null;
  
  // If it's a full Supabase signed URL, extract the path
  if (value.includes('supabase.co/storage/')) {
    try {
      const url = new URL(value);
      // Path format: /storage/v1/object/sign/{bucket}/{actual_path}
      const pathParts = url.pathname.split(`/${bucket}/`);
      if (pathParts.length > 1) {
        return decodeURIComponent(pathParts[1]);
      }
    } catch {
      // If URL parsing fails, return null
    }
    return null;
  }
  
  // It's already a storage path
  return value;
}

/**
 * Gets a fresh signed URL for a storage path
 */
export async function getSignedUrl(bucket: string, path: string | null | undefined): Promise<string | null> {
  const storagePath = extractStoragePath(path, bucket);
  if (!storagePath) return null;
  
  const { data } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 3600);
  return data?.signedUrl ?? null;
}
