import { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  LayoutDashboard, Plus, FileText, Radio, Loader2, Upload, Save, ShieldCheck, Send,
  MapPin, Building2, HardHat, Antenna, Signal, Wifi, Smartphone,
} from 'lucide-react';
import SiteDetailsView from '@/components/SiteDetailsView';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { parsePlanningNotes, buildPlanningNotes } from '@/lib/planningNotes';


import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, value: 'dashboard' },
  { label: 'Submit New Site', icon: Plus, value: 'submit' },
  { label: 'My Submissions', icon: FileText, value: 'submissions' },
];

// ----- Dropdown option sets -----
const REGIONS = ['Western Area', 'Northern', 'Southern', 'Eastern'];
const DISTRICTS = ['Western Area Urban','Western Area Rural','Bo','Kenema','Makeni','Port Loko','Tonkolili','Bombali','Kono','Kambia','Koinadugu','Kailahun','Moyamba','Pujehun','Bonthe','Falaba','Karene'];
const SITE_CLASSIFICATION = ['Platinum','Gold','Silver','Bronze'];
const NATCA_CLASS = ['Urban Area','Sub-urban','Rural'];
const OWNER_STATUS = ['Own','Shared with ONS & DIAKEM','Colocated'];
const SITE_TYPES = ['Greenfield','Rooftop'];
const TECH_OPTIONS = ['2G','3G','4G','5G'] as const;
const TOWER_TYPES = ['Monopole','Self-Supporting Lattice','Guyed Tower'];
const TOWER_MATERIALS = ['Galvanized Steel','Tubular Steel'];
const TERRAIN_TYPES = ['Flat','Hilly','Coastal','Rocky'];
const ACCESS_ROAD = ['Paved','Unpaved','Seasonal/4x4 Required'];
const SHELTER_TYPES = ['Outdoor Cabinet','Concrete Shelter','Prefab Shelter'];
const HIGH_SPEED = ['LOW_SPEED','HIGH_SPEED'];
const CELL_2G_TYPE = ['Normal_cell','Micro_cell','Macro_cell'];
const FREQ_BAND_2G = ['G900','G1800','G900/G1800'];
const TXRX_3G = ['1T1R','1T2R','2T2R','2T4R','4T4R'];
const TXRX_4G = ['2T2R','4T4R','8T8R','32T32R','64T64R'];
const FREQ_BAND_4G = ['L800','L900','L1800','L2100','L2600'];
const BW_4G = ['CELL_BW_N15','CELL_BW_N25','CELL_BW_N50','CELL_BW_N75','CELL_BW_N100'];
const FDD_TDD = ['CELL_FDD','CELL_TDD'];
const YES_NO = ['YES','NO'];

// ----- Field definitions per module -----
type FieldType = 'text'|'number'|'date'|'select';
interface FieldDef { key: string; label: string; type: FieldType; options?: readonly string[]; required?: boolean; placeholder?: string; }

const MOD1: FieldDef[] = [
  { key: 'site_id_code', label: 'Site ID Code', type: 'text', required: true, placeholder: 'SL0001' },
  { key: 'site_name', label: 'Site Name', type: 'text', required: true, placeholder: 'SL0001_WILBERFORCE' },
  { key: 'region', label: 'Region', type: 'select', options: REGIONS, required: true },
  { key: 'district', label: 'District', type: 'select', options: DISTRICTS, required: true },
  { key: 'chiefdom', label: 'Chiefdom', type: 'text' },
  { key: 'town', label: 'Town / City / Location', type: 'text', required: true },
  { key: 'location_updated', label: 'Location Updated', type: 'date' },
  { key: 'latitude', label: 'Latitude', type: 'number', required: true, placeholder: '8.4657' },
  { key: 'longitude', label: 'Longitude', type: 'number', required: true, placeholder: '-13.2317' },
  { key: 'elevation', label: 'Elevation (m)', type: 'number' },
  { key: 'dimensions', label: 'Dimensions (m)', type: 'text', placeholder: '15x15' },
  { key: 'distance_nearest_bts', label: 'Distance from Nearest BTS (km)', type: 'number' },
];

