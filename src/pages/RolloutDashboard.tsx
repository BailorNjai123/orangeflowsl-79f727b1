import { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Rocket, Loader2, CheckCircle2, Download, ClipboardCheck,
  FileText, ThumbsUp, ThumbsDown, Lock, Clock, XCircle, ChevronDown, HardHat,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
import ProcurementManagementView, { procurementStatusBadge } from '@/components/ProcurementManagement';
import RolloutProcurementReadiness, { RolloutReadinessTracker } from '@/components/RolloutProcurementReadiness';


const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, value: 'overview' },
  { label: 'Site Feedback', icon: ClipboardCheck, value: 'feedback' },
  { label: 'Procurement Info', icon: FileText, value: 'procurement_info' },
  { label: 'Rollout Form', icon: FileText, value: 'form' },
];


const deploymentStatuses = ['Not Started', 'In Progress', 'Completed'];
const projectScopes = ['New Site Build', 'Technology Expansion', 'Equipment Swap', 'Capacity Upgrade', 'Colocation Upgrade'];
const siteTypes = ['Densification', 'New Coverage', 'B2B', 'DRS'];
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

const unexpectedConditions = [
  'None', 'Rocky Ground', 'Hard Soil', 'Soft/Unstable Soil', 'Swampy/Waterlogged Area',
  'Steep/Hilly Terrain', 'Existing Underground Obstruction', 'Other',
];
const extraWorkTypes = [
  'Rock Excavation', 'Additional Excavation', 'Additional Foundation Work', 'Soil Replacement',
  'Dewatering', 'Additional Concrete Work', 'Additional Reinforcement', 'Ground Stabilisation', 'Other',
];
const extraWorkStatuses = ['Draft', 'Submitted for Review', 'Approved', 'Rejected', 'Completed'];



type SiteRow = any;

