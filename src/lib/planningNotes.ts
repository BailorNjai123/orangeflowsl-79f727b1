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

export function buildPlanningNotes(note: string | null | undefined, extended: Record<string, any>): string {
  const text = (note || '').trim();
  const tag = `<<PLANNING_JSON>>${JSON.stringify(extended)}<<END>>`;
  return text ? `${text}\n\n${tag}` : tag;
}
