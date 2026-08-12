// Planning submissions store extended parameters inside the `notes` column using a
// machine tag. Human-facing views must never render that tag.
const TAG_RE = /<<PLANNING_JSON>>([\s\S]*?)<<END>>/;

export function parsePlanningNotes(raw: string | null | undefined): {
  text: string;
  extended: Record<string, any>;
} {
  const value = raw || '';
  const m = value.match(TAG_RE);
  let extended: Record<string, any> = {};
  if (m) {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed && typeof parsed === 'object') extended = parsed;
    } catch { /* ignore malformed */ }
  }
  const text = value.replace(TAG_RE, '').trim();
  return { text, extended };
}

/** Plain, human-readable note text with the machine tag stripped out. */
export function cleanNote(raw: string | null | undefined): string {
  return parsePlanningNotes(raw).text;
}

/**
 * `sites.review_notes` may hold either a plain reviewer comment or a serialized
 * multi-domain workflow object. Never render it raw — extract only the Planning
 * review information meant for the submitter.
 */
export function parseReviewNotes(raw: string | null | undefined): {
  note: string | null;
  reviewer: string | null;
  reviewedAt: string | null;
} {
  const value = (raw || '').trim();
  if (!value) return { note: null, reviewer: null, reviewedAt: null };
  if (!value.startsWith('{')) return { note: value, reviewer: null, reviewedAt: null };
  try {
    const obj = JSON.parse(value);
    const admin = (obj && typeof obj === 'object' ? obj.admin : null) || {};
    const planning = (admin && typeof admin.planning === 'object' ? admin.planning : null) || {};
    const note = admin.planning_notes || planning.notes || null;
    return {
      note: typeof note === 'string' && note.trim() ? note.trim() : null,
      reviewer: typeof planning.reviewed_by === 'string' ? planning.reviewed_by : null,
      reviewedAt: typeof planning.reviewed_at === 'string' ? planning.reviewed_at : null,
    };
  } catch {
    return { note: null, reviewer: null, reviewedAt: null };
  }
}

export function buildPlanningNotes(note: string | null | undefined, extended: Record<string, any>): string {
  const text = (note || '').trim();
  const tag = `<<PLANNING_JSON>>${JSON.stringify(extended)}<<END>>`;
  return text ? `${text}\n\n${tag}` : tag;
}