const MOD2_SELECTS: FieldDef[] = [
  { key: 'site_classification', label: 'Site Classification', type: 'select', options: SITE_CLASSIFICATION },
  { key: 'natca_classification', label: 'NAtCa Sites Classification', type: 'select', options: NATCA_CLASS },
  { key: 'owner_sharing_status', label: 'Owner / Site Sharing Status', type: 'select', options: OWNER_STATUS },
  { key: 'site_type', label: 'Site Type', type: 'select', options: SITE_TYPES },
];

const MOD3: FieldDef[] = [
  { key: 'tower_height', label: 'Tower Height (m)', type: 'number', required: true },
  { key: 'tower_type', label: 'Tower Type', type: 'select', options: TOWER_TYPES },
  { key: 'tower_material', label: 'Tower Material', type: 'select', options: TOWER_MATERIALS },
  { key: 'foundation_depth', label: 'Foundation Depth (cm)', type: 'number' },
  { key: 'terrain_type', label: 'Terrain Type', type: 'select', options: TERRAIN_TYPES },
  { key: 'access_road_condition', label: 'Access Road Condition', type: 'select', options: ACCESS_ROAD },
  { key: 'equipment_shelter', label: 'Equipment Shelter Type', type: 'select', options: SHELTER_TYPES },
];

const MOD4: FieldDef[] = [
  { key: 'antenna_type', label: 'Antenna Type', type: 'text' },
  { key: 'number_of_antennas', label: 'Number of Antennas', type: 'number' },
  { key: 'rru_model', label: 'RRU Type / Model', type: 'text' },
  { key: 'rf_antenna_height', label: 'RF Antenna Height (m)', type: 'number' },
  { key: 'rf_azimuth', label: 'RF Antenna Azimuth (deg)', type: 'number', placeholder: '0–360' },
  { key: 'rf_mechanical_tilt', label: 'RF Mechanical Tilt (deg)', type: 'number' },
  { key: 'rf_electrical_tilt', label: 'RF Electrical Tilt (deg)', type: 'number' },
  { key: 'cluster_id', label: 'Cluster ID', type: 'text' },
  { key: 'high_speed_flag', label: 'High Speed Flag', type: 'select', options: HIGH_SPEED },
];

const MOD5_2G: FieldDef[] = [
  { key: '2g_bsc_name', label: '2G NE Name / BSC Name', type: 'text' },
  { key: '2g_bts_id', label: '2G BTS ID', type: 'number' },
  { key: '2g_cell_name', label: '2G Cell Name', type: 'text' },
  { key: '2g_cell_id', label: '2G Cell ID', type: 'number' },
  { key: '2g_cell_type', label: '2G Cell Type', type: 'select', options: CELL_2G_TYPE },
  { key: '2g_freq_band', label: 'Frequency Band', type: 'select', options: FREQ_BAND_2G },
  { key: 'g900_trx', label: 'G900 TRX Number', type: 'number' },
  { key: 'g1800_trx', label: 'G1800 TRX Number', type: 'number' },
  { key: '2g_bcch_ncc_bcc', label: '2G BCCH, NCC, BCC', type: 'text' },
  { key: 'hsn_ma_maio_900', label: 'HSN_900M, MA_900, MAIO_900M', type: 'text' },
  { key: 'hsn_ma_maio_1800', label: 'HSN_1800M, MA_1800, MAIO_1800M', type: 'text' },
  { key: 'bch_sdcch_pdtch', label: 'BCH, SDCCH, PDTCH Channels', type: 'text' },
  { key: 'tx_power_powt', label: 'Transmitter Power (POWT, dBm)', type: 'number' },
  { key: '2g_identifiers', label: '2G Identifiers (MCC, MNC, LAC, RAC, CGI)', type: 'text' },
];

