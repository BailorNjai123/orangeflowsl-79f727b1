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
      { key: '2g_bcch', label: 'BCCH' },
      { key: '2g_ncc', label: 'NCC' },
      { key: '2g_bcc', label: 'BCC' },
      { key: 'hsn_900', label: 'HSN_900' },
      { key: 'ma_900', label: 'MA_900' },
      { key: 'maio_900m', label: 'MAIO_900M' },
      { key: 'hsn_1800m', label: 'HSN_1800M' },
      { key: 'ma_1800', label: 'MA_1800' },
      { key: 'maio_1800m', label: 'MAIO_1800M' },
      { key: '2g_bch', label: 'BCH' },
      { key: '2g_sdcch', label: 'SDCCH' },
      { key: '2g_pdtch', label: 'PDTCH' },
      { key: 'tx_power_powt', label: 'Transmitter Power (POWT, dBm)' },
      { key: '2g_mcc', label: 'MCC' },
      { key: '2g_mnc', label: 'MNC' },
      { key: '2g_lac', label: 'LAC' },
      { key: '2g_rac', label: 'RAC' },
      { key: '2g_cgi', label: 'CGI' },
      // Legacy combined values kept so older records still render.
      { key: '2g_bcch_ncc_bcc', label: '2G BCCH, NCC, BCC (legacy)' },
      { key: 'hsn_ma_maio_900', label: 'HSN_900M, MA_900, MAIO_900M (legacy)' },
      { key: 'hsn_ma_maio_1800', label: 'HSN_1800M, MA_1800, MAIO_1800M (legacy)' },
      { key: 'bch_sdcch_pdtch', label: 'BCH, SDCCH, PDTCH Channels (legacy)' },
      { key: '2g_identifiers', label: '2G Identifiers (legacy)' },
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
      { key: '3g_mcc', label: 'MCC' },
      { key: '3g_mnc', label: 'MNC' },
      { key: '3g_lac', label: 'LAC' },
      { key: '3g_rac', label: 'RAC' },
      { key: '3g_sac', label: 'SAC' },
      { key: '3g_cgi', label: 'CGI' },
      { key: '3g_identifiers', label: '3G Identifiers (legacy)' },
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
      { key: '4g_eci', label: 'ECI' },
      { key: '4g_ecgi', label: 'ECGI' },
      { key: '4g_mcc', label: 'MCC' },
      { key: '4g_mnc', label: 'MNC' },
      { key: '4g_identifiers', label: '4G Identifiers (legacy)' },
    ],
  },
  {
    title: '5G NR Radio Network',
    fields: [
      { key: '5g_gnodeb_name', label: '5G gNodeB Name' },
      { key: '5g_gnodeb_id', label: '5G gNodeB ID' },
      { key: '5g_cell_name', label: '5G Cell Name' },
      { key: '5g_cell_id', label: '5G Cell ID' },
      { key: '5g_local_cell_id', label: '5G Local Cell ID' },
      { key: '5g_nr_band', label: '5G NR Frequency Band' },
      { key: '5g_duplex_mode', label: '5G Duplex Mode (FDD / TDD)' },
      { key: '5g_scs', label: 'Subcarrier Spacing (kHz)' },
      { key: '5g_dl_bandwidth', label: '5G DL Bandwidth (MHz)' },
      { key: '5g_ul_bandwidth', label: '5G UL Bandwidth (MHz)' },
      { key: '5g_ssb_arfcn', label: 'SSB ARFCN' },
      { key: '5g_dl_arfcn', label: 'DL NR-ARFCN' },
      { key: '5g_ul_arfcn', label: 'UL NR-ARFCN' },
      { key: '5g_pci', label: '5G PCI' },
      { key: '5g_root_sequence_index', label: 'Root Sequence Index' },
      { key: '5g_txrx', label: '5G TxRxMode' },
      { key: '5g_max_tx_power', label: 'Max Transmit Power (dBm)' },
      { key: '5g_ssb_power', label: 'SSB Power (dBm)' },
      { key: '5g_tac', label: '5G TAC' },
      { key: '5g_nci', label: 'NCI (NR Cell Identity)' },
      { key: '5g_ncgi', label: 'NCGI' },
      { key: '5g_mcc', label: 'MCC' },
      { key: '5g_mnc', label: 'MNC' },
      { key: '5g_nsa_sa_mode', label: 'Deployment Mode (NSA / SA)' },
      { key: '5g_slice_type', label: 'Network Slice Type' },
      { key: '5g_cell_radius', label: '5G Cell Radius (m)' },
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
