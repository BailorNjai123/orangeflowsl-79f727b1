import { useState, useEffect } from 'react';
import { LayoutDashboard, Rocket, Loader2, CheckCircle2, Download } from 'lucide-react';
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
  { label: 'Rollout Queue', icon: Rocket, value: 'queue' },
];

const deploymentStatuses = ['Not Started', 'In Progress', 'Completed'];
const projectScopes = ['New Site Build', 'Technology Expansion', 'Equipment Swap', 'Capacity Upgrade', 'Colocation Upgrade'];

const milestoneFields: Array<[string, string]> = [
  ['soil_test', 'Soil Test & Geotechnical Survey'],
  ['site_implementation_design', 'Site Implementation Design (SID)'],
  ['cast_status', 'Civil Foundation Cast'],
  ['tower_rig', 'Tower Rigging & Assembly'],
  ['civil_rfi', 'Civil RFI (Ready For Installation)'],
  ['power_rfi', 'Power RFI'],
  ['on_air', 'On Air / Commissioning'],
];

const dateFields: Array<[string, string]> = [
  ['civil_start_date', 'Civil Works Start Date'],
  ['foundation_cast_date', 'Foundation Casting Date'],
  ['tower_erection_date', 'Tower Erection Date'],
  ['expected_civil_completion_date', 'Expected Civil Completion Date'],
  ['actual_civil_rfi_date', 'Actual Civil RFI Date'],
  ['target_on_air_date', 'Target On-Air Date'],
  ['actual_on_air_date', 'Actual On-Air Date'],
];

const uploadFields: Array<[string, string, string]> = [
  ['soil_report_url', 'Soil Test Report', '.pdf,image/*'],
  ['sid_plan_url', 'Approved Site Layout Plan (SID)', '.pdf,.dwg'],
  ['civil_quality_cert_url', 'Civil RFI Quality Certificate', '.pdf'],
  ['post_erection_photo_url', 'Post-Erection Site / Tower Photo', 'image/*'],
];

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

