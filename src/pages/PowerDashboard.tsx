import { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Zap, Loader2, FileCheck, Download, Eye, Clock, CheckCircle2, Rocket, FileText } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { openFileInNewTab, downloadFile } from '@/lib/storageUtils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, value: 'overview' },
  { label: 'Power Form', icon: FileText, value: 'form' },
];

const primarySources = ['Grid (EDSA)', 'Solar Hybrid', 'Diesel Generator', 'Dual Generator', 'Grid + Solar Hybrid'];
const transformerCaps = ['None / Off-Grid', '50 kVA', '100 kVA', '160 kVA', '250 kVA', '500 kVA'];
const genCaps = ['None', '15 kVA', '20 kVA', '30 kVA', '45 kVA', '60 kVA'];
const backupTypes = ['Battery Storage', 'Diesel Generator', 'Solar Hybrid', 'UPS System'];
const batteryTypes = ['Lithium-ion (LiFePO4)', 'VRLA / GEL', 'Deep Cycle Lead-Acid'];
const rfiStatuses = ['Not Started', 'In Progress', 'Completed'];

// Rollout milestone columns used for progress recalculation
const milestoneCols = [
  'soil_test', 'site_implementation_design', 'cast_status',
  'tower_rig', 'civil_rfi', 'power_rfi', 'on_air',
];

type SiteRow = any;

function parseExt(site: SiteRow): { power: any; rollout: any; feedback: any } {
  try {
    const obj = site?.review_notes ? JSON.parse(site.review_notes) : {};
    if (obj && typeof obj === 'object') {
      return { power: obj.power || {}, rollout: obj.rollout || {}, feedback: obj.feedback || {} };
    }
  } catch { /* not JSON */ }
  return { power: {}, rollout: {}, feedback: {} };
}

function rfiBadge(status: string) {
  switch (status) {
    case 'Completed':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>;
    case 'In Progress':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">In Progress</Badge>;
    default:
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted">Not Started</Badge>;
  }
}

