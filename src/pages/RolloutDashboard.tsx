import { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Rocket, Loader2, CheckCircle2, Download, ClipboardCheck,
  FileText, ThumbsUp, ThumbsDown, Lock, Clock, XCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getSignedUrl, openFileInNewTab } from '@/lib/storageUtils';
import ProcSubmissionDetails from '@/components/ProcSubmissionDetails';
import ProcurementManagementView, { procurementStatusBadge } from '@/components/ProcurementManagement';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, value: 'overview' },
  { label: 'Site Feedback', icon: ClipboardCheck, value: 'feedback' },
  { label: 'Procurement Info', icon: FileText, value: 'procurement_info' },
  { label: 'Rollout Form', icon: FileText, value: 'form' },
];


const deploymentStatuses = ['Not Started', 'In Progress', 'Completed'];
const projectScopes = ['New Site Build', 'Technology Expansion', 'Equipment Swap', 'Capacity Upgrade', 'Colocation Upgrade'];
const civilContractors = ['Huawei', 'ZTE', 'Ericsson', 'Nokia', 'Local Civil Contractor', 'Other'];
const tiContractors = ['Huawei', 'ZTE', 'Ericsson', 'Nokia', 'Local TI Contractor', 'Other'];

const milestoneFields: Array<[string, string]> = [
  ['soil_test', 'Soil Test & Geotechnical Survey'],
  ['site_implementation_design', 'Site Implementation Design (SID)'],
  ['cast_status', 'Civil Foundation Cast'],
  ['tower_rig', 'Tower Rigging & Assembly'],
  ['civil_rfi', 'Civil RFI (Ready For Installation)'],
  ['power_rfi', 'Power RFI (auto-synced from Power Dashboard)'],
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

// [key, label, accept, maxMB, multi]
const uploadFields: Array<[string, string, string, number, boolean]> = [
  ['soil_report_url', 'Soil Test Report', '.pdf,image/jpeg,image/png', 10, false],
  ['sid_plan_url', 'Approved Site Layout Plan (SID)', '.pdf,.dwg', 15, false],
  ['civil_quality_cert_url', 'Civil RFI Quality Certificate', '.pdf', 10, false],
  ['post_erection_photos', 'Post-Erection Site Photos', 'image/jpeg,image/png', 10, true],
];

const PROC_BUCKET = 'procurement-documents';

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

function handoverBadge(status: string) {
  switch (status) {
    case 'accepted':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Accepted</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
    default:
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending Review</Badge>;
  }
}

export default function RolloutDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [procSubs, setProcSubs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Feedback modal state
  const [feedbackSite, setFeedbackSite] = useState<SiteRow | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  // Rollout form modal state
  const [editSite, setEditSite] = useState<SiteRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [milestones, setMilestones] = useState<Record<string, string>>({});

  const { user, profile, role } = useAuth();
  const { toast } = useToast();

  const canEdit = role === 'rollout_team' || role === 'project_team';

  const fetchData = async () => {
    setLoading(true);
    const [sitesRes, procRes] = await Promise.all([
      supabase.from('sites').select('*').order('created_at', { ascending: false }),
      supabase.from('procurement_submissions').select('*'),
    ]);
    if (sitesRes.data) setSites(sitesRes.data);
    if (procRes.data) {
      const map: Record<string, any> = {};
      procRes.data.forEach((p: any) => { map[p.site_id] = p; });
      setProcSubs(map);
    }
    setLoading(false);
  };
  useEffect(() => { if (user) fetchData(); }, [user]);

  // Sites handed over from procurement (status approved after procurement)
  const handoverPool = useMemo(
    () => sites.filter(s => s.status === 'approved' && !!procSubs[s.id]?.site_handover),
    [sites, procSubs],
  );

  const pendingFeedback = handoverPool.filter(s => (parseExt(s).feedback.status || 'pending') === 'pending');
  const acceptedSites = handoverPool.filter(s => parseExt(s).feedback.status === 'accepted');
  const rejectedSites = handoverPool.filter(s => parseExt(s).feedback.status === 'rejected');
  const onAirCount = sites.filter(s => s.on_air === 'Completed').length;

  // ---------------- Feedback flow ----------------
  const openFeedback = (site: SiteRow) => {
    setFeedbackSite(site);
    setFeedbackText(parseExt(site).feedback?.notes || '');
  };

  const submitFeedback = async (decision: 'accepted' | 'rejected') => {
    if (!feedbackSite) return;
    if (decision === 'rejected' && !feedbackText.trim()) {
      toast({ variant: 'destructive', title: 'Feedback required', description: 'Please explain why the handover is rejected.' });
      return;
    }
    setFeedbackSaving(true);
    const ext = parseExt(feedbackSite);
    const feedback = {
      status: decision,
      notes: feedbackText.trim(),
      reviewer_id: user!.id,
      reviewer_name: profile?.full_name || '',
      reviewed_at: new Date().toISOString(),
    };
    const rollout = { ...ext.rollout };
    if (decision === 'accepted' && !rollout.status) rollout.status = 'Pending Deployment';
    if (decision === 'rejected') rollout.status = 'Handover Rejected';

    const { error } = await supabase.from('sites').update({
      review_notes: JSON.stringify({ ...ext, feedback, rollout }),
    }).eq('id', feedbackSite.id);
    if (error) {
      setFeedbackSaving(false);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      return;
    }

    // Notify procurement team members
    const { data: procUsers } = await supabase
      .from('user_roles').select('user_id').eq('role', 'procurement_team');
    if (procUsers?.length) {
      const rows = procUsers.map((u: any) => ({
        user_id: u.user_id,
        title: decision === 'accepted' ? 'Rollout accepted handover' : 'Rollout rejected handover',
        message: `Site "${feedbackSite.site_name}" — ${decision === 'accepted' ? 'accepted' : 'rejected'} by Rollout. ${feedbackText.trim() ? 'Note: ' + feedbackText.trim() : ''}`.trim(),
        type: decision === 'accepted' ? 'success' : 'warning',
        link: '/procurement',
      }));
      await supabase.from('notifications').insert(rows);
    }

    await supabase.from('activity_log').insert({
      action: decision === 'accepted' ? 'rollout_handover_accepted' : 'rollout_handover_rejected',
      description: `Handover for "${feedbackSite.site_name}" ${decision} by Rollout${feedbackText.trim() ? ' — ' + feedbackText.trim() : ''}`,
      user_id: user!.id, user_name: profile?.full_name,
      entity_type: 'site', entity_id: feedbackSite.id,
    });

    toast({ title: decision === 'accepted' ? 'Handover accepted' : 'Handover rejected' });
    setFeedbackSaving(false);
    setFeedbackSite(null);
    setFeedbackText('');
    fetchData();
  };

  // ---------------- Rollout form flow ----------------
  const openEdit = (site: SiteRow) => {
    setEditSite(site);
    const init: Record<string, string> = {};
    milestoneFields.forEach(([k]) => { init[k] = site[k] || 'Not Started'; });
    setMilestones(init);
  };

  const completedCount = Object.values(milestones).filter(v => v === 'Completed').length;
  const progressPct = Math.round((completedCount / milestoneFields.length) * 100);

  const uploadOne = async (siteId: string, key: string, file: File | null, maxMB: number): Promise<string | null> => {
    if (!file || file.size === 0) return null;
    if (file.size > maxMB * 1024 * 1024) {
      toast({ variant: 'destructive', title: `${file.name} too large`, description: `Max ${maxMB}MB.` });
      return null;
    }
    const ext = file.name.split('.').pop();
    const path = `rollout/${siteId}/${Date.now()}_${key}.${ext}`;
    const { error } = await supabase.storage.from('site-documents').upload(path, file, { upsert: true });
    if (error) { toast({ variant: 'destructive', title: `Upload failed (${key})`, description: error.message }); return null; }
    return path;
  };

  const uploadMany = async (siteId: string, key: string, files: File[], maxMB: number): Promise<string[]> => {
    const out: string[] = [];
    for (const f of files) {
      const p = await uploadOne(siteId, key, f, maxMB);
      if (p) out.push(p);
    }
    return out;
  };

  const handleDownload = async (path: string) => {
    const ok = await openFileInNewTab('site-documents', path);
    if (!ok) toast({ variant: 'destructive', title: 'Cannot open file' });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editSite) return;
    if (!canEdit) {
      toast({ variant: 'destructive', title: 'Read-only', description: 'You do not have permission to edit rollout data.' });
      return;
    }
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => fd.get(k)?.toString().trim() || '';

    const ext = parseExt(editSite);
    const rollout = { ...ext.rollout };

    rollout.project_scope = get('scope');
    rollout.civil_contractor = get('civil_contractor');
    rollout.ti_contractor = get('ti_contractor');
    rollout.project_manager = get('project_manager');
    rollout.status = rollout.status || 'In Progress';

    for (const [k] of dateFields) rollout[k] = get(k) || null;

    for (const [k, , , maxMB, multi] of uploadFields) {
      if (multi) {
        const files = (fd.getAll(k) as File[]).filter(f => f && f.size > 0);
        if (files.length) {
          const paths = await uploadMany(editSite.id, k, files, maxMB);
          rollout[k] = [...(Array.isArray(rollout[k]) ? rollout[k] : []), ...paths];
        }
      } else {
        const p = await uploadOne(editSite.id, k, fd.get(k) as File, maxMB);
        if (p) rollout[k] = p;
      }
    }

    // Power RFI is READ-ONLY here — force it to whatever the sites record already has
    const enforcedMilestones: Record<string, string> = { ...milestones };
    enforcedMilestones.power_rfi = editSite.power_rfi || 'Not Started';

    const completed = Object.values(enforcedMilestones).filter(v => v === 'Completed').length;
    const pct = Math.round((completed / milestoneFields.length) * 100);

    const updates: Record<string, any> = {
      scope: get('scope') || null,
      vendor_name: get('civil_contractor') || null,
      contractor_name: get('civil_contractor') || null,
      handover_to_vendor: get('handover_to_vendor') || null,
      progress_percent: pct,
      review_notes: JSON.stringify({ ...ext, rollout }),
    };
    milestoneFields.forEach(([k]) => {
      if (k !== 'power_rfi') updates[k] = enforcedMilestones[k] || 'Not Started';
    });

    const { error } = await supabase.from('sites').update(updates).eq('id', editSite.id);
    setSaving(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      return;
    }
    await supabase.from('activity_log').insert({
      action: 'rollout_updated',
      description: `Rollout progress updated for "${editSite.site_name}" (${pct}%)`,
      user_id: user!.id, user_name: profile?.full_name,
      entity_type: 'site', entity_id: editSite.id,
    });
    // Notify admins
    const { data: admins } = await supabase.from('user_roles').select('user_id').eq('role', 'project_team');
    if (admins?.length) {
      await supabase.from('notifications').insert(admins.map((a: any) => ({
        user_id: a.user_id,
        title: 'Rollout form submitted',
        message: `${profile?.full_name || 'Rollout'} submitted rollout data for "${editSite.site_name}" (${pct}% complete).`,
        type: 'info', link: '/admin',
      })));
    }
    toast({ title: 'Rollout data submitted', description: 'Sent to Admin Dashboard for review.' });
    setEditSite(null);
    fetchData();
  };

  const activeRolloutSites = handoverPool.filter(s => parseExt(s).feedback.status === 'accepted');

  return (
    <AuthGuard allowedRoles={['rollout_team', 'project_team', 'planning_team', 'procurement_team', 'power_team']}>
      <DashboardLayout title="Rollout Dashboard" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {/* ================= OVERVIEW ================= */}
            {activeTab === 'overview' && (
              <>
                <div className="rounded-xl gradient-orange p-4 sm:p-6 text-primary-foreground">
                  <h2 className="text-lg sm:text-xl font-bold">Rollout Deployment Tracking 🚀</h2>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">
                    Welcome, {profile?.full_name || 'Rollout Engineer'}. Review handovers, track milestones, and submit rollout data to Admin.
                  </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard title="Pending Feedback" value={pendingFeedback.length} icon={ClipboardCheck} color="text-amber-600" />
                  <StatCard title="Accepted / Active" value={acceptedSites.length} icon={Rocket} />
                  <StatCard title="Rejected" value={rejectedSites.length} icon={XCircle} color="text-red-600" />
                  <StatCard title="On Air" value={onAirCount} icon={CheckCircle2} color="text-success" />
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-base">Rollout Site List</CardTitle></CardHeader>
                  <CardContent>
                    {handoverPool.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No handovers received from Procurement yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {handoverPool.map(site => {
                          const fb = parseExt(site).feedback;
                          return (
                            <div key={site.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border bg-muted/20">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{site.site_name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {site.site_id_code} • Progress: <span className="font-medium">{site.progress_percent || 0}%</span> • Power RFI: {site.power_rfi || 'Not Started'} • On Air: {site.on_air || 'Not Started'}
                                </p>
                              </div>
                              {handoverBadge(fb.status)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* ================= SITE FEEDBACK ================= */}
            {activeTab === 'feedback' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Procurement Handover Review</CardTitle>
                  <p className="text-xs text-muted-foreground">Review each site handed over from Procurement and accept or reject the handover.</p>
                </CardHeader>
                <CardContent>
                  {handoverPool.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No handovers awaiting review.</p>
                  ) : (
                    <div className="space-y-3">
                      {handoverPool.map(site => {
                        const fb = parseExt(site).feedback;
                        const status = fb.status || 'pending';
                        return (
                          <div key={site.id} className="p-3 rounded-lg border bg-card">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{site.site_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{site.site_id_code} • {site.location || 'N/A'}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {handoverBadge(status)}
                                {canEdit && (
                                  <Button size="sm" variant="outline" onClick={() => openFeedback(site)}>
                                    {status === 'pending' ? 'Review' : 'Update'}
                                  </Button>
                                )}
                              </div>
                            </div>
                            {fb.notes && (
                              <p className="mt-2 text-xs bg-muted/40 rounded p-2 border-l-2 border-primary">
                                <span className="font-medium">Feedback:</span> {fb.notes}
                                {fb.reviewer_name && <span className="text-muted-foreground"> — {fb.reviewer_name}</span>}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ================= PROCUREMENT INFO (READ-ONLY) ================= */}
            {activeTab === 'procurement_info' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Procurement Information (View Only)</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Sites released by Procurement. Rollout can view and download procurement records — editing is not permitted.
                  </p>
                </CardHeader>
                <CardContent>
                  {readyProcSites.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No procurement records marked "Ready for Handover" yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {readyProcSites.map(({ site, sub }) => (
                        <div key={sub.id} className="p-3 rounded-lg border bg-card flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{site?.site_name || 'Site'}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {site?.site_id_code} • PO {sub.po_number || '—'} • Delivery: {sub.material_delivery_status || 'Pending'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {procurementStatusBadge(sub.procurement_status)}
                            <Button size="sm" variant="outline" onClick={() => setProcView({ site, sub })}>View</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}



            {/* ================= ROLLOUT FORM ================= */}
            {activeTab === 'form' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rollout Form — Active Sites</CardTitle>
                  <p className="text-xs text-muted-foreground">Only sites you have accepted from Procurement appear here.</p>
                </CardHeader>
                <CardContent>
                  {activeRolloutSites.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No sites unlocked yet. Accept a handover in <span className="font-medium">Site Feedback</span> to begin.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeRolloutSites.map(site => (
                        <div key={site.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{site.site_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {site.site_id_code} • Progress: <span className="font-medium">{site.progress_percent || 0}%</span> • Power RFI: {site.power_rfi || 'Not Started'}
                            </p>
                          </div>
                          {canEdit ? (
                            <Button size="sm" onClick={() => openEdit(site)}>
                              {(site.progress_percent || 0) > 0 ? 'Edit & Resubmit' : 'Fill Form'}
                            </Button>
                          ) : (
                            <Badge variant="outline"><Lock className="h-3 w-3 mr-1" />Read-only</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ================= FEEDBACK DIALOG ================= */}
        <Dialog open={!!feedbackSite} onOpenChange={o => { if (!o) { setFeedbackSite(null); setFeedbackText(''); } }}>
          <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Handover Review — {feedbackSite?.site_name}</DialogTitle>
            </DialogHeader>
            {feedbackSite && (() => {
              const sub = procSubs[feedbackSite.id];
              const items: Array<[string, string]> = [
                ['land_identified', 'Land Identified'],
                ['ownership_verified', 'Ownership Verified'],
                ['acquisition_approved', 'Acquisition Approved'],
                ['lease_negotiation', 'Lease Negotiation'],
                ['lease_signed', 'Lease Signed'],
                ['lease_registration', 'Lease Registration'],
                ['road_access', 'Road Access'],
                ['vendor_contract', 'Vendor Contract'],
                ['site_handover', 'Site Handover'],
              ];
              return (
                <div className="space-y-4">
                  <section className="rounded-lg border p-3 bg-muted/30">
                    <p className="text-xs font-semibold mb-2 text-primary">Procurement Handover Details (read-only)</p>
                    {!sub ? (
                      <p className="text-xs text-muted-foreground">No procurement submission linked to this site.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {items.map(([k, label]) => (
                          <div key={k} className="flex items-center justify-between p-2 rounded bg-background border">
                            <span className="truncate mr-2">{label}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              {sub[k] ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                              {sub[`${k}_file_url`] && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await openFileInNewTab(PROC_BUCKET, sub[`${k}_file_url`]);
                                  }}
                                  className="text-primary underline"
                                >
                                  <Download className="h-3 w-3 inline" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {sub.notes && (
                          <div className="col-span-full text-xs p-2 rounded bg-background border">
                            <span className="font-medium">Procurement notes:</span> {sub.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </section>

                  <div className="space-y-1.5">
                    <Label>Feedback Comments {feedbackText.length > 0 ? '' : <span className="text-muted-foreground text-xs">(required for rejection)</span>}</Label>
                    <Textarea
                      rows={4}
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      placeholder="Explain acceptance reasons or reasons for rejection..."
                    />
                  </div>

                  {canEdit ? (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                      <Button
                        onClick={() => submitFeedback('accepted')}
                        disabled={feedbackSaving}
                        className="flex-1 gradient-orange border-0 text-primary-foreground"
                      >
                        {feedbackSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
                        Accept Site Handover
                      </Button>
                      <Button
                        onClick={() => submitFeedback('rejected')}
                        disabled={feedbackSaving}
                        variant="destructive"
                        className="flex-1"
                      >
                        {feedbackSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ThumbsDown className="h-4 w-4 mr-2" />}
                        Reject Site Handover
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center">Read-only view.</p>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* ================= ROLLOUT FORM DIALOG ================= */}
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

                  {/* Section 1 */}
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-primary">📂 Section 1 — Project Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Project Scope</Label>
                        <Select name="scope" defaultValue={editSite.scope || ext.project_scope || ''}>
                          <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
                          <SelectContent>{projectScopes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Civil Works Contractor</Label>
                        <Select name="civil_contractor" defaultValue={ext.civil_contractor || editSite.vendor_name || ''}>
                          <SelectTrigger><SelectValue placeholder="Select contractor" /></SelectTrigger>
                          <SelectContent>{civilContractors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Telecom Installation (TI) Contractor</Label>
                        <Select name="ti_contractor" defaultValue={ext.ti_contractor || ''}>
                          <SelectTrigger><SelectValue placeholder="Select TI contractor" /></SelectTrigger>
                          <SelectContent>{tiContractors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Project Manager / Site Engineer</Label>
                        <Input name="project_manager" defaultValue={ext.project_manager || ''} />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>Site Handover Date</Label>
                        <Input name="handover_to_vendor" type="date" defaultValue={editSite.handover_to_vendor || ''} />
                      </div>
                    </div>
                  </section>

                  {/* Section 2 */}
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-primary">📂 Section 2 — Deployment Milestones</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {milestoneFields.map(([name, label]) => {
                        const isPowerRfi = name === 'power_rfi';
                        return (
                          <div key={name} className="space-y-1.5">
                            <Label className="flex items-center gap-1.5">
                              {label}
                              {isPowerRfi && <Lock className="h-3 w-3 text-muted-foreground" />}
                            </Label>
                            <Select
                              value={milestones[name] || 'Not Started'}
                              onValueChange={v => setMilestones(m => ({ ...m, [name]: v }))}
                              disabled={isPowerRfi}
                            >
                              <SelectTrigger className={isPowerRfi ? 'opacity-70' : ''}><SelectValue /></SelectTrigger>
                              <SelectContent>{deploymentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Section 3 */}
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-primary">📂 Section 3 — Project Execution Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dateFields.map(([name, label]) => (
                        <div key={name} className="space-y-1.5">
                          <Label>{label}</Label>
                          <Input name={name} type="date" defaultValue={ext[name] || ''} />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Section 4 */}
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-primary">📂 Section 4 — Site Verification Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {uploadFields.map(([name, label, accept, maxMB, multi]) => {
                        const existing = ext[name];
                        return (
                          <div key={name} className="space-y-1.5">
                            <Label>{label} <span className="text-xs text-muted-foreground">(Max {maxMB}MB{multi ? ' each' : ''})</span></Label>
                            <Input name={name} type="file" accept={accept} multiple={multi} />
                            {multi && Array.isArray(existing) && existing.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {existing.map((p: string, i: number) => (
                                  <button key={i} type="button" onClick={() => handleDownload(p)} className="text-xs text-primary underline inline-flex items-center gap-1">
                                    <Download className="h-3 w-3" /> Photo {i + 1}
                                  </button>
                                ))}
                              </div>
                            )}
                            {!multi && typeof existing === 'string' && existing && (
                              <button type="button" onClick={() => handleDownload(existing)} className="text-xs text-primary underline inline-flex items-center gap-1">
                                <Download className="h-3 w-3" /> Download current file
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                    <Button type="submit" className="flex-1 gradient-orange border-0 text-primary-foreground" disabled={saving || !canEdit}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {(editSite.progress_percent || 0) > 0 ? 'Update & Resubmit to Admin' : 'Submit to Admin'}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" disabled={saving}
                      onClick={() => toast({ title: 'Draft kept', description: 'Your entries stay in the form until you close it.' })}>
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
