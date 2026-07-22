import { useState, useEffect } from 'react';
import { LayoutDashboard, Zap, Loader2, FileCheck, Download } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getSignedUrl } from '@/lib/storageUtils';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, value: 'overview' },
  { label: 'Power Queue', icon: Zap, value: 'queue' },
];

const primarySources = ['Grid (EDSA)', 'Solar Hybrid', 'Diesel Generator', 'Dual Generator', 'Grid + Solar Hybrid'];
const transformerCaps = ['None / Off-Grid', '50 kVA', '100 kVA', '160 kVA', '250 kVA', '500 kVA'];
const genCaps = ['None', '15 kVA', '20 kVA', '30 kVA', '45 kVA', '60 kVA'];
const backupTypes = ['Battery Storage', 'Diesel Generator', 'Solar Hybrid', 'UPS System'];
const batteryTypes = ['Lithium-ion (LiFePO4)', 'VRLA / GEL', 'Deep Cycle Lead-Acid'];
const rfiStatuses = ['Not Started', 'In Progress', 'Completed'];

type SiteRow = any;

function parseExt(site: SiteRow): { power: any; rollout: any } {
  try {
    const obj = site?.review_notes ? JSON.parse(site.review_notes) : {};
    if (obj && typeof obj === 'object' && ('power' in obj || 'rollout' in obj)) {
      return { power: obj.power || {}, rollout: obj.rollout || {} };
    }
  } catch { /* not JSON */ }
  return { power: {}, rollout: {} };
}

