import { supabase } from '@/integrations/supabase/client';
import { parsePlanningNotes, buildPlanningNotes } from '@/lib/planningNotes';

/**
 * Admin-only: permanently remove a planning Excel submission.
 * Storage file is deleted BEFORE the DB reference is purged.
 */
export async function deleteExcelSubmission(site: { id: string; notes?: string | null }): Promise<{ error: string | null }> {
  const { text, extended } = parsePlanningNotes(site.notes);
  const meta = extended?.excel_submission as { path?: string } | undefined;

  if (meta?.path && !meta.path.startsWith('http')) {
    const { error: storageError } = await supabase.storage.from('site-documents').remove([meta.path]);
    if (storageError) return { error: storageError.message };
  }

  const nextExtended = { ...extended };
  delete nextExtended.excel_submission;

  const { error } = await supabase
    .from('sites')
    .update({ notes: buildPlanningNotes(text, nextExtended) })
    .eq('id', site.id);

  return { error: error?.message ?? null };
}