function rawNotesObj(site: SiteRow): any | null {
  try {
    const obj = site?.review_notes ? JSON.parse(site.review_notes) : null;
    return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : null;
  } catch { return null; }
}

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
  const [procView, setProcView] = useState<{ site: any; sub: any } | null>(null);

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  // Rollout form modal state
  const [editSite, setEditSite] = useState<SiteRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [milestones, setMilestones] = useState<Record<string, string>>({});
  const [formKey, setFormKey] = useState(0);

  // Extra Work / Unexpected Site Conditions (additive, collapsed by default)
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraRequired, setExtraRequired] = useState('No');



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

  // Live link: refresh whenever Procurement updates a submission or a site
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('rollout-procurement-link')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'procurement_submissions' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);


  // Statuses at which Procurement releases a site to Rollout
  const RELEASED = ['Ready for Handover', 'Handed Over to Rollout', 'Completed'];

  // Any site with a submitted Procurement form reaches Rollout (Site Feedback
  // + Rollout Form). Released records are simply prioritised in the list.
  const handoverPool = useMemo(
    () => sites
      .filter(s => {
        const sub = procSubs[s.id];
        return !!sub && s.status !== 'rejected';
      })
      .sort((a, b) => {
        const sa = procSubs[a.id], sb = procSubs[b.id];
        const rank = (x: any) =>
          Number(!!x?.site_handover || !!x?.handover_to_vendor || RELEASED.includes(x?.procurement_status));
        return rank(sb) - rank(sa);
      }),
    [sites, procSubs],
  );

  // Every submitted Procurement form is visible to Rollout (view-only),
  // released records first.
  const readyProcSites = useMemo(() => {
    return Object.values(procSubs)
      .filter((sub: any) => !!sub)
      .sort((a: any, b: any) => Number(RELEASED.includes(b?.procurement_status)) - Number(RELEASED.includes(a?.procurement_status)))
      .map((sub: any) => ({ sub, site: sites.find(s => s.id === sub.site_id) }));
  }, [procSubs, sites]);



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
      review_notes: JSON.stringify({ ...(rawNotesObj(feedbackSite) || {}), ...ext, feedback, rollout }),
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
      await supabase.rpc('send_workflow_notification', {
        _user_ids: procUsers.map((u: any) => u.user_id),
        _title: decision === 'accepted' ? 'Rollout accepted handover' : 'Rollout rejected handover',
        _message: `Site "${feedbackSite.site_name}" — ${decision === 'accepted' ? 'accepted' : 'rejected'} by Rollout. ${feedbackText.trim() ? 'Note: ' + feedbackText.trim() : ''}`.trim(),
        _type: decision === 'accepted' ? 'success' : 'warning',
        _link: '/procurement',
      });
    }

    await supabase.from('activity_log').insert({
      action: decision === 'accepted' ? 'rollout_handover_accepted' : 'rollout_handover_rejected',
      description: `Handover for "${feedbackSite.site_name}" ${decision} by Rollout${feedbackText.trim() ? ' — ' + feedbackText.trim() : ''}`,
      user_id: user!.id, user_name: profile?.full_name,
      entity_type: 'site', entity_id: feedbackSite.id,
    });

    const acceptedSite = feedbackSite;
    toast({
      title: decision === 'accepted' ? 'Handover accepted' : 'Handover rejected',
      description: decision === 'accepted' ? 'Site unlocked in the Rollout Form.' : undefined,
    });
    setFeedbackSaving(false);
    setFeedbackSite(null);
    setFeedbackText('');
    await fetchData();

    // Accepted sites move straight into the Rollout Form for completion
    if (decision === 'accepted') {
      setActiveTab('form');
      const { data: fresh } = await supabase.from('sites').select('*').eq('id', acceptedSite.id).maybeSingle();
      if (fresh) openEdit(fresh as SiteRow);
    }
  };

  // ---------------- Rollout form flow ----------------
  const openEdit = (site: SiteRow) => {
    setEditSite(site);
    const init: Record<string, string> = {};
    milestoneFields.forEach(([k]) => { init[k] = site[k] || 'Not Started'; });
    setMilestones(init);
    const ew = parseExt(site).rollout?.extra_work;
    setExtraRequired(ew?.extra_work_required || 'No');
    setExtraOpen(false);
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
    rollout.site_type = get('site_type');
    rollout.civil_contractor = get('civil_contractor');
    rollout.ti_contractor = get('ti_contractor');
    rollout.project_manager = get('project_manager');
    rollout.status = rollout.status || 'In Progress';
    rollout.submitted_at = new Date().toISOString();
    rollout.submitted_by = profile?.full_name || '';
    rollout.submission_count = (Number(rollout.submission_count) || 0) + 1;


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

    // ---- Extra Work / Unexpected Site Conditions (only stored when actually filled) ----
    {
      const prev = rollout.extra_work || {};
      const condition = get('ew_condition');
      const required = get('ew_required') || 'No';
      const ew: any = {
        ...prev,
        site_id_code: editSite.site_id_code,
        site_name: editSite.site_name,
        unexpected_condition: condition,
        extra_work_required: required,
        work_type: required === 'Yes' ? get('ew_type') : '',
        description: required === 'Yes' ? get('ew_description') : '',
        estimated_cost: required === 'Yes' ? get('ew_cost') : '',
        estimated_duration_days: required === 'Yes' ? get('ew_duration') : '',
        status: get('ew_status') || prev.status || 'Draft',
      };

      const newDocs = (fd.getAll('ew_documents') as File[]).filter(f => f && f.size > 0);
      if (newDocs.length) {
        const paths = await uploadMany(editSite.id, 'extra_work_doc', newDocs, 15);
        const metas = newDocs.map(f => ({
          file_name: f.name,
          file_size: f.size,
          uploaded_at: new Date().toISOString(),
          uploaded_by: profile?.full_name || '',
        }));
        ew.documents = [...(Array.isArray(prev.documents) ? prev.documents : []), ...paths];
        ew.document_metas = [...(Array.isArray(prev.document_metas) ? prev.document_metas : []), ...metas];
      }

      const hasContent =
        (condition && condition !== 'None') ||
        required === 'Yes' ||
        !!ew.description ||
        (Array.isArray(ew.documents) && ew.documents.length > 0) ||
        !!prev.submitted_at;

      if (hasContent) {
        ew.submitted_at = new Date().toISOString();
        ew.submitted_by = profile?.full_name || '';
        rollout.extra_work = ew;
      }
    }



    // Power RFI is READ-ONLY here — force it to whatever the sites record already has
    const enforcedMilestones: Record<string, string> = { ...milestones };
    enforcedMilestones.power_rfi = editSite.power_rfi || 'Not Started';

    const completed = Object.values(enforcedMilestones).filter(v => v === 'Completed').length;
    const pct = Math.round((completed / milestoneFields.length) * 100);

    const updates: Record<string, any> = {
      scope: get('scope') || null,
      site_type: get('site_type') || null,
      vendor_name: get('civil_contractor') || null,
      contractor_name: get('civil_contractor') || null,
      handover_to_vendor: get('handover_to_vendor') || null,
      progress_percent: pct,
      review_notes: JSON.stringify({ ...(rawNotesObj(editSite) || {}), ...ext, rollout }),
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
      await supabase.rpc('send_workflow_notification', {
        _user_ids: admins.map((a: any) => a.user_id),
        _title: 'Rollout form submitted',
        _message: `${profile?.full_name || 'Rollout'} submitted rollout data for "${editSite.site_name}" (${pct}% complete).`,
        _type: 'info',
        _link: '/admin',
      });
    }
    toast({ title: 'Rollout data submitted', description: 'Sent to Admin. The form stays open and remains editable.' });
    // Keep the form open with the saved values so it can be edited/resubmitted anytime
    const { data: fresh } = await supabase.from('sites').select('*').eq('id', editSite.id).maybeSingle();
    if (fresh) {
      setEditSite(fresh as SiteRow);
      const init: Record<string, string> = {};
      milestoneFields.forEach(([k]) => { init[k] = (fresh as any)[k] || 'Not Started'; });
      setMilestones(init);
      setFormKey(k => k + 1);
    }
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
                            {parseExt(site).rollout?.submitted_at && (
                              <p className="text-[11px] text-primary mt-0.5">
                                Submitted {new Date(parseExt(site).rollout.submitted_at).toLocaleDateString()} — editable
                              </p>
                            )}
                          </div>
                          {canEdit ? (
                            <Button size="sm" onClick={() => openEdit(site)}>
                              {parseExt(site).rollout?.submitted_at || (site.progress_percent || 0) > 0 ? 'Edit & Resubmit' : 'Fill Form'}
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
              return (
                <div className="space-y-4">
                  <section className="rounded-lg border p-3 bg-muted/30 space-y-3">
                    <p className="text-xs font-semibold text-primary">Procurement Handover Details (read-only)</p>
                    <RolloutReadinessTracker submission={sub} />
                    <RolloutProcurementReadiness submission={sub} />
                    {sub?.notes && (
                      <div className="text-xs p-2 rounded bg-background border">
                        <span className="font-medium">Procurement notes:</span> {sub.notes}
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
                <form key={formKey} onSubmit={handleSave} className="space-y-6">
                  {ext.submitted_at && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
                      <span className="font-medium text-primary">Submitted</span>{' '}
                      {new Date(ext.submitted_at).toLocaleString()}
                      {ext.submitted_by ? ` by ${ext.submitted_by}` : ''}
                      {ext.submission_count ? ` • ${ext.submission_count} submission(s)` : ''} — you can edit and resubmit at any time.
                    </div>
                  )}

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
                        <Label>Site Type</Label>
                        <Select name="site_type" defaultValue={editSite.site_type || ext.rollout?.site_type || ''}>
                          <SelectTrigger><SelectValue placeholder="Select site type" /></SelectTrigger>
                          <SelectContent>{siteTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
                      {ext.submitted_at || (editSite.progress_percent || 0) > 0 ? 'Update & Resubmit to Admin' : 'Submit to Admin'}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" disabled={saving}
                      onClick={() => setEditSite(null)}>
                      Close
                    </Button>
                  </div>

                </form>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Procurement info — read-only for Rollout */}
        <Dialog open={!!procView} onOpenChange={(open) => { if (!open) setProcView(null); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                Procurement — {procView?.site?.site_name || 'Site'}
                <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" /> View only</Badge>
              </DialogTitle>
            </DialogHeader>
            {procView && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Rollout Readiness Tracker
                  </h3>
                  <RolloutReadinessTracker submission={procView.sub} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Land Acquisition, Lease & Handover Status
                  </h3>
                  <RolloutProcurementReadiness submission={procView.sub} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Vendor, Purchase Order & Delivery
                  </h3>
                  <ProcurementManagementView submission={procView.sub} />
                </div>
              </div>
            )}

          </DialogContent>
        </Dialog>
      </DashboardLayout>

    </AuthGuard>
  );
}