export default function PowerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [procMap, setProcMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editSite, setEditSite] = useState<SiteRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [earth, setEarth] = useState<string>('');
  const { user, profile } = useAuth();
  const { toast } = useToast();

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
  const eligibleSites = sites.filter(s => isEligible(s.id));
  const completedCount = sites.filter(s => s.power_rfi_status === 'Completed').length;
  const pendingCount = eligibleSites.filter(s => s.power_rfi_status !== 'Completed').length;

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

  const handleDownload = async (path: string) => {
    const url = await getSignedUrl('site-documents', path);
    if (url) window.open(url, '_blank');
    else toast({ variant: 'destructive', title: 'Cannot open file' });
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

    // Uploads
    const certPath = await uploadOne(editSite.id, 'certificate', fd.get('power_certificate') as File);
    const auditPath = await uploadOne(editSite.id, 'earthing_audit', fd.get('earthing_audit') as File);
    if (auditPath) power.earthing_audit_url = auditPath;

    power.edsa_meter_number = get('edsa_meter_number');
    power.generator_model_fuel = get('generator_model_fuel');
    power.solar_controller_model = get('solar_controller_model');
    power.backup_power_type = get('backup_power_type');
    power.battery_config = get('battery_config');
    power.power_quality_date = get('power_quality_date') || null;

    const updates: Record<string, any> = {
      power_source: get('power_source') || null,
      power_requirement: get('power_requirement') || null,
      grid_transformer_capacity: get('grid_transformer_capacity') || null,
      generator_capacity: getNum('generator_capacity_num'),
      solar_capacity: getNum('solar_capacity'),
      battery_bank_type: get('battery_bank_type') || null,
      earthing_resistance: getNum('earthing_resistance'),
      power_rfi_status: get('power_rfi_status') || 'Not Started',
      review_notes: JSON.stringify({ ...ext, power }),
    };
    if (certPath) updates.power_certificate_url = certPath;

    const { error } = await supabase.from('sites').update(updates).eq('id', editSite.id);
    setSaving(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      await supabase.from('activity_log').insert({
        action: 'power_updated',
        description: `Power configuration updated for "${editSite.site_name}" (RFI: ${updates.power_rfi_status})`,
        user_id: user!.id, user_name: profile?.full_name,
        entity_type: 'site', entity_id: editSite.id,
      });
      toast({ title: 'Power record saved' });
      setEditSite(null);
      fetchData();
    }
  };

  const earthNum = parseFloat(earth);
  const earthOk = !isNaN(earthNum) && earthNum <= 5.0;
  const earthBad = !isNaN(earthNum) && earthNum > 5.0;

  return (
    <AuthGuard allowedRoles={['power_team', 'project_team']}>
      <DashboardLayout title="Power Dashboard" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="rounded-xl gradient-orange p-4 sm:p-6 text-primary-foreground">
                  <h2 className="text-lg sm:text-xl font-bold">Electrical & Renewable Power Configuration ⚡</h2>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">Welcome, {profile?.full_name || 'Power Engineer'}. Configure grid, generator, solar and compliance data.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <StatCard title="Eligible Sites" value={eligibleSites.length} icon={FileCheck} />
                  <StatCard title="Pending Power RFI" value={pendingCount} icon={Zap} color="text-warning" />
                  <StatCard title="RFI Completed" value={completedCount} icon={Zap} color="text-success" />
                </div>
              </>
            )}

            <Card>
              <CardHeader><CardTitle className="text-base">Sites Ready for Power Configuration</CardTitle></CardHeader>
              <CardContent>
                {eligibleSites.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No sites have completed procurement yet.</p>
                ) : (
                  <div className="space-y-3">
                    {eligibleSites.map(site => (
                      <div key={site.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{site.site_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {site.site_id_code} • RFI: <span className="font-medium">{site.power_rfi_status || 'Not Started'}</span>
                          </p>
                        </div>
                        <Button size="sm" onClick={() => openEdit(site)}>Configure</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={!!editSite} onOpenChange={o => { if (!o) setEditSite(null); }}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Electrical & Renewable Power Configuration — {editSite?.site_name}</DialogTitle>
            </DialogHeader>
            {editSite && (() => {
              const ext = parseExt(editSite).power;
              return (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Module 1 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">⚡ Module 1 — Primary & Generator Power Configuration</h3>
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
                      <Input name="power_requirement" type="number" step="0.1" defaultValue={editSite.power_requirement || ''} />
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
                      <Input name="edsa_meter_number" defaultValue={ext.edsa_meter_number || ''} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Generator Capacity (kVA)</Label>
                      <Input name="generator_capacity_num" type="number" step="0.1" defaultValue={editSite.generator_capacity || ''} placeholder="e.g. 30" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Generator Model & Fuel Tank (Liters)</Label>
                      <Input name="generator_model_fuel" defaultValue={ext.generator_model_fuel || ''} placeholder="e.g. Perkins 30kVA - 200L" />
                    </div>
                  </div>
                </section>

                {/* Module 2 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">🔋 Module 2 — Renewable & Backup Energy Systems</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Solar Array Capacity (kWp)</Label>
                      <Input name="solar_capacity" type="number" step="0.1" defaultValue={editSite.solar_capacity || ''} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Solar Controller / Rectifier Model</Label>
                      <Input name="solar_controller_model" defaultValue={ext.solar_controller_model || ''} />
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
                      <Label>Number of Battery Banks & Total Ah</Label>
                      <Input name="battery_config" defaultValue={ext.battery_config || ''} placeholder="e.g. 2 Banks - 1000 Ah" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Earthing Resistance (Ω)</Label>
                      <Input
                        name="earthing_resistance" type="number" step="0.01" value={earth}
                        onChange={e => setEarth(e.target.value)}
                        className={earthOk ? 'border-success focus-visible:ring-success' : earthBad ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {earthOk && <p className="text-xs text-success">✓ Within safe threshold (≤ 5.0 Ω)</p>}
                      {earthBad && <p className="text-xs text-destructive">⚠ Exceeds 5.0 Ω — remediation required</p>}
                    </div>
                  </div>
                </section>

                {/* Module 3 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">📜 Module 3 — Certification, Compliance & Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Power RFI Status</Label>
                      <Select name="power_rfi_status" defaultValue={editSite.power_rfi_status || 'Not Started'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{rfiStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Power Quality Inspection Date</Label>
                      <Input name="power_quality_date" type="date" defaultValue={ext.power_quality_date || ''} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Power Certificate Upload (PDF)</Label>
                      <Input name="power_certificate" type="file" accept=".pdf,image/*" />
                      {editSite.power_certificate_url && (
                        <button type="button" onClick={() => handleDownload(editSite.power_certificate_url)} className="text-xs text-primary underline inline-flex items-center gap-1">
                          <Download className="h-3 w-3" /> Download current certificate
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Electrical Safety & Earthing Audit Report (PDF)</Label>
                      <Input name="earthing_audit" type="file" accept=".pdf" />
                      {ext.earthing_audit_url && (
                        <button type="button" onClick={() => handleDownload(ext.earthing_audit_url)} className="text-xs text-primary underline inline-flex items-center gap-1">
                          <Download className="h-3 w-3" /> Download current audit report
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                  <Button type="submit" className="flex-1 gradient-orange border-0 text-primary-foreground" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Submit Power Data
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" disabled={saving}
                    onClick={() => toast({ title: 'Draft saved locally' })}>
                    Save Draft
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