const MOD6_3G: FieldDef[] = [
  { key: '3g_rnc', label: '3G RNC Name & RNC ID', type: 'text' },
  { key: '3g_nodeb', label: '3G NodeB Name & NodeB ID', type: 'text' },
  { key: '3g_cell', label: '3G Cell Name & Cell ID', type: 'text' },
  { key: '3g_max_pilot_power', label: 'Max Power & Pilot Power (0.1dBm)', type: 'text' },
  { key: '3g_psc', label: 'Primary Scrambling Code (PSC)', type: 'number' },
  { key: '3g_txrx', label: '3G TxRxMode', type: 'select', options: TXRX_3G },
  { key: '3g_dl_bw_earfcn', label: '3G DL Bandwidth & DL EARFCN', type: 'text' },
  { key: '3g_identifiers', label: '3G Identifiers (MCC, MNC, LAC, RAC, SAC, CGI)', type: 'text' },
];

const MOD7_4G: FieldDef[] = [
  { key: '4g_enodeb', label: '4G eNodeB Name & eNodeB ID', type: 'text' },
  { key: '4g_cell', label: '4G Cell Name, Cell ID & Local Cell ID', type: 'text' },
  { key: '4g_rs_pa_pb', label: 'RS Power (0.1dBm), PA, PB', type: 'text' },
  { key: '4g_massive_mimo', label: 'Massive MIMO Cell & 4T6S Flag', type: 'select', options: YES_NO },
  { key: '4g_fdd_tdd', label: 'Cell FDD / TDD Indication', type: 'select', options: FDD_TDD },
  { key: '4g_txrx', label: '4G TxRxMode', type: 'select', options: TXRX_4G },
  { key: '4g_freq_band', label: '4G Frequency Band', type: 'select', options: FREQ_BAND_4G },
  { key: '4g_dl_ul_bw', label: '4G DL & UL Bandwidth', type: 'select', options: BW_4G },
  { key: '4g_dl_earfcn', label: '4G DL EARFCN', type: 'number' },
  { key: '4g_tac_pci_root', label: 'TAC, PCI, Root Sequence Index', type: 'text' },
  { key: '4g_cell_radius', label: 'Cell Radius (m)', type: 'number' },
  { key: '4g_identifiers', label: '4G Identifiers (ECI, ECGI, MCC, MNC)', type: 'text' },
];

// Columns actually present on the `sites` table — safe to write directly.
const NATIVE_COLS = new Set([
  'site_id_code','site_name','region','district','town','dimensions','tower_height',
  'foundation_depth','elevation','distance_nearest_bts','latitude','longitude',
  'tower_type','tower_material','antenna_type','number_of_antennas',
  'equipment_shelter','site_type','terrain_type','access_road_condition',
  'site_photo_url','layout_plan_url','approval_letter_url',
]);

const ATTACHMENTS: { key: string; label: string }[] = [
  { key: 'site_photo_url', label: 'Site Photo' },
  { key: 'layout_plan_url', label: 'Layout Plan' },
  { key: 'approval_letter_url', label: 'Approval Letter' },
];

type FormState = Record<string, any> & { technology_classification?: string[] };

type SiteRow = { id: string; site_id_code: string; site_name: string; region: string; district: string; town: string; status: 'pending'|'approved'|'rejected'; created_at: string; review_notes: string | null; notes?: string | null; [k: string]: any; };

const emptyState: FormState = { technology_classification: [] };

// Normalize an Excel header cell to a lookup key.
const normKey = (s: any) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

// Map normalized header aliases -> internal field key.
const HEADER_ALIASES: Record<string, string> = {
  site_id: 'site_id_code', site_id_code: 'site_id_code', siteid: 'site_id_code',
  site_name: 'site_name', name: 'site_name',
  region: 'region', district: 'district', chiefdom: 'chiefdom', town: 'town', city: 'town', location: 'town',
  latitude: 'latitude', lat: 'latitude', longitude: 'longitude', lon: 'longitude', long: 'longitude',
  elevation: 'elevation', elevation_m: 'elevation',
  dimensions: 'dimensions', dimensions_m: 'dimensions',
  distance_from_nearest_bts: 'distance_nearest_bts', distance_nearest_bts: 'distance_nearest_bts',
  tower_height: 'tower_height', tower_height_m: 'tower_height',
  tower_type: 'tower_type', tower_material: 'tower_material',
  foundation_depth: 'foundation_depth', foundation_depth_cm: 'foundation_depth',
  terrain_type: 'terrain_type', access_road_condition: 'access_road_condition',
  equipment_shelter: 'equipment_shelter', equipment_shelter_type: 'equipment_shelter',
  antenna_type: 'antenna_type', number_of_antennas: 'number_of_antennas',
  site_type: 'site_type', site_classification: 'site_classification',
  natca_sites_classification: 'natca_classification', natca_classification: 'natca_classification',
  owner_site_sharing_status: 'owner_sharing_status', owner_sharing_status: 'owner_sharing_status',
};

