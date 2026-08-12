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

export type ExcelCategory = 'basic' | 'governance' | 'classification' | 'radio';

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

  // D. Radio network (2G / 3G / 4G / 5G worksheets) — one column per parameter
  { key: '2g_bsc_name', label: '2G NE Name / BSC Name', category: 'radio', aliases: ['2g ne name bsc name', '2g bsc name', 'bsc name', 'ne name'] },
  { key: '2g_bts_id', label: '2G BTS ID', category: 'radio', aliases: ['2g bts id', 'bts id'] },
  { key: '2g_cell_name', label: '2G Cell Name', category: 'radio', aliases: ['2g cell name'] },
  { key: '2g_cell_id', label: '2G Cell ID', category: 'radio', aliases: ['2g cell id'] },
  { key: '2g_cell_type', label: '2G Cell Type', category: 'radio', aliases: ['2g cell type'] },
  { key: '2g_freq_band', label: '2G Frequency Band', category: 'radio', aliases: ['2g frequency band', '2g freq band'] },
  { key: 'g900_trx', label: 'G900 TRX Number', category: 'radio', aliases: ['g900 trx number', 'g900 trx'] },
  { key: 'g1800_trx', label: 'G1800 TRX Number', category: 'radio', aliases: ['g1800 trx number', 'g1800 trx'] },
  { key: '2g_bcch', label: 'BCCH', category: 'radio', aliases: ['bcch', '2g bcch'] },
  { key: '2g_ncc', label: 'NCC', category: 'radio', aliases: ['ncc', '2g ncc'] },
  { key: '2g_bcc', label: 'BCC', category: 'radio', aliases: ['bcc', '2g bcc'] },
  { key: 'hsn_900', label: 'HSN_900', category: 'radio', aliases: ['hsn 900', 'hsn 900m'] },
  { key: 'ma_900', label: 'MA_900', category: 'radio', aliases: ['ma 900', 'ma 900m'] },
  { key: 'maio_900m', label: 'MAIO_900M', category: 'radio', aliases: ['maio 900m', 'maio 900'] },
  { key: 'hsn_1800m', label: 'HSN_1800M', category: 'radio', aliases: ['hsn 1800m', 'hsn 1800'] },
  { key: 'ma_1800', label: 'MA_1800', category: 'radio', aliases: ['ma 1800', 'ma 1800m'] },
  { key: 'maio_1800m', label: 'MAIO_1800M', category: 'radio', aliases: ['maio 1800m', 'maio 1800'] },
  { key: '2g_bch', label: 'BCH', category: 'radio', aliases: ['bch', '2g bch'] },
  { key: '2g_sdcch', label: 'SDCCH', category: 'radio', aliases: ['sdcch', '2g sdcch'] },
  { key: '2g_pdtch', label: 'PDTCH', category: 'radio', aliases: ['pdtch', '2g pdtch'] },
  { key: 'tx_power_powt', label: 'Transmitter Power (POWT, dBm)', category: 'radio', aliases: ['transmitter power powt dbm', 'powt', 'transmitter power'] },
  { key: '2g_mcc', label: '2G MCC', category: 'radio', aliases: ['2g mcc'] },
  { key: '2g_mnc', label: '2G MNC', category: 'radio', aliases: ['2g mnc'] },
  { key: '2g_lac', label: '2G LAC', category: 'radio', aliases: ['2g lac'] },
  { key: '2g_rac', label: '2G RAC', category: 'radio', aliases: ['2g rac'] },
  { key: '2g_cgi', label: '2G CGI', category: 'radio', aliases: ['2g cgi'] },

  { key: '3g_rnc', label: '3G RNC Name & RNC ID', category: 'radio', aliases: ['3g rnc name rnc id', '3g rnc', 'rnc name', 'rnc id'] },
  { key: '3g_nodeb', label: '3G NodeB Name & NodeB ID', category: 'radio', aliases: ['3g nodeb name nodeb id', '3g nodeb', 'nodeb name', 'nodeb id'] },
  { key: '3g_cell', label: '3G Cell Name & Cell ID', category: 'radio', aliases: ['3g cell name cell id', '3g cell'] },
  { key: '3g_max_pilot_power', label: 'Max Power & Pilot Power (0.1dBm)', category: 'radio', aliases: ['max power pilot power 0 1dbm', 'max power pilot power', 'pilot power'] },
  { key: '3g_psc', label: 'Primary Scrambling Code (PSC)', category: 'radio', aliases: ['primary scrambling code psc', 'psc', 'primary scrambling code'] },
  { key: '3g_txrx', label: '3G TxRxMode', category: 'radio', aliases: ['3g txrxmode', '3g txrx mode'] },
  { key: '3g_dl_bw_earfcn', label: '3G DL Bandwidth & DL EARFCN', category: 'radio', aliases: ['3g dl bandwidth dl earfcn', '3g dl bandwidth'] },
  { key: '3g_mcc', label: '3G MCC', category: 'radio', aliases: ['3g mcc'] },
  { key: '3g_mnc', label: '3G MNC', category: 'radio', aliases: ['3g mnc'] },
  { key: '3g_lac', label: '3G LAC', category: 'radio', aliases: ['3g lac'] },
  { key: '3g_rac', label: '3G RAC', category: 'radio', aliases: ['3g rac'] },
  { key: '3g_sac', label: '3G SAC', category: 'radio', aliases: ['3g sac', 'sac'] },
  { key: '3g_cgi', label: '3G CGI', category: 'radio', aliases: ['3g cgi'] },

  { key: '4g_enodeb', label: '4G eNodeB Name & eNodeB ID', category: 'radio', aliases: ['4g enodeb name enodeb id', '4g enodeb', 'enodeb name', 'enodeb id'] },
  { key: '4g_cell', label: '4G Cell Name, Cell ID & Local Cell ID', category: 'radio', aliases: ['4g cell name cell id local cell id', '4g cell'] },
  { key: '4g_rs_pa_pb', label: 'RS Power (0.1dBm), PA, PB', category: 'radio', aliases: ['rs power 0 1dbm pa pb', 'rs power pa pb', 'rs power'] },
  { key: '4g_massive_mimo', label: 'Massive MIMO Cell & 4T6S Flag', category: 'radio', aliases: ['massive mimo cell 4t6s flag', 'massive mimo'] },
  { key: '4g_fdd_tdd', label: 'Cell FDD / TDD Indication', category: 'radio', aliases: ['cell fdd tdd indication', 'fdd tdd'] },
  { key: '4g_txrx', label: '4G TxRxMode', category: 'radio', aliases: ['4g txrxmode', '4g txrx mode'] },
  { key: '4g_freq_band', label: '4G Frequency Band', category: 'radio', aliases: ['4g frequency band', '4g freq band'] },
  { key: '4g_dl_ul_bw', label: '4G DL & UL Bandwidth', category: 'radio', aliases: ['4g dl ul bandwidth', '4g dl bandwidth'] },
  { key: '4g_dl_earfcn', label: '4G DL EARFCN', category: 'radio', aliases: ['4g dl earfcn'] },
  { key: '4g_tac_pci_root', label: 'TAC, PCI, Root Sequence Index', category: 'radio', aliases: ['tac pci root sequence index'] },
  { key: '4g_cell_radius', label: '4G Cell Radius (m)', category: 'radio', aliases: ['4g cell radius m', '4g cell radius'], numeric: true },
  { key: '4g_eci', label: 'ECI', category: 'radio', aliases: ['eci', '4g eci'] },
  { key: '4g_ecgi', label: 'ECGI', category: 'radio', aliases: ['ecgi', '4g ecgi'] },
  { key: '4g_mcc', label: '4G MCC', category: 'radio', aliases: ['4g mcc'] },
  { key: '4g_mnc', label: '4G MNC', category: 'radio', aliases: ['4g mnc'] },

  { key: '5g_gnodeb_name', label: '5G gNodeB Name', category: 'radio', aliases: ['5g gnodeb name', 'gnodeb name'] },
  { key: '5g_gnodeb_id', label: '5G gNodeB ID', category: 'radio', aliases: ['5g gnodeb id', 'gnodeb id'] },
  { key: '5g_cell_name', label: '5G Cell Name', category: 'radio', aliases: ['5g cell name'] },
  { key: '5g_cell_id', label: '5G Cell ID', category: 'radio', aliases: ['5g cell id'] },
  { key: '5g_local_cell_id', label: '5G Local Cell ID', category: 'radio', aliases: ['5g local cell id', 'local cell id'] },
  { key: '5g_nr_band', label: '5G NR Frequency Band', category: 'radio', aliases: ['5g nr frequency band', 'nr band', '5g band'] },
  { key: '5g_duplex_mode', label: '5G Duplex Mode (FDD / TDD)', category: 'radio', aliases: ['5g duplex mode fdd tdd', '5g duplex mode', 'duplex mode'] },
  { key: '5g_scs', label: 'Subcarrier Spacing (kHz)', category: 'radio', aliases: ['subcarrier spacing khz', 'subcarrier spacing', 'scs'] },
  { key: '5g_dl_bandwidth', label: '5G DL Bandwidth (MHz)', category: 'radio', aliases: ['5g dl bandwidth mhz', '5g dl bandwidth'] },
  { key: '5g_ul_bandwidth', label: '5G UL Bandwidth (MHz)', category: 'radio', aliases: ['5g ul bandwidth mhz', '5g ul bandwidth'] },
  { key: '5g_ssb_arfcn', label: 'SSB ARFCN', category: 'radio', aliases: ['ssb arfcn'] },
  { key: '5g_dl_arfcn', label: 'DL NR-ARFCN', category: 'radio', aliases: ['dl nr arfcn', '5g dl arfcn'] },
  { key: '5g_ul_arfcn', label: 'UL NR-ARFCN', category: 'radio', aliases: ['ul nr arfcn', '5g ul arfcn'] },
  { key: '5g_pci', label: '5G PCI', category: 'radio', aliases: ['5g pci'] },
  { key: '5g_root_sequence_index', label: '5G Root Sequence Index', category: 'radio', aliases: ['5g root sequence index', 'root sequence index'] },
  { key: '5g_txrx', label: '5G TxRxMode', category: 'radio', aliases: ['5g txrxmode', '5g txrx mode'] },
  { key: '5g_max_tx_power', label: 'Max Transmit Power (dBm)', category: 'radio', aliases: ['max transmit power dbm', 'max transmit power'], numeric: true },
  { key: '5g_ssb_power', label: 'SSB Power (dBm)', category: 'radio', aliases: ['ssb power dbm', 'ssb power'], numeric: true },
  { key: '5g_tac', label: '5G TAC', category: 'radio', aliases: ['5g tac'] },
  { key: '5g_nci', label: 'NCI (NR Cell Identity)', category: 'radio', aliases: ['nci nr cell identity', 'nci'] },
  { key: '5g_ncgi', label: 'NCGI', category: 'radio', aliases: ['ncgi'] },
  { key: '5g_mcc', label: '5G MCC', category: 'radio', aliases: ['5g mcc'] },
  { key: '5g_mnc', label: '5G MNC', category: 'radio', aliases: ['5g mnc'] },
  { key: '5g_nsa_sa_mode', label: '5G Deployment Mode (NSA / SA)', category: 'radio', aliases: ['5g deployment mode nsa sa', 'deployment mode', 'nsa sa'] },
  { key: '5g_slice_type', label: '5G Network Slice Type', category: 'radio', aliases: ['5g network slice type', 'network slice type', 'slice type'] },
  { key: '5g_cell_radius', label: '5G Cell Radius (m)', category: 'radio', aliases: ['5g cell radius m', '5g cell radius'], numeric: true },
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

    // A worksheet named "2G", "3G", "4G" or "5G" scopes bare columns such as
    // MCC / MNC / LAC to that technology, so identifiers never collide.
    const techPrefix = (norm(sheetName).match(/\b([2345])\s*g\b/) || [])[1];
    const lookup = (cell: any) => {
      const key = norm(cell);
      if (!key) return undefined;
      if (techPrefix) {
        const scoped = FIELD_BY_ALIAS.get(`${techPrefix}g ${key}`);
        if (scoped) return scoped;
      }
      return FIELD_BY_ALIAS.get(key);
    };

    // Layout 1 — header row + data row(s)
    for (let r = 0; r < Math.min(rows.length, 15); r++) {
      const header = rows[r] || [];
      const hits = header.filter(c => lookup(c)).length;
      if (hits < 3) continue;
      const dataRow = rows.slice(r + 1).find(row => row.some(c => c !== null && String(c).trim() !== ''));
      if (!dataRow) continue;
      header.forEach((cell, i) => {
        const field = lookup(cell);
        if (field) put(field, dataRow[i]);
      });
      break;
    }

    // Layout 2 — vertical key/value pairs
    rows.forEach(row => {
      if (!row) return;
      for (let c = 0; c < row.length - 1; c++) {
        const field = lookup(row[c]);
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