export default function PowerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [procMap, setProcMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editSite, setEditSite] = useState<SiteRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [earth, setEarth] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user, profile, role } = useAuth();
  const { toast } = useToast();

  const canEdit = role === 'power_team' || role === 'project_team';

  const fetchData = async () => {
    const [sitesRes, procRes] = await Promise.all([
      supabase.from('sites').select('*').order('created_at', { ascending: false }),
      supabase.from('procurement_submissions').select('site_id, status'),
    ]);
    if (sitesRes.data) setSites(sitesRes.data);
    if (procRes.data) {
      const map: Record<string, string> = {};
      procRes.data.forEach((p: any) => { map[p.site_id] = p.status; });
      setProcMap(map);
    }
    setLoading(false);
  };
  useEffect(() => { if (user) fetchData(); }, [user]);

  const isEligible = (siteId: string) => procMap[siteId] === 'approved';
  const eligibleSites = useMemo(() => sites.filter(s => isEligible(s.id)), [sites, procMap]);

  const completedCount = eligibleSites.filter(s => s.power_rfi_status === 'Completed').length;
  const inProgressCount = eligibleSites.filter(s => s.power_rfi_status === 'In Progress').length;
  const pendingCount = eligibleSites.filter(s => !s.power_rfi_status || s.power_rfi_status === 'Not Started').length;
  const waitingRollout = eligibleSites.filter(s => s.power_rfi_status === 'Completed' && s.on_air !== 'Completed').length;

  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase();
    return eligibleSites.filter(s => {
      const status = s.power_rfi_status || 'Not Started';
      if (filterStatus !== 'all' && status !== filterStatus) return false;
      if (!q) return true;
      return [s.site_id_code, s.site_name, s.region, s.power_source]
        .some((v: any) => (v || '').toString().toLowerCase().includes(q));
    });
  }, [eligibleSites, search, filterStatus]);

  const openEdit = (site: SiteRow) => {
    setEditSite(site);
    setEarth(site.earthing_resistance != null ? String(site.earthing_resistance) : '');
  };

  const uploadOne = async (siteId: string, key: string, file: File | null): Promise<string | null> => {
    if (!file || file.size === 0) return null;
    const ext = file.name.split('.').pop();
    const path = `power/${siteId}/${Date.now()}_${key}.${ext}`;
    const { error } = await supabase.storage.from('site-documents').upload(path, file, { upsert: true });
    if (error) { toast({ variant: 'destructive', title: `Upload failed (${key})`, description: error.message }); return null; }
    return path;
  };

  const handleView = async (path: string) => {
    const ok = await openFileInNewTab('site-documents', path);
    if (!ok) toast({ variant: 'destructive', title: 'Cannot open file' });
  };
  const handleDownload = async (path: string) => {
    const ok = await downloadFile('site-documents', path);
    if (!ok) toast({ variant: 'destructive', title: 'Cannot download file' });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editSite) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => fd.get(k)?.toString().trim() || '';
    const getNum = (k: string) => { const v = fd.get(k)?.toString(); return v ? parseFloat(v) : null; };

    const ext = parseExt(editSite);
    const power = { ...ext.power };

    const certPath = await uploadOne(editSite.id, 'certificate', fd.get('power_certificate') as File);
    const auditPath = await uploadOne(editSite.id, 'earthing_audit', fd.get('earthing_audit') as File);
    if (auditPath) power.earthing_audit_url = auditPath;

    power.edsa_meter_number = get('edsa_meter_number');
    power.generator_capacity = get('generator_capacity');
    power.generator_model_fuel = get('generator_model_fuel');
    power.solar_controller_model = get('solar_controller_model');
    power.backup_power_type = get('backup_power_type');
    power.battery_config = get('battery_config');
    power.power_quality_date = get('power_quality_date') || null;

    const prevStatus = editSite.power_rfi_status || 'Not Started';
    const newStatus = get('power_rfi_status') || 'Not Started';
    const justCompleted = newStatus === 'Completed';

    const updates: Record<string, any> = {
      power_source: get('power_source') || null,
      power_requirement: get('power_requirement') || null,
      grid_transformer_capacity: get('grid_transformer_capacity') || null,
      generator_capacity: (() => { const g = get('generator_capacity'); const n = parseFloat(g); return isNaN(n) ? null : n; })(),
      solar_capacity: getNum('solar_capacity'),
      battery_bank_type: get('battery_bank_type') || null,
      earthing_resistance: getNum('earthing_resistance'),
      power_rfi_status: newStatus,
      review_notes: JSON.stringify({ ...ext, power }),
    };
    if (certPath) updates.power_certificate_url = certPath;

    // ---- Automation: sync Power RFI into the Rollout milestone + progress ----
    if (justCompleted) {
      updates.power_rfi = 'Completed';
      const merged: SiteRow = { ...editSite, power_rfi: 'Completed' };
      const done = milestoneCols.filter(c => merged[c] === 'Completed').length;
      updates.progress_percent = Math.round((done / milestoneCols.length) * 100);
    }

    const { error } = await supabase.from('sites').update(updates).eq('id', editSite.id);
    setSaving(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      return;
    }

    await supabase.from('activity_log').insert({
      action: justCompleted ? 'power_rfi_completed' : 'power_updated',
      description: `Power configuration updated for "${editSite.site_name}" (${editSite.site_id_code || 'N/A'}) — Power RFI: ${prevStatus} → ${newStatus} at ${new Date().toLocaleString()}`,
      user_id: user!.id, user_name: profile?.full_name,
      entity_type: 'site', entity_id: editSite.id,
    });

    if (justCompleted && prevStatus !== 'Completed') {
      const { data: recipients } = await supabase
        .from('user_roles').select('user_id, role').in('role', ['rollout_team', 'project_team']);
      if (recipients?.length) {
        await supabase.from('notifications').insert(recipients.map((r: any) => ({
          user_id: r.user_id,
          title: r.role === 'rollout_team' ? 'Power RFI Completed' : 'Power RFI synchronized',
          message: r.role === 'rollout_team'
            ? `Power RFI completed for "${editSite.site_name}" (${editSite.site_id_code || 'N/A'}). Deployment may continue.`
            : `Power RFI for "${editSite.site_name}" was completed and synced to Rollout (${updates.progress_percent}% progress).`,
          type: 'success',
          link: r.role === 'rollout_team' ? '/rollout' : '/admin',
        })));
      }
    }

    toast({
      title: 'Power record saved',
      description: justCompleted ? 'Rollout Power RFI milestone synchronized automatically.' : undefined,
    });
    setEditSite(null);
    fetchData();
  };

  const earthNum = parseFloat(earth);
  const earthOk = !isNaN(earthNum) && earthNum <= 5.0;
  const earthBad = !isNaN(earthNum) && earthNum > 5.0;

  const renderSiteList = (list: SiteRow[], withAction: boolean) => (
    list.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-8">No sites match the current filters.</p>
    ) : (
      <div className="space-y-2">
        {list.map(site => (
          <div key={site.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border bg-muted/20">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{site.site_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {site.site_id_code || 'N/A'} • {site.region || 'N/A'} • Source: {site.power_source || 'N/A'} • Gen: {site.generator_capacity ? `${site.generator_capacity} kVA` : 'N/A'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Last updated: {site.updated_at ? new Date(site.updated_at).toLocaleString() : '—'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {rfiBadge(site.power_rfi_status || 'Not Started')}
              {withAction && canEdit && <Button size="sm" onClick={() => openEdit(site)}>Configure</Button>}
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <AuthGuard allowedRoles={['power_team', 'project_team', 'planning_team', 'procurement_team', 'rollout_team']}>
      <DashboardLayout title="Power Dashboard" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="rounded-xl gradient-orange p-4 sm:p-6 text-primary-foreground">
                  <h2 className="text-lg sm:text-xl font-bold">Electrical &amp; Renewable Power Configuration ⚡</h2>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">
                    Welcome, {profile?.full_name || 'Power Engineer'}. Configure grid, generator, solar and compliance data.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <StatCard title="Total Assigned Sites" value={eligibleSites.length} icon={FileCheck} />
                  <StatCard title="Pending Installation" value={pendingCount} icon={Clock} color="text-muted-foreground" />
                  <StatCard title="In Progress" value={inProgressCount} icon={Zap} color="text-warning" />
                  <StatCard title="Completed Power RFI" value={completedCount} icon={CheckCircle2} color="text-success" />
                  <StatCard title="Waiting for Rollout" value={waitingRollout} icon={Rocket} color="text-amber-600" />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Power Site List</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Input
                        placeholder="Search site ID, name, region or source..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="sm:max-w-xs"
                      />
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="sm:w-52"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All RFI Statuses</SelectItem>
                          {rfiStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>{renderSiteList(filteredSites, false)}</CardContent>
                </Card>
              </>
            )}

            {activeTab === 'form' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Power Form — Assigned Sites</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {canEdit ? 'Select a site to record its power configuration.' : 'Read-only view — only the Power team and Admin can edit.'}
                  </p>
                </CardHeader>
                <CardContent>
                  {eligibleSites.length === 0
                    ? <p className="text-sm text-muted-foreground text-center py-8">No sites have completed procurement yet.</p>
                    : renderSiteList(eligibleSites, true)}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Dialog open={!!editSite} onOpenChange={o => { if (!o) setEditSite(null); }}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Electrical &amp; Renewable Power Configuration — {editSite?.site_name}</DialogTitle>
            </DialogHeader>
            {editSite && (() => {
              const ext = parseExt(editSite).power;
              return (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Module 1 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">⚡ Module 1 — Primary &amp; Generator Power Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Primary Power Source</Label>
                      <Select name="power_source" defaultValue={editSite.power_source || ''}>
                        <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                        <SelectContent>{primarySources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Power Requirement (kW)</Label>
                      <Input name="power_requirement" type="number" step="0.1" min="0" placeholder="e.g. 15.5" defaultValue={editSite.power_requirement || ''} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Grid Transformer Capacity</Label>
                      <Select name="grid_transformer_capacity" defaultValue={editSite.grid_transformer_capacity || ''}>
                        <SelectTrigger><SelectValue placeholder="Select capacity" /></SelectTrigger>
                        <SelectContent>{transformerCaps.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>EDSA Meter Number</Label>
                      <Input name="edsa_meter_number" defaultValue={ext.edsa_meter_number || ''} placeholder="Numeric or alphanumeric" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Generator Capacity</Label>
                      <Select name="generator_capacity" defaultValue={ext.generator_capacity || (editSite.generator_capacity ? `${editSite.generator_capacity} kVA` : '')}>
                        <SelectTrigger><SelectValue placeholder="Select capacity" /></SelectTrigger>
                        <SelectContent>{genCaps.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Generator Model &amp; Fuel Tank Capacity (Liters)</Label>
                      <Input name="generator_model_fuel" defaultValue={ext.generator_model_fuel || ''} placeholder="e.g. FG Wilson 20kVA – 500L External Tank" />
                    </div>
                  </div>
                </section>

                {/* Module 2 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">🔋 Module 2 — Renewable &amp; Backup Energy Systems</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Solar Array Capacity (kWp)</Label>
                      <Input name="solar_capacity" type="number" step="0.1" min="0" placeholder="e.g. 12.0" defaultValue={editSite.solar_capacity || ''} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Solar Controller / Rectifier Model</Label>
                      <Input name="solar_controller_model" defaultValue={ext.solar_controller_model || ''} placeholder="e.g. Huawei ETP48400" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Backup Power Type</Label>
                      <Select name="backup_power_type" defaultValue={ext.backup_power_type || ''}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{backupTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Battery Bank Type</Label>
                      <Select name="battery_bank_type" defaultValue={editSite.battery_bank_type || ''}>
                        <SelectTrigger><SelectValue placeholder="Select battery" /></SelectTrigger>
                        <SelectContent>{batteryTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Number of Battery Banks &amp; Total Ah Capacity</Label>
                      <Input name="battery_config" defaultValue={ext.battery_config || ''} placeholder="e.g. 2 Banks – 1000 Ah" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Earthing Resistance (Ω)</Label>
                      <Input
                        name="earthing_resistance" type="number" step="0.01" min="0" value={earth}
                        onChange={e => setEarth(e.target.value)}
                        className={earthOk ? 'border-success focus-visible:ring-success' : earthBad ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {earthOk && <p className="text-xs text-success">✓ PASS — within safe threshold (≤ 5.0 Ω)</p>}
                      {earthBad && <p className="text-xs text-destructive">⚠ FAIL — exceeds 5.0 Ω, remediation required</p>}
                    </div>
                  </div>
                </section>

                {/* Module 3 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">📜 Module 3 — Certification, Compliance &amp; Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Power RFI Status</Label>
                      <Select name="power_rfi_status" defaultValue={editSite.power_rfi_status || 'Not Started'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{rfiStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">Setting this to “Completed” auto-syncs the Rollout Power RFI milestone.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Power Quality Inspection Date</Label>
                      <Input name="power_quality_date" type="date" defaultValue={ext.power_quality_date || ''} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Power Certificate Upload (PDF)</Label>
                      <Input name="power_certificate" type="file" accept=".pdf" />
                      {editSite.power_certificate_url && (
                        <div className="flex flex-wrap gap-3">
                          <button type="button" onClick={() => handleView(editSite.power_certificate_url)} className="text-xs text-primary underline inline-flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Preview
                          </button>
                          <button type="button" onClick={() => handleDownload(editSite.power_certificate_url)} className="text-xs text-primary underline inline-flex items-center gap-1">
                            <Download className="h-3 w-3" /> Download
                          </button>
                          <span className="text-xs text-muted-foreground">Choose a file above to replace</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Electrical Safety &amp; Earthing Audit Report (PDF)</Label>
                      <Input name="earthing_audit" type="file" accept=".pdf" />
                      {ext.earthing_audit_url && (
                        <div className="flex flex-wrap gap-3">
                          <button type="button" onClick={() => handleView(ext.earthing_audit_url)} className="text-xs text-primary underline inline-flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Preview
                          </button>
                          <button type="button" onClick={() => handleDownload(ext.earthing_audit_url)} className="text-xs text-primary underline inline-flex items-center gap-1">
                            <Download className="h-3 w-3" /> Download
                          </button>
                          <span className="text-xs text-muted-foreground">Choose a file above to replace</span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                  <Button type="submit" className="flex-1 gradient-orange border-0 text-primary-foreground" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Submit Power Data
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" disabled={saving}
                    onClick={() => setEditSite(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
              );
            })()}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  );
}
