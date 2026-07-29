import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Download, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SiteDetailsView from '@/components/SiteDetailsView';
import { cleanNote } from '@/lib/planningNotes';


type Site = any;

interface SiteMonitorTableProps {
  sites: Site[];
  onFileUpdated?: () => void;
}

type SortKey = string;
type SortDir = 'asc' | 'desc';

const deploymentStatusColors: Record<string, string> = {
  'Not Started': 'bg-destructive/15 text-destructive border-destructive/30',
  'In Progress': 'bg-warning/15 text-warning border-warning/30',
  'Completed': 'bg-success/15 text-success border-success/30',
};

const deploymentStatusDots: Record<string, string> = {
  'Not Started': '🔴',
  'In Progress': '🟡',
  'Completed': '🟢',
};

const approvalStatusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  approved: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
};

const approvalStatusDots: Record<string, string> = {
  pending: '🟡',
  approved: '🟢',
  rejected: '🔴',
};

const deploymentFields = ['soil_test', 'site_implementation_design', 'cast_status', 'tower_rig', 'civil_rfi', 'power_rfi', 'on_air'];

/** Rollout/Power data submitted through the dashboards is stored as JSON in sites.review_notes */
function parseExt(site: Site): { rollout: any; power: any } {
  try {
    const obj = site?.review_notes ? JSON.parse(site.review_notes) : {};
    if (obj && typeof obj === 'object') return { rollout: obj.rollout || {}, power: obj.power || {} };
  } catch { /* plain text note */ }
  return { rollout: {}, power: {} };
}

const fmtDate = (v: any) => { if (!v) return '-'; try { return new Date(v).toLocaleDateString(); } catch { return String(v); } };

function computeRollout(site: Site): number {
  if (site.progress_percent != null) return Math.round(Number(site.progress_percent));
  const completed = deploymentFields.filter(f => site[f] === 'Completed').length;
  return Math.round((completed / deploymentFields.length) * 100);
}

function cellValue(site: Site, key: string): string {
  const col = columns.find(c => c.key === key);
  if (col?.get) { const v = col.get(site); return v === null || v === undefined || v === '' ? '-' : String(v); }
  if (key === 'rollout_progress') return `${computeRollout(site)}%`;
  if (key === 'notes') return cleanNote(site.notes) || '-';
  const v = site[key];
  if (v === null || v === undefined || v === '') return '-';
  if (key === 'handover_to_vendor') return fmtDate(v);
  return String(v);

}

const columns: { key: string; label: string; minW?: string; type?: 'deployment' | 'approval' | 'rollout'; get?: (s: Site) => any }[] = [
  { key: 'site_id_code', label: 'Site ID', minW: '100px' },
  { key: 'site_name', label: 'Site', minW: '150px' },
  { key: 'scope', label: 'Scope', minW: '100px', get: s => s.scope || parseExt(s).rollout.project_scope },
  { key: 'district', label: 'District', minW: '120px' },
  { key: 'vendor_name', label: 'Vendor', minW: '120px' },
  { key: 'civil_contractor', label: 'Civil Contractor', minW: '140px', get: s => parseExt(s).rollout.civil_contractor || s.contractor_name },
  { key: 'ti_contractor', label: 'T&I Contractor', minW: '140px', get: s => parseExt(s).rollout.ti_contractor },
  { key: 'project_manager', label: 'Project Manager', minW: '140px', get: s => parseExt(s).rollout.project_manager },
  { key: 'rollout_status', label: 'Rollout Status', minW: '120px', get: s => parseExt(s).rollout.status },
  { key: 'handover_to_vendor', label: 'Handover to Vendor', minW: '140px' },
  { key: 'soil_test', label: 'Soil Test', minW: '110px', type: 'deployment' },
  { key: 'site_implementation_design', label: 'Site Implementation Design', minW: '180px', type: 'deployment' },
  { key: 'cast_status', label: 'Cast', minW: '100px', type: 'deployment' },
  { key: 'tower_rig', label: 'Tower Rig', minW: '110px', type: 'deployment' },
  { key: 'civil_rfi', label: 'Civil RFI', minW: '100px', type: 'deployment' },
  { key: 'power_rfi', label: 'Power RFI', minW: '100px', type: 'deployment' },
  { key: 'on_air', label: 'On Air', minW: '100px', type: 'deployment' },
  { key: 'rollout_progress', label: 'Rollout Progress (%)', minW: '140px', type: 'rollout' },
  { key: 'civil_start_date', label: 'Civil Start', minW: '110px', get: s => fmtDate(parseExt(s).rollout.civil_start_date) },
  { key: 'foundation_cast_date', label: 'Foundation Cast Date', minW: '150px', get: s => fmtDate(parseExt(s).rollout.foundation_cast_date) },
  { key: 'tower_erection_date', label: 'Tower Erection Date', minW: '150px', get: s => fmtDate(parseExt(s).rollout.tower_erection_date) },
  { key: 'expected_civil_completion_date', label: 'Expected Civil Completion', minW: '180px', get: s => fmtDate(parseExt(s).rollout.expected_civil_completion_date) },
  { key: 'actual_civil_rfi_date', label: 'Actual Civil RFI Date', minW: '160px', get: s => fmtDate(parseExt(s).rollout.actual_civil_rfi_date) },
  { key: 'target_on_air_date', label: 'Target On-Air Date', minW: '150px', get: s => fmtDate(parseExt(s).rollout.target_on_air_date) },
  { key: 'actual_on_air_date', label: 'Actual On-Air Date', minW: '150px', get: s => fmtDate(parseExt(s).rollout.actual_on_air_date) },
  { key: 'power_rfi_status', label: 'Power RFI Status', minW: '140px' },
  { key: 'rollout_submitted_at', label: 'Rollout Submitted', minW: '150px', get: s => (parseExt(s).rollout.submitted_at ? new Date(parseExt(s).rollout.submitted_at).toLocaleString() : '') },
  { key: 'notes', label: 'Comments', minW: '180px' },
];