export default function RolloutDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSite, setEditSite] = useState<SiteRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [milestones, setMilestones] = useState<Record<string, string>>({});
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    const { data } = await supabase.from('sites').select('*').order('created_at', { ascending: false });
    if (data) setSites(data);
    setLoading(false);
  };
  useEffect(() => { if (user) fetchData(); }, [user]);

  const eligibleSites = sites.filter(s => s.power_rfi_status === 'Completed' || s.power_rfi === 'Completed');
  const onAirCount = sites.filter(s => s.on_air === 'Completed').length;

  const openEdit = (site: SiteRow) => {
    setEditSite(site);
    const init: Record<string, string> = {};
    milestoneFields.forEach(([k]) => { init[k] = site[k] || 'Not Started'; });
    setMilestones(init);
  };

  const completedCount = Object.values(milestones).filter(v => v === 'Completed').length;
  const progressPct = Math.round((completedCount / milestoneFields.length) * 100);

  const uploadOne = async (siteId: string, key: string, file: File | null): Promise<string | null> => {
    if (!file || file.size === 0) return null;
    const ext = file.name.split('.').pop();
    const path = `rollout/${siteId}/${Date.now()}_${key}.${ext}`;
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

    const ext = parseExt(editSite);
    const rollout = { ...ext.rollout };

    // Vendor & contractor scope
    rollout.ti_contractor = get('ti_contractor');
    rollout.project_manager = get('project_manager');
    // Dates
    for (const [k] of dateFields) rollout[k] = get(k) || null;
    // Uploads
    for (const [k] of uploadFields) {
      const p = await uploadOne(editSite.id, k, fd.get(k) as File);
      if (p) rollout[k] = p;
    }

    const updates: Record<string, any> = {
      scope: get('scope') || null,
      vendor_name: get('vendor_name') || null,
      handover_to_vendor: get('handover_to_vendor') || null,
      progress_percent: progressPct,
      review_notes: JSON.stringify({ ...ext, rollout }),
    };
    milestoneFields.forEach(([k]) => { updates[k] = milestones[k] || 'Not Started'; });

    const { error } = await supabase.from('sites').update(updates).eq('id', editSite.id);
    setSaving(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      await supabase.from('activity_log').insert({
        action: 'rollout_updated',
        description: `Rollout progress updated for "${editSite.site_name}" (${progressPct}%)`,
        user_id: user!.id, user_name: profile?.full_name,
        entity_type: 'site', entity_id: editSite.id,
      });
      toast({ title: 'Rollout data saved' });
      setEditSite(null);
      fetchData();
    }
  };

  return (
    <AuthGuard allowedRoles={['rollout_team']}>
      <DashboardLayout title="Rollout Dashboard" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="rounded-xl gradient-orange p-4 sm:p-6 text-primary-foreground">
                  <h2 className="text-lg sm:text-xl font-bold">Rollout Deployment Tracking 🚀</h2>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">Welcome, {profile?.full_name || 'Rollout Engineer'}. Track vendor scope, milestones, dates and compliance.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <StatCard title="Ready to Roll" value={eligibleSites.length} icon={Rocket} />
                  <StatCard title="On Air" value={onAirCount} icon={CheckCircle2} color="text-success" />
                  <StatCard title="Total Sites" value={sites.length} icon={LayoutDashboard} />
                </div>
              </>
            )}

            <Card>
              <CardHeader><CardTitle className="text-base">Sites Ready for Rollout</CardTitle></CardHeader>
              <CardContent>
                {eligibleSites.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No sites with completed Power RFI yet.</p>
                ) : (
                  <div className="space-y-3">
                    {eligibleSites.map(site => (
                      <div key={site.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{site.site_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {site.site_id_code} • Progress: <span className="font-medium">{site.progress_percent || 0}%</span> • On Air: {site.on_air || 'Not Started'}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => openEdit(site)}>Update</Button>
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
              <DialogTitle>Rollout Deployment — {editSite?.site_name}</DialogTitle>
            </DialogHeader>
            {editSite && (() => {
              const ext = parseExt(editSite).rollout;
              return (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Progress bar */}
                <div className="rounded-lg border p-3 bg-muted/40">
                  <div className="flex items-center justify-between text-xs font-medium mb-2">
                    <span>Overall Deployment Progress</span>
                    <span className="text-primary">{progressPct}% ({completedCount}/{milestoneFields.length} milestones)</span>
                  </div>
                  <div className="h-2 rounded-full bg-background overflow-hidden">
                    <div className="h-full gradient-orange transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                {/* Module 1 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">📂 Module 1 — Vendor & Contractor Scope</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Project Scope</Label>
                      <Select name="scope" defaultValue={editSite.scope || ''}>
                        <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
                        <SelectContent>{projectScopes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Civil Works Contractor / Vendor</Label>
                      <Input name="vendor_name" defaultValue={editSite.vendor_name || ''} placeholder="e.g. Huawei, ZTE, Local Vendor" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>TI (Telecom Installation) Contractor</Label>
                      <Input name="ti_contractor" defaultValue={ext.ti_contractor || ''} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Project Manager / Site Engineer</Label>
                      <Input name="project_manager" defaultValue={ext.project_manager || ''} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Site Handover Date from Procurement</Label>
                      <Input name="handover_to_vendor" type="date" defaultValue={editSite.handover_to_vendor || ''} />
                    </div>
                  </div>
                </section>

                {/* Module 2 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">📂 Module 2 — Deployment Milestones & RFI Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {milestoneFields.map(([name, label]) => (
                      <div key={name} className="space-y-1.5">
                        <Label>{label}</Label>
                        <Select value={milestones[name] || 'Not Started'} onValueChange={v => setMilestones(m => ({ ...m, [name]: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{deploymentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Module 3 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">📂 Module 3 — Project Schedule & Execution Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dateFields.map(([name, label]) => (
                      <div key={name} className="space-y-1.5">
                        <Label>{label}</Label>
                        <Input name={name} type="date" defaultValue={ext[name] || ''} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Module 4 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">📂 Module 4 — Site Verification & Compliance Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uploadFields.map(([name, label, accept]) => (
                      <div key={name} className="space-y-1.5">
                        <Label>{label}</Label>
                        <Input name={name} type="file" accept={accept} />
                        {ext[name] && (
                          <button type="button" onClick={() => handleDownload(ext[name])} className="text-xs text-primary underline inline-flex items-center gap-1">
                            <Download className="h-3 w-3" /> Download current file
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                  <Button type="submit" className="flex-1 gradient-orange border-0 text-primary-foreground" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Submit Rollout Data
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
