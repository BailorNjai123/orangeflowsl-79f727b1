import * as XLSX from 'xlsx';
import { PLANNING_FIELD_GROUPS, formatPlanningValue } from './planningFieldLabels';
import { parsePlanningNotes } from './planningNotes';

/**
 * Builds a Planning-only Excel export for a single site.
 *
 * Layout: every sheet is horizontal — a merged title row, a bold parameter
 * header row, and one value row underneath.
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

const BORDER = { style: 'thin', color: { rgb: 'FFB0B0B0' } };

function styleSheet(ws: XLSX.WorkSheet, headerRow: number) {
  const range = XLSX.utils.decode_range(ws['!ref'] as string);
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      const target = ws[ref] || (ws[ref] = { t: 's', v: '' });
      const isTitle = r === 0;
      const isHeader = r === headerRow;
      target.s = {
        font: { name: 'Arial', sz: isTitle ? 13 : 10, bold: isTitle || isHeader },
        alignment: { wrapText: true, vertical: 'center', horizontal: isTitle ? 'center' : 'left' },
        border: isTitle ? undefined : { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
        fill: isHeader ? { patternType: 'solid', fgColor: { rgb: 'FFF2F2F2' } } : undefined,
      };
    }
  }
}

/** One horizontal sheet: merged title, header row, single value row. */
function horizontalSheet(title: string, headers: string[], values: (string | number)[]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet([[title], headers, values]);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(headers.length - 1, 0) } }];
  ws['!cols'] = headers.map((h, i) => {
    const valueLen = String(values[i] ?? '').length;
    return { wch: Math.max(14, Math.min(40, Math.max(String(h).length, valueLen) + 4)) };
  });
  ws['!rows'] = [{ hpt: 22 }, { hpt: 34 }, { hpt: 30 }];
  ws['!freeze'] = { xSplit: '0', ySplit: '2', topLeftCell: 'A3' } as any;
  styleSheet(ws, 1);
  return ws;
}

export function buildPlanningWorkbook(site: any): XLSX.WorkBook {
  const values = buildPlanningValues(site);
  const wb = XLSX.utils.book_new();
  const notesText = parsePlanningNotes(site?.notes).text;

  // Sheet 1 — Site Information: every non-technology parameter in one horizontal table
  const headers: string[] = ['Site ID', 'Site Name'];
  const row: (string | number)[] = [site?.site_id_code || '', site?.site_name || ''];
  PLANNING_FIELD_GROUPS.filter(g => !TECH_SHEETS.includes(g.title as any)).forEach(group => {
    group.fields.forEach(f => {
      if (/legacy/i.test(f.label) && values[f.key] === undefined) return;
      headers.push(f.label);
      row.push(cell(values[f.key]));
    });
  });
  headers.push('Additional Notes / Remarks');
  row.push(notesText || '');
  XLSX.utils.book_append_sheet(wb, horizontalSheet('Planning Data Export', headers, row), 'Site Information');

  // Technology sheets — one column per parameter, one data row for the site
  TECH_SHEETS.forEach(title => {
    const group = PLANNING_FIELD_GROUPS.find(g => g.title === title);
    if (!group) return;
    const fields = group.fields.filter(f => !/legacy/i.test(f.label) || values[f.key] !== undefined);
    const applicable = fields.some(f => cell(values[f.key]) !== '');
    const techHeaders = ['Site ID', 'Site Name', ...fields.map(f => f.label)];
    const techRow: (string | number)[] = [
      site?.site_id_code || '',
      site?.site_name || '',
      ...fields.map(f => (applicable ? cell(values[f.key]) : 'N/A')),
    ];
    XLSX.utils.book_append_sheet(wb, horizontalSheet(`${title} — Planning Data Export`, techHeaders, techRow), SHEET_NAME[title]);
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
  XLSX.writeFile(wb, planningExcelFilename(site), { cellStyles: true } as any);
}
