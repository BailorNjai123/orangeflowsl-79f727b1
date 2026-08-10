import * as XLSX from 'xlsx';

/**
 * Planning Excel upload — extraction rules.
 *
 * ONLY three categories are extracted from the workbook and propagated
 * downstream (Procurement / Power / Rollout / Admin):
 *   A. Basic Site & Location
 *   B. Governance
 *   C. Classification
 *
 * Everything else in the workbook stays inside the original .xlsx file, which is
 * stored as-is and is only viewable/downloadable from Planning Review.
 */

export type ExcelCategory = 'basic' | 'governance' | 'classification';

interface ExcelFieldDef {
  key: string;
  label: string;
  category: ExcelCategory;
  aliases: string[];
  numeric?: boolean;
  list?: boolean;
}

const norm = (v: any) =>
  String(v ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const EXCEL_FIELDS: ExcelFieldDef[] = [
  // A. Basic Site & Location
  { key: 'site_id_code', label: 'Site ID', category: 'basic', aliases: ['site id', 'site id code', 'siteid', 'site code', 'site number'] },
  { key: 'site_name', label: 'Site Name', category: 'basic', aliases: ['site name', 'name of site', 'sitename'] },
  { key: 'region', label: 'Region', category: 'basic', aliases: ['region'] },
  { key: 'district', label: 'District', category: 'basic', aliases: ['district'] },
  { key: 'chiefdom', label: 'Chiefdom', category: 'basic', aliases: ['chiefdom'] },
  { key: 'town', label: 'Town / City / Location', category: 'basic', aliases: ['town', 'city', 'location', 'town city location', 'village'] },
  { key: 'latitude', label: 'Latitude', category: 'basic', aliases: ['latitude', 'lat', 'gps latitude'], numeric: true },
  { key: 'longitude', label: 'Longitude', category: 'basic', aliases: ['longitude', 'long', 'lon', 'lng', 'gps longitude'], numeric: true },
  { key: 'elevation', label: 'Elevation (m)', category: 'basic', aliases: ['elevation', 'altitude', 'elevation m'], numeric: true },
  { key: 'dimensions', label: 'Dimensions (m)', category: 'basic', aliases: ['dimensions', 'dimension', 'site dimensions', 'plot size', 'land size'] },
  { key: 'distance_nearest_bts', label: 'Distance from Nearest BTS (km)', category: 'basic', aliases: ['distance from nearest bts', 'distance nearest bts', 'distance to nearest bts', 'nearest bts distance'], numeric: true },
  { key: 'location_updated', label: 'Location Updated', category: 'basic', aliases: ['location updated', 'date location updated'] },

  // B. Governance
  { key: 'owner_sharing_status', label: 'Owner / Site Sharing Status', category: 'governance', aliases: ['owner site sharing status', 'owner sharing status', 'ownership status', 'site sharing status', 'owner'] },
  { key: 'site_classification', label: 'Site Classification', category: 'governance', aliases: ['site classification', 'classification'] },
  { key: 'natca_classification', label: 'NAtCa Sites Classification', category: 'governance', aliases: ['natca sites classification', 'natca classification', 'natca'] },

  // C. Classification
  { key: 'site_type', label: 'Site Type', category: 'classification', aliases: ['site type', 'type of site'] },
  { key: 'technology_classification', label: 'Technology Classification', category: 'classification', aliases: ['technology classification', 'technology', 'technologies', 'tech'], list: true },
];

const FIELD_BY_ALIAS = new Map<string, ExcelFieldDef>();
EXCEL_FIELDS.forEach(f => {
  FIELD_BY_ALIAS.set(norm(f.label), f);
  f.aliases.forEach(a => FIELD_BY_ALIAS.set(norm(a), f));
});

export interface ExtractedPlanning {
  values: Record<string, any>;
  matchedLabels: string[];
  sheetNames: string[];
}

export interface ExcelValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

function coerce(field: ExcelFieldDef, raw: any): any {
  if (raw === null || raw === undefined) return undefined;
  let value: any = typeof raw === 'string' ? raw.trim() : raw;
  if (value === '' || norm(value) === 'n a' || norm(value) === 'na') return undefined;
  if (field.numeric) {
    const num = Number(String(value).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(num) ? num : undefined;
  }
  if (field.list) {
    const parts = String(value)
      .split(/[,/;|+&]+/)
      .map(p => p.trim().toUpperCase())
      .filter(Boolean);
    return parts.length ? parts : undefined;
  }
  return String(value);
}

/** Reads every sheet and pulls out only the permitted fields. */
export function extractPlanningFromWorkbook(wb: XLSX.WorkBook): ExtractedPlanning {
  const values: Record<string, any> = {};
  const matched = new Set<string>();

  const put = (field: ExcelFieldDef, raw: any) => {
    if (values[field.key] !== undefined) return;
    const v = coerce(field, raw);
    if (v === undefined) return;
    values[field.key] = v;
    matched.add(field.label);
  };

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false });
    if (!rows.length) continue;

    // Layout 1 — header row + data row(s)
    for (let r = 0; r < Math.min(rows.length, 15); r++) {
      const header = rows[r] || [];
      const hits = header.filter(c => FIELD_BY_ALIAS.has(norm(c))).length;
      if (hits < 3) continue;
      const dataRow = rows.slice(r + 1).find(row => row.some(c => c !== null && String(c).trim() !== ''));
      if (!dataRow) continue;
      header.forEach((cell, i) => {
        const field = FIELD_BY_ALIAS.get(norm(cell));
        if (field) put(field, dataRow[i]);
      });
      break;
    }

    // Layout 2 — vertical key/value pairs
    rows.forEach(row => {
      if (!row) return;
      for (let c = 0; c < row.length - 1; c++) {
        const field = FIELD_BY_ALIAS.get(norm(row[c]));
        if (!field) continue;
        const next = row.slice(c + 1).find(v => v !== null && String(v).trim() !== '');
        if (next !== undefined) put(field, next);
      }
    });
  }

  return { values, matchedLabels: [...matched], sheetNames: wb.SheetNames };
}

export function validateExtracted(extracted: ExtractedPlanning): ExcelValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const v = extracted.values;

  if (!v.site_id_code) errors.push('Site ID could not be identified in the workbook.');
  if (!v.site_name) errors.push('Site Name is missing.');
  if (v.latitude === undefined || v.longitude === undefined) errors.push('Latitude and Longitude are required.');
  if (!v.region && !v.district && !v.town) errors.push('At least one location field (Region, District or Town) is required.');

  const governance = ['owner_sharing_status', 'site_classification', 'natca_classification'].filter(k => v[k]);
  if (!governance.length) errors.push('No Governance information found (Owner/Sharing Status, Site Classification or NAtCa Classification).');

  const classification = ['site_type', 'technology_classification'].filter(k => v[k]);
  if (!classification.length) errors.push('No Classification information found (Site Type or Technology Classification).');

  EXCEL_FIELDS.filter(f => f.category === 'basic').forEach(f => {
    if (v[f.key] === undefined) warnings.push(f.label);
  });

  return { ok: errors.length === 0, errors, warnings };
}

export async function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  const buf = await file.arrayBuffer();
  return XLSX.read(buf, { type: 'array' });
}

export interface SheetPreview { name: string; rows: any[][] }

/** Full contents of every worksheet — used by the Planning Review viewer. */
export function workbookToSheets(wb: XLSX.WorkBook): SheetPreview[] {
  return wb.SheetNames.map(name => ({
    name,
    rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', blankrows: false }) as any[][],
  }));
}