// Build a lookup of every recognisable token -> internal field key.
function buildFieldIndex(): Record<string, FieldDef> {
  const all: FieldDef[] = [...MOD1, ...MOD2_SELECTS, ...MOD3, ...MOD4, ...MOD5_2G, ...MOD6_3G, ...MOD7_4G];
  const idx: Record<string, FieldDef> = {};
  const add = (token: string, f: FieldDef) => { const n = normKey(token); if (n && !idx[n]) idx[n] = f; };
  all.forEach(f => {
    add(f.key, f);
    add(f.label, f);
    add(f.label.replace(/\([^)]*\)/g, ''), f);          // label without units
    add(f.label.replace(/\/.*$/, ''), f);                 // label before slash
    add(f.label.split('&')[0], f);                        // label before &
  });
  Object.entries(HEADER_ALIASES).forEach(([alias, key]) => {
    const f = all.find(x => x.key === key);
    if (f) add(alias, f);
  });
  return idx;
}
const FIELD_INDEX = buildFieldIndex();

function matchField(raw: any): FieldDef | null {
  const n = normKey(raw);
  if (!n) return null;
  if (FIELD_INDEX[n]) return FIELD_INDEX[n];
  // tolerate trailing units/qualifiers: strip trailing _m, _cm, _km, _deg, _dbm, _no, _number
  const stripped = n.replace(/_(m|cm|km|deg|degrees|dbm|db|no|number|value|s)$/,'');
  return FIELD_INDEX[stripped] ?? null;
}

function coerce(f: FieldDef, v: any): any {
  if (v == null || v === '') return null;
  if (f.type === 'number') {
    const num = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(num) ? num : null;
  }
  if (f.type === 'date') {
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (f.type === 'select' && f.options) {
    const hit = f.options.find(o => normKey(o) === normKey(s));
    return hit ?? null; // ignore values that aren't valid options
  }
  return s;
}

function parseWorkbookIntoState(wb: XLSX.WorkBook): Partial<FormState> {
  const collected: Record<string, any> = {};
  const put = (f: FieldDef, v: any) => {
    if (collected[f.key] != null && collected[f.key] !== '') return;
    const c = coerce(f, v);
    if (c != null && c !== '') collected[f.key] = c;
  };

  wb.SheetNames.forEach((name) => {
    const grid = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[name], { header: 1, defval: '', blankrows: false, raw: false });
    if (!grid.length) return;
    let found = 0;

    // Pass 1 — key/value layout: a cell that names a field, value in a later cell of the same row.
    grid.forEach(row => {
      if (!Array.isArray(row)) return;
      for (let c = 0; c < row.length; c++) {
        const f = matchField(row[c]);
        if (!f) continue;
        for (let n = c + 1; n < row.length; n++) {
          const v = row[n];
          if (v !== '' && v != null && !matchField(v)) { put(f, v); found++; break; }
        }
      }
    });

    // Pass 2 — table layout: header row followed by a data row.
    for (let r = 0; r < grid.length - 1; r++) {
      const header = grid[r]; if (!Array.isArray(header)) continue;
      const map = header.map(matchField);
      const hits = map.filter(Boolean).length;
      if (hits < 2) continue;
      for (let d = r + 1; d < grid.length; d++) {
        const data = grid[d];
        if (!Array.isArray(data) || !data.some(v => v !== '' && v != null)) continue;
        map.forEach((f, c) => { if (f) { put(f, data[c]); found++; } });
        break;
      }
      break;
    }

    // Sheet-name hints for RAN sheets.
    const upper = name.toUpperCase();
    if (found && /2G|GSM/.test(upper)) collected.__tech_2g = true;
    if (found && /3G|UMTS|WCDMA/.test(upper)) collected.__tech_3g = true;
    if (found && /4G|LTE/.test(upper)) collected.__tech_4g = true;
  });

  // Also infer technology from populated per-tech fields.
  const anyKey = (prefix: string) => Object.keys(collected).some(k => k.startsWith(prefix));
  const tech: string[] = [];
  if (collected.__tech_2g || anyKey('2g_') || collected.g900_trx != null || collected.g1800_trx != null) tech.push('2G');
  if (collected.__tech_3g || anyKey('3g_')) tech.push('3G');
  if (collected.__tech_4g || anyKey('4g_')) tech.push('4G');
  delete collected.__tech_2g; delete collected.__tech_3g; delete collected.__tech_4g;
  if (tech.length) collected.technology_classification = tech;
  return collected;
}


