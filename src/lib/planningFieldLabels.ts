// Human-readable labels for every planning parameter captured by the Planning
// dashboard. Extended parameters (those with no native column on `sites`) are
// persisted inside the notes JSON payload; this map lets read-only views such as
// the Admin Planning Review render them with proper labels and grouping.

export interface PlanningFieldGroup {
  title: string;
  fields: { key: string; label: string }[];
}

export const PLANNING_FIELD_GROUPS: PlanningFieldGroup[] = [
  {
    title: 'Basic Site & Location',
    fields: [
      { key: 'site_id_code', label: 'Site ID Code' },
      { key: 'site_name', label: 'Site Name' },
      { key: 'region', label: 'Region' },
      { key: 'district', label: 'District' },
      { key: 'chiefdom', label: 'Chiefdom' },
      { key: 'town', label: 'Town / City / Location' },
      { key: 'location_updated', label: 'Location Updated' },
      { key: 'latitude', label: 'Latitude' },
      { key: 'longitude', label: 'Longitude' },
      { key: 'elevation', label: 'Elevation (m)' },
      { key: 'dimensions', label: 'Dimensions (m)' },
      { key: 'distance_nearest_bts', label: 'Distance from Nearest BTS (km)' },
    ],
  },
  {
    title: 'Governance & Classification',
    fields: [
      { key: 'site_classification', label: 'Site Classification' },
      { key: 'natca_classification', label: 'NAtCa Sites Classification' },
      { key: 'owner_sharing_status', label: 'Owner / Site Sharing Status' },
      { key: 'site_type', label: 'Site Type' },
      { key: 'technology_classification', label: 'Technology Classification' },
    ],
  },
  {
    title: 'Civil & Infrastructure',
    fields: [
      { key: 'tower_height', label: 'Tower Height (m)' },
      { key: 'tower_type', label: 'Tower Type' },
      { key: 'tower_material', label: 'Tower Material' },
      { key: 'foundation_depth', label: 'Foundation Depth (cm)' },
      { key: 'terrain_type', label: 'Terrain Type' },
      { key: 'access_road_condition', label: 'Access Road Condition' },
      { key: 'equipment_shelter', label: 'Equipment Shelter Type' },
    ],
  },
  {
    title: 'RF Hardware & Physical Antenna',
    fields: [
      { key: 'antenna_type', label: 'Antenna Type' },
      { key: 'number_of_antennas', label: 'Number of Antennas' },
      { key: 'rru_model', label: 'RRU Type / Model' },
      { key: 'rf_antenna_height', label: 'RF Antenna Height (m)' },
      { key: 'rf_azimuth', label: 'RF Antenna Azimuth (deg)' },
      { key: 'rf_mechanical_tilt', label: 'RF Mechanical Tilt (deg)' },
      { key: 'rf_electrical_tilt', label: 'RF Electrical Tilt (deg)' },
      { key: 'cluster_id', label: 'Cluster ID' },
      { key: 'high_speed_flag', label: 'High Speed Flag' },
    ],
  },
  {
    title: '2G Radio Network',
    fields: [
      { key: '2g_bsc_name', label: '2G NE Name / BSC Name' },
      { key: '2g_bts_id', label: '2G BTS ID' },
      { key: '2g_cell_name', label: '2G Cell Name' },
      { key: '2g_cell_id', label: '2G Cell ID' },
      { key: '2g_cell_type', label: '2G Cell Type' },
      { key: '2g_freq_band', label: 'Frequency Band' },
      { key: 'g900_trx', label: 'G900 TRX Number' },
      { key: 'g1800_trx', label: 'G1800 TRX Number' },
      { key: '2g_bcch_ncc_bcc', label: '2G BCCH, NCC, BCC' },
      { key: 'hsn_ma_maio_900', label: 'HSN_900M, MA_900, MAIO_900M' },
      { key: 'hsn_ma_maio_1800', label: 'HSN_1800M, MA_1800, MAIO_1800M' },
      { key: 'bch_sdcch_pdtch', label: 'BCH, SDCCH, PDTCH Channels' },
      { key: 'tx_power_powt', label: 'Transmitter Power (POWT, dBm)' },
      { key: '2g_identifiers', label: '2G Identifiers (MCC, MNC, LAC, RAC, CGI)' },
    ],
  },
  {
    title: '3G Radio Network',
    fields: [
      { key: '3g_rnc', label: '3G RNC Name & RNC ID' },
      { key: '3g_nodeb', label: '3G NodeB Name & NodeB ID' },
      { key: '3g_cell', label: '3G Cell Name & Cell ID' },
      { key: '3g_max_pilot_power', label: 'Max Power & Pilot Power (0.1dBm)' },
      { key: '3g_psc', label: 'Primary Scrambling Code (PSC)' },
      { key: '3g_txrx', label: '3G TxRxMode' },
      { key: '3g_dl_bw_earfcn', label: '3G DL Bandwidth & DL EARFCN' },
      { key: '3g_identifiers', label: '3G Identifiers (MCC, MNC, LAC, RAC, SAC, CGI)' },
    ],
  },
  {
    title: '4G LTE Radio Network',
    fields: [
      { key: '4g_enodeb', label: '4G eNodeB Name & eNodeB ID' },
      { key: '4g_cell', label: '4G Cell Name, Cell ID & Local Cell ID' },
      { key: '4g_rs_pa_pb', label: 'RS Power (0.1dBm), PA, PB' },
      { key: '4g_massive_mimo', label: 'Massive MIMO Cell & 4T6S Flag' },
      { key: '4g_fdd_tdd', label: 'Cell FDD / TDD Indication' },
      { key: '4g_txrx', label: '4G TxRxMode' },
      { key: '4g_freq_band', label: '4G Frequency Band' },
      { key: '4g_dl_ul_bw', label: '4G DL & UL Bandwidth' },
      { key: '4g_dl_earfcn', label: '4G DL EARFCN' },
      { key: '4g_tac_pci_root', label: 'TAC, PCI, Root Sequence Index' },
      { key: '4g_cell_radius', label: 'Cell Radius (m)' },
      { key: '4g_identifiers', label: '4G Identifiers (ECI, ECGI, MCC, MNC)' },
    ],
  },
];

const KNOWN_KEYS = new Set(PLANNING_FIELD_GROUPS.flatMap(g => g.fields.map(f => f.key)));

export function isKnownPlanningKey(key: string) {
  return KNOWN_KEYS.has(key);
}

export function prettifyKey(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatPlanningValue(value: any): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (Array.isArray(value)) return value.length ? value.join(', ') : null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}
