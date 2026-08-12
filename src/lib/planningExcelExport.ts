import * as XLSX from 'xlsx';
import { PLANNING_FIELD_GROUPS, formatPlanningValue } from './planningFieldLabels';
import { parsePlanningNotes } from './planningNotes';

/**
 * Builds a Planning-only Excel export for a single site.
 *
 * Data sources: the native `sites` columns plus the extended planning payload
 * stored in the notes JSON tag. No Power / Procurement / Rollout / review data
 * and no raw JSON ever reaches the workbook.
 */

const TECH_SHEETS = ['2G Radio Network', '3G Radio Network', '4G LTE Radio Network', '5G NR Radio Network'] as const;
const SHEET_NAME: Record<string, string> = {
  '2G Radio Network': '2G',
  '3G Radio Network': '3G',
  '4G LTE Radio Network': '4G',
  '5G NR Radio Network': '5G',
};

const cell = (v: any): string | number => {
  if (typeof v === 'number') return v;
  const s = formatPlanningValue(v);
  return s === null ? '' : s;
};

export function buildPlanningValues(site: any): Record<string, any> {
  const extended = parsePlanningNotes(site?.notes).extended || {};
  const merged: Record<string, any> = { ...extended };
  Object.entries(site || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') return;
    if (k === 'notes' || k === 'review_notes') return;
    merged[k] = v;
  });
  return merged;
}

export function buildPlanningWorkbook(site: any): XLSX.WorkBook {
  const values = buildPlanningValues(site);
  const wb = XLSX.utils.book_new();

  // Sheet 1 — general site details (vertical key/value, easy to read)
  const detailRows: any[][] = [['Planning Data Export'], ['Site ID', site.site_id_code || ''], ['Site Name', site.site_name || ''], []];
  PLANNING_FIELD_GROUPS.filter(g => !TECH_SHEETS.includes(g.title as any)).forEach(group => {
    detailRows.push([group.title]);
    group.fields.forEach(f => {
      if (/legacy/i.test(f.label) && values[f.key] === undefined) return;
      detailRows.push([f.label, cell(values[f.key])]);
    });
    detailRows.push([]);
  });
  const notesText = parsePlanningNotes(site?.notes).text;
  if (notesText) {
    detailRows.push(['Additional Notes / Remarks'], [notesText]);
  }
  const detailSheet = XLSX.utils.aoa_to_sheet(detailRows);
  detailSheet['!cols'] = [{ wch: 42 }, { wch: 44 }];
  XLSX.utils.book_append_sheet(wb, detailSheet, 'Site Details');

  // Technology sheets — one column per parameter, one data row for the site
  TECH_SHEETS.forEach(title => {
    const group = PLANNING_FIELD_GROUPS.find(g => g.title === title);
    if (!group) return;
    const fields = group.fields.filter(f => !/legacy/i.test(f.label) || values[f.key] !== undefined);
    const header = ['Site ID', 'Site Name', ...fields.map(f => f.label)];
    const row = [site.site_id_code || '', site.site_name || '', ...fields.map(f => cell(values[f.key]))];
    const ws = XLSX.utils.aoa_to_sheet([header, row]);
    ws['!cols'] = header.map(h => ({ wch: Math.max(12, Math.min(34, String(h).length + 4)) }));
    XLSX.utils.book_append_sheet(wb, ws, SHEET_NAME[title]);
  });

  return wb;
}

export function planningExcelFilename(site: any): string {
  const safe = (v: string) => String(v || '').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  return `${safe(site.site_id_code) || 'site'}_${safe(site.site_name) || 'planning'}_Planning.xlsx`;
}

/** Generates and downloads the workbook locally — no network, offline-safe, read-only. */
export function downloadPlanningExcel(site: any) {
  const wb = buildPlanningWorkbook(site);
  XLSX.writeFile(wb, planningExcelFilename(site));
}