export default function PlanningDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editSite, setEditSite] = useState<SiteRow | null>(null);
  const [viewSite, setViewSite] = useState<SiteRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyState);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const setField = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const fetchSites = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('sites').select('*').eq('submitted_by', user.id).order('created_at', { ascending: false });
    if (!error && data) setSites(data as SiteRow[]);
    setLoading(false);
  };
  useEffect(() => { fetchSites(); }, [user]);

  // Hydrate form when editing.
  useEffect(() => {
    if (!editSite) { setForm(emptyState); return; }
    const { text, extended } = parsePlanningNotes(editSite.notes);
    const hydrated: FormState = { technology_classification: [], ...extended, planner_note: text };
    Object.keys(editSite).forEach(k => { if (editSite[k] != null && NATIVE_COLS.has(k)) hydrated[k] = editSite[k]; });
    setForm(hydrated);

  }, [editSite]);

  const pending = sites.filter(s => s.status === 'pending').length;
  const approved = sites.filter(s => s.status === 'approved').length;
  const rejected = sites.filter(s => s.status === 'rejected').length;

  const tech = form.technology_classification || [];
  const has = (t: string) => tech.includes(t);
  const toggleTech = (t: string) => setField('technology_classification', has(t) ? tech.filter(x => x !== t) : [...tech, t]);

  const validateSchema = (): { ok: boolean; missing: string[] } => {
    const missing: string[] = [];
    [...MOD1, ...MOD3].forEach(f => { if (f.required && (form[f.key] == null || form[f.key] === '')) missing.push(f.label); });
    if (!tech.length) missing.push('Technology Classification');
    return { ok: missing.length === 0, missing };
  };

  const uploadAttachments = async (): Promise<Record<string, string>> => {
    const out: Record<string, string> = {};
    for (const a of ATTACHMENTS) {
      const file = files[a.key];
      if (!file || file.size === 0) continue;
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/${Date.now()}_${a.key}.${ext}`;
      const { error } = await supabase.storage.from('site-documents').upload(path, file, { upsert: true });
      if (error) { toast({ variant: 'destructive', title: `Upload failed (${a.label})`, description: error.message }); continue; }
      out[a.key] = path;
    }
    return out;
  };

  const buildPayload = (status: 'pending') => {
    const native: Record<string, any> = { submitted_by: user!.id, status };
    NATIVE_COLS.forEach(col => {
      const v = form[col];
      if (v === '' || v == null) return;
      const numCols = ['tower_height','foundation_depth','elevation','distance_nearest_bts','latitude','longitude','number_of_antennas'];
      native[col] = numCols.includes(col) ? Number(v) : v;
    });
    const extended: Record<string, any> = {};
    Object.entries(form).forEach(([k, v]) => { if (!NATIVE_COLS.has(k) && k !== 'planner_note' && v !== '' && v != null) extended[k] = v; });
    native.notes = buildPlanningNotes(form.planner_note as string, extended);
    return native;

  };

  const persist = async (asDraft: boolean) => {
    if (!user) return;
    if (!asDraft) {
      const { ok, missing } = validateSchema();
      if (!ok) { toast({ variant: 'destructive', title: 'Cannot submit', description: `Missing: ${missing.slice(0, 4).join(', ')}` }); return; }
    }
    setSubmitting(true);
    const uploaded = await uploadAttachments();
    const payload = { ...buildPayload('pending'), ...uploaded };
    if (!payload.site_id_code) payload.site_id_code = `DRAFT-${Date.now()}`;
    if (!payload.site_name) payload.site_name = payload.site_id_code;
    if (!payload.region) payload.region = 'Western Area';
    if (!payload.district) payload.district = 'Western Area Urban';
    if (!payload.town) payload.town = '—';
    const { error } = editSite
      ? await supabase.from('sites').update(payload as any).eq('id', editSite.id)
      : await supabase.from('sites').insert(payload as any);
    setSubmitting(false);
    if (error) { toast({ variant: 'destructive', title: 'Save failed', description: error.message }); return; }
    toast({ title: asDraft ? 'Draft saved' : (editSite ? 'Submission updated' : 'Submitted for review') });
    setEditSite(null); setForm(emptyState); setFiles({}); fetchSites();
    if (!asDraft) setActiveTab('submissions');
  };


  const renderField = (f: FieldDef) => {
    const val = form[f.key] ?? '';
    if (f.type === 'select' && f.options) {
      return (
        <div key={f.key} className="space-y-2">
          <Label>{f.label}{f.required && ' *'}</Label>
          <Select value={val ? String(val) : ''} onValueChange={(v) => setField(f.key, v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{f.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      );
    }
    return (
      <div key={f.key} className="space-y-2">
        <Label htmlFor={f.key}>{f.label}{f.required && ' *'}</Label>
        <Input id={f.key} type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} step="any" placeholder={f.placeholder} value={val} onChange={e => setField(f.key, e.target.value)} />
      </div>
    );
  };

  const modules = useMemo(() => ([
    { id: 'm1', icon: MapPin,       title: 'Basic Site & Location', fields: MOD1, show: true },
    { id: 'm2', icon: ShieldCheck,  title: 'Governance & Classification', fields: MOD2_SELECTS, show: true, custom: 'tech' as const },
    { id: 'm3', icon: HardHat,      title: 'Civil & Infrastructure', fields: MOD3, show: true },
    { id: 'm4', icon: Antenna,      title: 'RF Hardware & Physical Antenna', fields: MOD4, show: true },
    { id: 'm5', icon: Radio,        title: '2G Radio Network', fields: MOD5_2G, show: has('2G') },
    { id: 'm6', icon: Signal,       title: '3G Radio Network', fields: MOD6_3G, show: has('3G') },
    { id: 'm7', icon: Smartphone,   title: '4G LTE Radio Network', fields: MOD7_4G, show: has('4G') },

  ]), [tech]);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="rounded-xl gradient-orange p-4 sm:p-5 md:p-6 text-primary-foreground">
        <h2 className="text-lg sm:text-xl font-bold">Welcome, {profile?.full_name || 'Planner'}! 👋</h2>
        <p className="text-xs sm:text-sm opacity-90 mt-1">Manage your BTS site planning submissions here.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total" value={sites.length} icon={Radio} />
        <StatCard title="Pending" value={pending} icon={FileText} color="text-warning" />
        <StatCard title="Approved" value={approved} icon={FileText} color="text-success" />
        <StatCard title="Rejected" value={rejected} icon={FileText} color="text-destructive" />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Submissions</CardTitle></CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {sites.slice(0, 5).map(site => (
                <div key={site.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{site.site_name}</p>
                    <p className="text-xs text-muted-foreground">{site.region} • {site.site_id_code}</p>
                  </div>
                  <StatusBadge status={site.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSubmitForm = () => (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg sm:text-xl font-bold">{editSite ? 'Update Planning Submission' : 'New Planning Submission'}</h2>
        {editSite && <Button variant="ghost" size="sm" onClick={() => setEditSite(null)}>Cancel Edit</Button>}
      </div>

      {/* Action bar */}
      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => persist(true)} disabled={submitting}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button type="button" className="gradient-orange border-0 text-primary-foreground ml-auto" onClick={() => persist(false)} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Submit Planning Data
          </Button>
        </CardContent>
      </Card>


      {/* Modules accordion */}
      <Accordion type="multiple" defaultValue={['m1','m2','m3','m4']} className="space-y-3">
        {modules.filter(m => m.show).map(m => (
          <AccordionItem key={m.id} value={m.id} className="border rounded-lg bg-card">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <m.icon className="h-4 w-4 text-primary" /> {m.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {m.fields.map(renderField)}
              </div>
              {m.custom === 'tech' && (
                <div className="mt-4 space-y-2">
                  <Label>Technology Classification *</Label>
                  <div className="flex flex-wrap gap-2">
                    {TECH_OPTIONS.map(t => (
                      <label key={t} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-xs font-medium transition-colors ${has(t) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40'}`}>
                        <Checkbox checked={has(t)} onCheckedChange={() => toggleTech(t)} className="h-3.5 w-3.5" />
                        {t}
                      </label>
                    ))}
                  </div>
                  {tech.length > 0 && (
                    <div className="flex gap-1 flex-wrap pt-1">
                      {tech.map(t => <Badge key={t} variant="secondary">{t} module enabled</Badge>)}
                    </div>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Attachments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" /> Attachments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ATTACHMENTS.map(a => {
            const existing = form[a.key] as string | undefined;
            const picked = files[a.key];
            return (
              <div key={a.key} className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between rounded-lg border p-3 bg-muted/20">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {picked ? picked.name : existing ? existing.split('/').pop() : 'No file attached'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    className="max-w-[240px] text-xs"
                    onChange={e => setFiles(prev => ({ ...prev, [a.key]: e.target.files?.[0] || null }))}
                  />
                  {picked && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setFiles(prev => ({ ...prev, [a.key]: null }))}>Clear</Button>
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">Images or PDF. Files upload when you save the draft or submit.</p>
        </CardContent>
      </Card>

      {/* Planner note — always last */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Additional Notes / Remarks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            id="planner_note"
            rows={4}
            placeholder="Add any comment, observation or clarification about this site for the reviewing teams..."
            value={form.planner_note ?? ''}
            onChange={e => setField('planner_note', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Optional. This note is shared with Procurement, Power, Rollout and Admin reviewers.</p>
        </CardContent>
      </Card>
    </div>
  );


  const renderSubmissions = () => (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold">My Submissions</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : sites.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No submissions yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sites.map(site => (
            <Card key={site.id} className="overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{site.site_name}</h3>
                      <StatusBadge status={site.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {site.site_id_code} • {site.region} • {new Date(site.created_at).toLocaleDateString()}
                    </p>
                    {site.review_notes && (
                      <p className="text-xs mt-2 p-2 rounded bg-muted text-muted-foreground">
                        <span className="font-medium">Review Notes:</span> {site.review_notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => setViewSite(site)}>View</Button>
                    {(site.status === 'pending' || site.status === 'rejected') && (
                      <Button size="sm" variant="outline" onClick={() => { setEditSite(site); setActiveTab('submit'); }}>Edit</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewSite && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setViewSite(null)}>
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{viewSite.site_name}</h3>
              <Button size="sm" variant="ghost" onClick={() => setViewSite(null)}>✕</Button>
            </div>
            <SiteDetailsView site={viewSite} allowFileManage={viewSite.status === 'pending' || viewSite.status === 'rejected'} onFileUpdated={fetchSites} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AuthGuard allowedRoles={['planning_team', 'project_team']}>
      <DashboardLayout title="Planning Dashboard" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'submit' && renderSubmitForm()}
        {activeTab === 'submissions' && renderSubmissions()}
      </DashboardLayout>
    </AuthGuard>
  );
}