export default function SiteMonitorTable({ sites, onFileUpdated }: SiteMonitorTableProps) {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('site_id_code');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const districts = useMemo(() => [...new Set(sites.map(s => s.district).filter(Boolean))].sort(), [sites]);

  const filtered = useMemo(() => {
    let result = sites;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.site_name?.toLowerCase().includes(q) ||
        s.site_id_code?.toLowerCase().includes(q) ||
        s.district?.toLowerCase().includes(q) ||
        s.vendor_name?.toLowerCase().includes(q)
      );
    }
    if (districtFilter !== 'all') result = result.filter(s => s.district === districtFilter);
    if (statusFilter !== 'all') result = result.filter(s => s.status === statusFilter);
    return result;
  }, [sites, search, districtFilter, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === 'rollout_progress') {
        av = computeRollout(a);
        bv = computeRollout(b);
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      av = cellValue(a, sortKey);
      bv = cellValue(b, sortKey);
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const exportCSV = () => {
    const header = ['SN', ...columns.map(c => c.label)].join(',');
    const rows = sorted.map((site, idx) =>
      [idx + 1, ...columns.map(c => {
        const v = cellValue(site, c.key);
        return `"${v.replace(/"/g, '""')}"`;
      })].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-monitor-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderDeploymentCell = (value: string) => {
    const colors = deploymentStatusColors[value] || '';
    const dot = deploymentStatusDots[value] || '';
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${colors}`}>
        {dot} {value || '-'}
      </span>
    );
  };

  const renderRolloutCell = (site: Site) => {
    const pct = computeRollout(site);
    const color = pct === 100 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-destructive';
    return (
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-semibold">{pct}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold">Site Monitor</h2>
        <Button size="sm" variant="outline" onClick={exportCSV}>
          <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search sites..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={districtFilter} onValueChange={setDistrictFilter}>
          <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">🟡 Pending</SelectItem>
            <SelectItem value="approved">🟢 Approved</SelectItem>
            <SelectItem value="rejected">🔴 Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{sorted.length} site{sorted.length !== 1 ? 's' : ''} shown</p>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 z-10 bg-muted/80 backdrop-blur-sm text-xs" style={{ minWidth: '40px' }}>SN</TableHead>
                {columns.map(col => (
                  <TableHead
                    key={col.key}
                    className="cursor-pointer select-none whitespace-nowrap text-xs hover:bg-muted/70 transition-colors"
                    style={{ minWidth: col.minW }}
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </span>
                  </TableHead>
                ))}
                <TableHead className="sticky right-0 z-10 bg-muted/80 backdrop-blur-sm text-xs" style={{ minWidth: '50px' }}>View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    No sites match the current filters.
                  </TableCell>
                </TableRow>
              ) : sorted.map((site, idx) => (
                <TableRow
                  key={site.id}
                  className="cursor-pointer hover:bg-accent/40 transition-colors text-xs"
                  onClick={() => setSelectedSite(site)}
                >
                  <TableCell className="sticky left-0 z-10 bg-card font-medium text-muted-foreground">{idx + 1}</TableCell>
                  {columns.map(col => (
                    <TableCell key={col.key} className="whitespace-nowrap">
                      {col.type === 'deployment' ? (
                        renderDeploymentCell(site[col.key] || 'Not Started')
                      ) : col.type === 'rollout' ? (
                        renderRolloutCell(site)
                      ) : col.key === 'notes' ? (
                        <span className="max-w-[200px] truncate block" title={cleanNote(site.notes)}>
                          {cellValue(site, col.key)}
                        </span>
                      ) : (
                        cellValue(site, col.key)
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="sticky right-0 z-10 bg-card">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={e => { e.stopPropagation(); setSelectedSite(site); }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSite} onOpenChange={open => { if (!open) setSelectedSite(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedSite?.site_id_code} — {selectedSite?.site_name}</DialogTitle></DialogHeader>
          {selectedSite && <SiteDetailsView site={selectedSite} allowFileManage onFileUpdated={onFileUpdated} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
