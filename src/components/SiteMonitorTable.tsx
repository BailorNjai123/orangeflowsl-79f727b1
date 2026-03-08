import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Download, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SiteDetailsView from '@/components/SiteDetailsView';

type Site = any;

interface SiteMonitorTableProps {
  sites: Site[];
  onFileUpdated?: () => void;
}

type SortKey = string;
type SortDir = 'asc' | 'desc';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  approved: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
};

const statusDots: Record<string, string> = {
  pending: '🟡',
  approved: '🟢',
  rejected: '🔴',
};

function cellValue(site: Site, key: string): string {
  const v = site[key];
  if (v === null || v === undefined || v === '') return '-';
  if (key === 'created_at' || key === 'last_inspection_date' || key === 'approval_date') {
    try { return new Date(v).toLocaleDateString(); } catch { return String(v); }
  }
  return String(v);
}

const columns: { key: string; label: string; group: string; minW?: string }[] = [
  // Site Information
  { key: 'site_name', label: 'Site Name', group: 'Site Information', minW: '160px' },
  { key: 'district', label: 'District', group: 'Site Information', minW: '120px' },
  { key: 'town', label: 'Town', group: 'Site Information', minW: '120px' },
  { key: 'latitude', label: 'Latitude', group: 'Site Information', minW: '100px' },
  { key: 'longitude', label: 'Longitude', group: 'Site Information', minW: '100px' },
  // Technical Details
  { key: 'site_type', label: 'Site Type', group: 'Technical Details', minW: '120px' },
  { key: 'site_configuration', label: 'Site Configuration', group: 'Technical Details', minW: '150px' },
  { key: 'antenna_type', label: 'Antenna Type', group: 'Technical Details', minW: '120px' },
  { key: 'number_of_antennas', label: 'Number of Antennas', group: 'Technical Details', minW: '140px' },
  { key: 'equipment_shelter', label: 'Equipment Shelter', group: 'Technical Details', minW: '140px' },
  // Power Details
  { key: 'power_source', label: 'Power Source', group: 'Power Details', minW: '220px' },
  { key: 'power_requirement', label: 'Power Requirement', group: 'Power Details', minW: '140px' },
  { key: 'backup_power', label: 'Backup Power', group: 'Power Details', minW: '120px' },
  // Access & Terrain
  { key: 'terrain_type', label: 'Terrain Type', group: 'Access & Terrain', minW: '120px' },
  { key: 'access_road_condition', label: 'Access Road Condition', group: 'Access & Terrain', minW: '160px' },
  // Approval & Monitoring
  { key: 'created_at', label: 'Planning Submission Date', group: 'Approval & Monitoring', minW: '160px' },
  { key: 'last_inspection_date', label: 'Last Inspection Date', group: 'Approval & Monitoring', minW: '150px' },
  { key: 'status', label: 'Approval Status', group: 'Approval & Monitoring', minW: '120px' },
  { key: 'approval_date', label: 'Approved Date', group: 'Approval & Monitoring', minW: '120px' },
  { key: 'notes', label: 'Comments', group: 'Approval & Monitoring', minW: '180px' },
];

export default function SiteMonitorTable({ sites, onFileUpdated }: SiteMonitorTableProps) {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [siteTypeFilter, setSiteTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const districts = useMemo(() => [...new Set(sites.map(s => s.district).filter(Boolean))].sort(), [sites]);
  const siteTypes = useMemo(() => [...new Set(sites.map(s => s.site_type).filter(Boolean))].sort(), [sites]);

  const filtered = useMemo(() => {
    let result = sites;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.site_name?.toLowerCase().includes(q) ||
        s.site_id_code?.toLowerCase().includes(q) ||
        s.district?.toLowerCase().includes(q) ||
        s.town?.toLowerCase().includes(q)
      );
    }
    if (districtFilter !== 'all') result = result.filter(s => s.district === districtFilter);
    if (siteTypeFilter !== 'all') result = result.filter(s => s.site_type === siteTypeFilter);
    if (statusFilter !== 'all') result = result.filter(s => s.status === statusFilter);
    return result;
  }, [sites, search, districtFilter, siteTypeFilter, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const exportCSV = () => {
    const header = columns.map(c => c.label).join(',');
    const rows = sorted.map(site =>
      columns.map(c => {
        const v = cellValue(site, c.key);
        return `"${v.replace(/"/g, '""')}"`;
      }).join(',')
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
        <Select value={siteTypeFilter} onValueChange={setSiteTypeFilter}>
          <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Site Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {siteTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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

      {/* Count */}
      <p className="text-xs text-muted-foreground">{sorted.length} site{sorted.length !== 1 ? 's' : ''} shown</p>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 z-10 bg-muted/80 backdrop-blur-sm" style={{ minWidth: '40px' }}>#</TableHead>
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
                      {col.key === 'status' ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColors[site.status] || ''}`}>
                          {statusDots[site.status] || ''} {site.status?.charAt(0).toUpperCase() + site.status?.slice(1)}
                        </span>
                      ) : col.key === 'notes' ? (
                        <span className="max-w-[200px] truncate block" title={site.notes || ''}>
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
