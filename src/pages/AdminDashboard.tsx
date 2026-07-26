import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Users, FileCheck, Activity, Loader2, Check, X, Eye, EyeOff, Plus, UserCog, Lock, Unlock, KeyRound, Trash2, TableProperties, Zap, HardHat, ClipboardList } from 'lucide-react';
import SiteDetailsView from '@/components/SiteDetailsView';
import SiteMonitorTable from '@/components/SiteMonitorTable';
import ProcSubmissionDetails from '@/components/ProcSubmissionDetails';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { getSignedUrl, openFileInNewTab, downloadFile } from '@/lib/storageUtils';

type DocMeta = { file_name?: string; file_size?: number; uploaded_by?: string; uploaded_at?: string };
type FileValue = { __files: string[]; bucket: string; metas?: (DocMeta | undefined)[] };
const asFiles = (v: any, bucket = 'site-documents', metas?: (DocMeta | undefined)[]): FileValue | null => {
  if (!v) return null;
  const arr = Array.isArray(v) ? v.filter(Boolean) : (typeof v === 'string' && v ? [v] : []);
  return arr.length ? { __files: arr, bucket, metas } : null;
};
const isFileValue = (v: any): v is FileValue => v && typeof v === 'object' && Array.isArray(v.__files);
const fmtFileSize = (b?: number) => {
  if (!b || b <= 0) return null;
  return b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
};


const navItems = [
  { label: 'Overview', icon: LayoutDashboard, value: 'overview' },
  { label: 'Site Monitor', icon: TableProperties, value: 'monitor' },
  { label: 'Planning Review', icon: ClipboardList, value: 'approvals' },
  { label: 'Procurement Review', icon: FileCheck, value: 'procurement' },
  { label: 'Power Review', icon: Zap, value: 'power_review' },
  { label: 'Rollout Review', icon: HardHat, value: 'rollout_review' },
  { label: 'User Management', icon: Users, value: 'users' },
  { label: 'Activity Log', icon: Activity, value: 'activity' },
];

// Parse extended JSON stored in sites.review_notes
const parseExt = (site: any): { power: any; rollout: any; admin: any } => {
  try {
    const obj = site?.review_notes ? JSON.parse(site.review_notes) : {};
    if (obj && typeof obj === 'object' && ('power' in obj || 'rollout' in obj || 'admin' in obj)) {
      return { power: obj.power || {}, rollout: obj.rollout || {}, admin: obj.admin || {} };
    }
  } catch { /* not JSON */ }
  return { power: {}, rollout: {}, admin: {} };
};

const powerFieldLabels: [string, (s: any, ext: any) => any][] = [
  ['Primary Power Source', (s) => s.power_source],
  ['Power Requirement (kW)', (s) => s.power_requirement],
  ['Grid Transformer Capacity', (s) => s.grid_transformer_capacity],
  ['EDSA Meter Number', (_s, ext) => ext.edsa_meter_number],
  ['Generator Capacity (kVA)', (s) => s.generator_capacity],
  ['Generator Model & Fuel Tank', (_s, ext) => ext.generator_model_fuel],
  ['Solar Array Capacity (kWp)', (s) => s.solar_capacity],
  ['Solar Controller / Rectifier', (_s, ext) => ext.solar_controller_model],
  ['Backup Power Type', (_s, ext) => ext.backup_power_type],
  ['Battery Bank Type', (s) => s.battery_bank_type],
  ['Battery Banks & Ah', (_s, ext) => ext.battery_config],
  ['Earthing Resistance (Ω)', (s) => s.earthing_resistance],
  ['Power RFI Status', (s) => s.power_rfi_status],
  ['Power Quality Inspection Date', (_s, ext) => ext.power_quality_date],
  ['Power Certificate', (s, ext) => asFiles(s.power_certificate_url, 'site-documents', [ext.power_certificate_meta])],
  ['Electrical Safety & Earthing Audit Report', (_s, ext) => asFiles(ext.earthing_audit_url, 'site-documents', [ext.earthing_audit_meta])],
];


const fileName = (p: any) => {
  if (!p) return null;
  if (Array.isArray(p)) return p.length ? `${p.length} file(s): ${p.map((x: string) => x.split('/').pop()).join(', ')}` : null;
  return typeof p === 'string' ? p.split('/').pop() : null;
};

const rolloutFieldLabels: [string, (s: any, ext: any) => any][] = [
  // Project Info
  ['Project Scope', (s, ext) => s.scope || ext.project_scope],
  ['Civil Contractor', (s, ext) => ext.civil_contractor || s.vendor_name],
  ['T&I Contractor', (_s, ext) => ext.ti_contractor],
  ['Project Manager', (_s, ext) => ext.project_manager],
  ['Handover to Vendor', (s) => s.handover_to_vendor],
  ['Rollout Status', (_s, ext) => ext.status],
  // Milestones
  ['Soil Test', (s) => s.soil_test],
  ['Site Implementation Design (SID)', (s) => s.site_implementation_design],
  ['Civil Foundation Cast', (s) => s.cast_status],
  ['Tower Rigging', (s) => s.tower_rig],
  ['Civil RFI', (s) => s.civil_rfi],
  ['Power RFI (auto-synced)', (s) => s.power_rfi],
  ['On Air / Commissioning', (s) => s.on_air],
  ['Progress %', (s) => (s.progress_percent != null ? `${s.progress_percent}%` : null)],
  // Execution Schedule
  ['Civil Works Start Date', (_s, ext) => ext.civil_start_date],
  ['Foundation Casting Date', (_s, ext) => ext.foundation_cast_date],
  ['Tower Erection Date', (_s, ext) => ext.tower_erection_date],
  ['Expected Civil Completion', (_s, ext) => ext.expected_civil_completion_date],
  ['Actual Civil RFI Date', (_s, ext) => ext.actual_civil_rfi_date],
  ['Target On-Air Date', (_s, ext) => ext.target_on_air_date],
  ['Actual On-Air Date', (_s, ext) => ext.actual_on_air_date],
  // Verification uploads (downloadable)
  ['Soil Test Report', (_s, ext) => asFiles(ext.soil_report_url)],
  ['Approved SID Plan', (_s, ext) => asFiles(ext.sid_plan_url)],
  ['Civil RFI Quality Certificate', (_s, ext) => asFiles(ext.civil_quality_cert_url)],
  ['Post-Erection Site Photos', (_s, ext) => asFiles(ext.post_erection_photos)],
];

type Site = any;
type ProcSubmission = any;
type ActivityItem = { id: string; action: string; description: string; user_name: string | null; created_at: string; };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sites, setSites] = useState<Site[]>([]);
  const [procSubmissions, setProcSubmissions] = useState<ProcSubmission[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProc, setSelectedProc] = useState<ProcSubmission | null>(null);
  const [procReviewNotes, setProcReviewNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // User management state
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<any>(null);
  const [showResetPw, setShowResetPw] = useState<any>(null);
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: '', department: '', phone: '' });
  const [editData, setEditData] = useState({ full_name: '', department: '', phone: '', role: '' });
  const [newPassword, setNewPassword] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showResetPwVisible, setShowResetPwVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [stageReview, setStageReview] = useState<{ site: any; stage: 'power' | 'rollout' } | null>(null);
  const [stageNotes, setStageNotes] = useState('');

  const { user, profile, session } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    const [sitesRes, procRes, actRes, profilesRes, rolesRes] = await Promise.all([
      supabase.from('sites').select('*').order('created_at', { ascending: false }),
      supabase.from('procurement_submissions').select('*, sites(*)').order('created_at', { ascending: false }),
      supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*'),
    ]);
    if (sitesRes.data) setSites(sitesRes.data);
    if (procRes.data) setProcSubmissions(procRes.data);
    if (actRes.data) setActivities(actRes.data as ActivityItem[]);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (rolesRes.data) setUserRoles(rolesRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  // Live sync: reflect Power/Rollout dashboard saves without a page refresh
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('admin-sites-sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sites' }, (payload: any) => {
        const row = payload.new;
        if (!row?.id) return;
        setSites(prev => prev.map(s => (s.id === row.id ? { ...s, ...row } : s)));
        setStageReview(prev => (prev && prev.site?.id === row.id ? { ...prev, site: { ...prev.site, ...row } } : prev));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);


  const callManageUsers = async (body: any) => {
    const res = await supabase.functions.invoke('manage-users', { body });
    if (res.error) {
      // Try to extract detailed error from the response context
      let errorMsg = res.error.message;
      try {
        if (res.error.context && typeof res.error.context.json === 'function') {
          const errorBody = await res.error.context.json();
          if (errorBody?.error) errorMsg = errorBody.error;
        }
      } catch {}
      // Also check if res.data has an error (some versions return it there)
      if (res.data?.error) errorMsg = res.data.error;
      throw new Error(errorMsg);
    }
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  const handleSiteAction = async (site: Site, action: 'approved' | 'rejected') => {
    setActionLoading(true);
    const { error } = await supabase.from('sites').update({
      status: action, reviewed_by: user!.id, review_notes: reviewNotes || null,
    }).eq('id', site.id);
    if (!error) {
      await supabase.from('activity_log').insert({
        action: action === 'approved' ? 'site_approved' : 'site_rejected',
        description: `Site "${site.site_name}" was ${action}`,
        user_id: user!.id, user_name: profile?.full_name,
        entity_type: 'site', entity_id: site.id,
      });
      toast({ title: `Site ${action}` });
      setSelectedSite(null); setReviewNotes(''); fetchData();
    } else toast({ variant: 'destructive', title: 'Error', description: error.message });
    setActionLoading(false);
  };

  const handleProcAction = async (proc: ProcSubmission, action: 'approved' | 'rejected') => {
    setActionLoading(true);
    const { error } = await supabase.from('procurement_submissions').update({
      status: action, reviewed_by: user!.id, review_notes: procReviewNotes || null,
    }).eq('id', proc.id);
    if (!error) {
      await supabase.from('activity_log').insert({
        action: action === 'approved' ? 'procurement_approved' : 'procurement_rejected',
        description: `Procurement for "${proc.sites?.site_name}" was ${action}`,
        user_id: user!.id, user_name: profile?.full_name,
        entity_type: 'procurement_submission', entity_id: proc.id,
      });
      toast({ title: `Procurement ${action}` });
      setSelectedProc(null); setProcReviewNotes(''); fetchData();
    }
    setActionLoading(false);
  };

  const handleStageAction = async (action: 'approved' | 'revisions') => {
    if (!stageReview) return;
    if (!stageNotes.trim()) {
      toast({ variant: 'destructive', title: 'Feedback required', description: 'Please add a feedback comment.' });
      return;
    }
    setActionLoading(true);
    const ext = parseExt(stageReview.site);
    const admin = { ...ext.admin };
    admin[stageReview.stage] = {
      status: action,
      notes: stageNotes,
      reviewed_by: profile?.full_name || null,
      reviewed_at: new Date().toISOString(),
    };
    const updates: Record<string, any> = {
      review_notes: JSON.stringify({ ...ext, admin }),
    };
    // Downstream unlock signal
    if (stageReview.stage === 'power' && action === 'approved') {
      updates.power_rfi = 'Completed';
    }
    const { error } = await supabase.from('sites').update(updates).eq('id', stageReview.site.id);
    if (!error) {
      await supabase.from('activity_log').insert({
        action: `${stageReview.stage}_${action}`,
        description: `${stageReview.stage.charAt(0).toUpperCase() + stageReview.stage.slice(1)} stage for "${stageReview.site.site_name}" ${action === 'approved' ? 'approved' : 'sent back for revisions'}`,
        user_id: user!.id, user_name: profile?.full_name,
        entity_type: 'site', entity_id: stageReview.site.id,
      });
      toast({ title: action === 'approved' ? 'Stage approved' : 'Revisions requested' });
      setStageReview(null); setStageNotes(''); fetchData();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
    setActionLoading(false);
  };

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-z]/.test(pw)) return 'Password must contain a lowercase letter';
    if (!/[A-Z]/.test(pw)) return 'Password must contain an uppercase letter';
    if (!/\d/.test(pw)) return 'Password must contain a number';
    return null;
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name || !newUser.role) {
      toast({ variant: 'destructive', title: 'Error', description: 'Fill all required fields' }); return;
    }
    const pwError = validatePassword(newUser.password);
    if (pwError) {
      toast({ variant: 'destructive', title: 'Invalid Password', description: pwError }); return;
    }
    setUserActionLoading(true);
    try {
      await callManageUsers({ action: 'create_user', ...newUser });
      toast({ title: 'User Created', description: `${newUser.full_name} has been added.` });
      setShowCreateUser(false);
      setNewUser({ email: '', password: '', full_name: '', role: '', department: '', phone: '' });
      fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
    setUserActionLoading(false);
  };

  const handleEditUser = async () => {
    if (!showEditUser) return;
    setUserActionLoading(true);
    try {
      await callManageUsers({ action: 'update_user', user_id: showEditUser.user_id, ...editData });
      toast({ title: 'User Updated' });
      setShowEditUser(null); fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
    setUserActionLoading(false);
  };

  const handleToggleActive = async (p: any) => {
    setUserActionLoading(true);
    try {
      await callManageUsers({ action: 'toggle_active', user_id: p.user_id, is_active: !p.is_active });
      toast({ title: p.is_active ? 'Account Frozen' : 'Account Unfrozen' });
      fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
    setUserActionLoading(false);
  };

  const handleResetPassword = async () => {
    if (!showResetPw || !newPassword) return;
    const pwError = validatePassword(newPassword);
    if (pwError) {
      toast({ variant: 'destructive', title: 'Invalid Password', description: pwError }); return;
    }
    setUserActionLoading(true);
    try {
      await callManageUsers({ action: 'reset_password', user_id: showResetPw.user_id, new_password: newPassword });
      toast({ title: 'Password Reset' });
      setShowResetPw(null); setNewPassword('');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
    setUserActionLoading(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.user_id === user?.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'You cannot delete your own account.' });
      setDeleteTarget(null);
      return;
    }
    setUserActionLoading(true);
    try {
      await callManageUsers({
        action: 'delete_user',
        user_id: deleteTarget.user_id,
        deleted_by_name: profile?.full_name || '',
        reason: 'Removed by admin',
      });
      toast({ title: 'User Deleted', description: `${deleteTarget.full_name} has been removed. Their history is archived.` });
      await supabase.from('activity_log').insert({
        action: 'user_deleted',
        description: `User "${deleteTarget.full_name}" (${deleteTarget.email}) was deleted`,
        user_id: user!.id,
        user_name: profile?.full_name,
        entity_type: 'user',
        entity_id: deleteTarget.user_id,
      });
      setDeleteTarget(null);
      fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: e.message });
    }
    setUserActionLoading(false);
  };

  const getUserRole = (userId: string) => userRoles.find(r => r.user_id === userId)?.role || 'N/A';
  const filteredSites = statusFilter === 'all' ? sites : sites.filter(s => s.status === statusFilter);
  const pending = sites.filter(s => s.status === 'pending').length;
  const procPending = procSubmissions.filter(s => s.status === 'pending').length;

  const roleBadgeColor: Record<string, string> = {
    project_team: 'bg-blue-500/10 text-blue-600',
    planning_team: 'bg-emerald-500/10 text-emerald-600',
    procurement_team: 'bg-primary/10 text-primary',
    power_team: 'bg-yellow-500/10 text-yellow-700',
    rollout_team: 'bg-purple-500/10 text-purple-600',
  };
  const roleLabels: Record<string, string> = {
    project_team: 'Project Team',
    planning_team: 'Planning Team',
    procurement_team: 'Procurement Team',
    power_team: 'Power Team',
    rollout_team: 'Rollout Team',
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total Sites" value={sites.length} icon={LayoutDashboard} />
        <StatCard title="Pending" value={pending} icon={CheckSquare} color="text-warning" onClick={() => { setActiveTab('approvals'); setStatusFilter('pending'); }} />
        <StatCard title="Users" value={profiles.length} icon={Users} />
        <StatCard title="Proc. Pending" value={procPending} icon={FileCheck} color="text-primary" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader><CardTitle className="text-base">Recent Submissions</CardTitle></CardHeader>
          <CardContent>
            {sites.slice(0, 5).map(site => (
              <div key={site.id} className="flex items-center justify-between py-2 border-b last:border-0 gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{site.site_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(site.created_at), { addSuffix: true })}</p>
                </div>
                <StatusBadge status={site.status} />
              </div>
            ))}
            {sites.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No sites yet</p>}
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {activities.slice(0, 5).map(act => (
              <div key={act.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${act.action.includes('approved') ? 'bg-success' : act.action.includes('rejected') ? 'bg-destructive' : 'bg-primary'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{act.description}</p>
                  <p className="text-xs text-muted-foreground">{act.user_name} • {formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold">Site Approvals</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {filteredSites.map(site => (
          <Card key={site.id}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{site.site_id_code} — {site.site_name}</h3>
                    <StatusBadge status={site.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{site.region}{site.district ? `, ${site.district}` : ''}{site.town ? `, ${site.town}` : ''} • {new Date(site.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedSite(site); setReviewNotes(''); }}>
                    <Eye className="h-3 w-3 mr-1" /> Review
                  </Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (!confirm(`Delete site "${site.site_name}"? This will also delete all related procurement submissions and feedback. This cannot be undone.`)) return;
                    // Clean up procurement submission files first
                    const relatedProcs = procSubmissions.filter(p => p.site_id === site.id);
                    for (const proc of relatedProcs) {
                      const procFiles = ['land_identified_file_url','ownership_verified_file_url','acquisition_approved_file_url','lease_negotiation_file_url','lease_signed_file_url','lease_registration_file_url','road_access_file_url','vendor_contract_file_url','site_handover_file_url']
                        .map(f => proc[f]).filter(Boolean).filter((p: string) => !p.startsWith('http'));
                      if (procFiles.length > 0) await supabase.storage.from('procurement-documents').remove(procFiles);
                    }
                    // Clean up site files
                    const filePaths = [site.site_photo_url, site.layout_plan_url, site.approval_letter_url].filter(Boolean).filter((p: string) => !p.startsWith('http'));
                    if (filePaths.length > 0) await supabase.storage.from('site-documents').remove(filePaths);
                    // Delete site (cascades to procurement_submissions and procurement_feedback)
                    const { error } = await supabase.from('sites').delete().eq('id', site.id);
                    if (!error) {
                      await supabase.from('activity_log').insert({
                        action: 'site_deleted', description: `Site "${site.site_name}" was deleted`,
                        user_id: user!.id, user_name: profile?.full_name, entity_type: 'site', entity_id: site.id,
                      });
                      toast({ title: 'Site deleted successfully' }); fetchData();
                    } else toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
                  }}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredSites.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No sites found.</CardContent></Card>}
      </div>

      <Dialog open={!!selectedSite} onOpenChange={(open) => { if (!open) setSelectedSite(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedSite?.site_name}</DialogTitle></DialogHeader>
          {selectedSite && (
            <div className="space-y-4">
              <SiteDetailsView site={selectedSite} allowFileManage={true} onFileUpdated={fetchData} />
              {selectedSite.status === 'pending' && (
                <div className="space-y-3 border-t pt-4">
                  <Label>Review Notes</Label>
                  <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Add notes..." />
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground" disabled={actionLoading} onClick={() => handleSiteAction(selectedSite, 'approved')}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button variant="destructive" className="flex-1" disabled={actionLoading} onClick={() => handleSiteAction(selectedSite, 'rejected')}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg sm:text-xl font-bold">User Management</h2>
        <Button size="sm" className="gradient-orange border-0 text-primary-foreground" onClick={() => setShowCreateUser(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add User
        </Button>
      </div>
      <div className="space-y-3">
        {profiles.map(p => {
          const role = getUserRole(p.user_id);
          return (
            <Card key={p.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">{p.email} {p.phone ? `• ${p.phone}` : ''}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roleBadgeColor[role] || 'bg-muted text-muted-foreground'}`}>
                        {roleLabels[role] || role}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {p.is_active ? 'Active' : 'Frozen'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => { setShowEditUser(p); setEditData({ full_name: p.full_name, department: p.department || '', phone: p.phone || '', role }); }}>
                      <UserCog className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleActive(p)} disabled={userActionLoading}>
                      {p.is_active ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                      {p.is_active ? 'Freeze' : 'Unfreeze'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setShowResetPw(p); setNewPassword(''); }}>
                      <KeyRound className="h-3 w-3 mr-1" /> Reset PW
                    </Button>
                    {p.user_id !== user?.id && (
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(p)} disabled={userActionLoading}>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={newUser.full_name} onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))} placeholder="John Doe" /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="user@orangeflow.sl" /></div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <div className="relative">
                <Input type={showNewPw ? 'text' : 'password'} value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="Min 8 chars, uppercase, lowercase, number" />
                <button type="button" className="absolute right-0 top-0 h-full px-3 flex items-center justify-center z-10 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPw(!showNewPw)}>
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be 8+ characters with uppercase, lowercase, and a number</p>
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="project_team">Project Team (Admin)</SelectItem>
                  <SelectItem value="planning_team">Planning Team</SelectItem>
                  <SelectItem value="procurement_team">Procurement Team</SelectItem>
                  <SelectItem value="power_team">Power Team</SelectItem>
                  <SelectItem value="rollout_team">Rollout Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Department</Label><Input value={newUser.department} onChange={e => setNewUser(p => ({ ...p, department: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} /></div>
            <Button className="w-full gradient-orange border-0 text-primary-foreground" onClick={handleCreateUser} disabled={userActionLoading}>
              {userActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!showEditUser} onOpenChange={o => { if (!o) setShowEditUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User: {showEditUser?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Full Name</Label><Input value={editData.full_name} onChange={e => setEditData(p => ({ ...p, full_name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Department</Label><Input value={editData.department} onChange={e => setEditData(p => ({ ...p, department: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editData.role} onValueChange={v => setEditData(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="project_team">Project Team (Admin)</SelectItem>
                  <SelectItem value="planning_team">Planning Team</SelectItem>
                  <SelectItem value="procurement_team">Procurement Team</SelectItem>
                  <SelectItem value="power_team">Power Team</SelectItem>
                  <SelectItem value="rollout_team">Rollout Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gradient-orange border-0 text-primary-foreground" onClick={handleEditUser} disabled={userActionLoading}>
              {userActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!showResetPw} onOpenChange={o => { if (!o) setShowResetPw(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password: {showResetPw?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showResetPwVisible ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 chars, uppercase, lowercase, number" />
                <button type="button" className="absolute right-0 top-0 h-full px-3 flex items-center justify-center z-10 text-muted-foreground hover:text-foreground" onClick={() => setShowResetPwVisible(!showResetPwVisible)}>
                  {showResetPwVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be 8+ characters with uppercase, lowercase, and a number</p>
            </div>
            <Button className="w-full gradient-orange border-0 text-primary-foreground" onClick={handleResetPassword} disabled={userActionLoading}>
              {userActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User: {deleteTarget?.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.email}</strong> from the system. They will no longer be able to log in. Their history will be archived for record-keeping. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={userActionLoading}>
              {userActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const renderProcurement = () => (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold">Procurement Review</h2>
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="Total" value={procSubmissions.length} icon={FileCheck} />
        <StatCard title="Pending" value={procPending} icon={FileCheck} color="text-warning" />
        <StatCard title="Approved" value={procSubmissions.filter(s => s.status === 'approved').length} icon={FileCheck} color="text-success" />
      </div>
      <div className="space-y-3">
        {procSubmissions.map(proc => (
          <Card key={proc.id}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{proc.sites?.site_name || 'Site'}</h3>
                    <StatusBadge status={proc.status} />
                  </div>
                  <div className="mt-2">
                    <ProcSubmissionDetails submission={proc} />
                  </div>
                </div>
              <div className="flex flex-col gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedProc(proc); setProcReviewNotes(''); }}>
                    <Eye className="h-3 w-3 mr-1" /> {proc.status === 'pending' ? 'Review' : 'View'}
                  </Button>
                  {proc.status === 'pending' && (
                    <>
                      <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" disabled={actionLoading} onClick={() => handleProcAction(proc, 'approved')}>
                        <Check className="h-3 w-3 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="destructive" disabled={actionLoading} onClick={() => handleProcAction(proc, 'rejected')}>
                        <X className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (!confirm(`Delete procurement submission for "${proc.sites?.site_name}"?`)) return;
                    // Clean up storage files
                    const procFiles = ['land_identified_file_url','ownership_verified_file_url','acquisition_approved_file_url','lease_negotiation_file_url','lease_signed_file_url','lease_registration_file_url','road_access_file_url','vendor_contract_file_url','site_handover_file_url']
                      .map(f => proc[f]).filter(Boolean).filter((p: string) => !p.startsWith('http'));
                    if (procFiles.length > 0) await supabase.storage.from('procurement-documents').remove(procFiles);
                    const { error } = await supabase.from('procurement_submissions').delete().eq('id', proc.id);
                    if (!error) {
                      await supabase.from('activity_log').insert({
                        action: 'procurement_deleted', description: `Procurement for "${proc.sites?.site_name}" was deleted`,
                        user_id: user!.id, user_name: profile?.full_name, entity_type: 'procurement_submission', entity_id: proc.id,
                      });
                      toast({ title: 'Procurement submission deleted' }); fetchData();
                    } else toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
                  }}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {procSubmissions.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No procurement submissions yet.</CardContent></Card>}
      </div>

      <Dialog open={!!selectedProc} onOpenChange={(open) => { if (!open) setSelectedProc(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Review Procurement: {selectedProc?.sites?.site_name}</DialogTitle></DialogHeader>
          {selectedProc && (
            <div className="space-y-4">
              {selectedProc.sites && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Planning Site Details</h3>
                  <SiteDetailsView site={selectedProc.sites} allowFileManage={true} onFileUpdated={fetchData} />
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Procurement Submission</h3>
                <ProcSubmissionDetails submission={selectedProc} allowFileManage={true} onFileUpdated={fetchData} />
              </div>
              {selectedProc.status === 'pending' && (
                <div className="space-y-3 border-t pt-4">
                  <Label>Review Notes</Label>
                  <Textarea value={procReviewNotes} onChange={(e) => setProcReviewNotes(e.target.value)} />
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground" disabled={actionLoading} onClick={() => handleProcAction(selectedProc, 'approved')}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button variant="destructive" className="flex-1" disabled={actionLoading} onClick={() => handleProcAction(selectedProc, 'rejected')}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderStageReviewList = (stage: 'power' | 'rollout') => {
    const fields = stage === 'power' ? powerFieldLabels : rolloutFieldLabels;
    const icon = stage === 'power' ? Zap : HardHat;
    const title = stage === 'power' ? 'Power Form Review' : 'Rollout Form Review';
    // Only sites that have some data for this stage
    const items = sites.filter(s => {
      const ext = parseExt(s);
      const hasExt = Object.keys(ext[stage] || {}).length > 0;
      if (stage === 'power') return hasExt || s.power_source || s.power_rfi_status;
      return hasExt || s.vendor_name || s.scope || s.progress_percent;
    });
    return (
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="Total" value={items.length} icon={icon} />
          <StatCard title="Approved" value={items.filter(s => parseExt(s).admin?.[stage]?.status === 'approved').length} icon={Check} color="text-success" />
          <StatCard title="Revisions" value={items.filter(s => parseExt(s).admin?.[stage]?.status === 'revisions').length} icon={X} color="text-warning" />
        </div>
        <div className="space-y-3">
          {items.map(site => {
            const ext = parseExt(site);
            const adminStatus = ext.admin?.[stage]?.status;
            return (
              <Card key={site.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{site.site_id_code} — {site.site_name}</h3>
                        {adminStatus === 'approved' && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/15 text-success">Approved</span>}
                        {adminStatus === 'revisions' && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/15 text-warning">Revisions Requested</span>}
                        {!adminStatus && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Awaiting Review</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stage === 'power'
                          ? `RFI: ${site.power_rfi_status || 'Not Started'} • ${site.power_source || 'No source set'}`
                          : `Progress: ${site.progress_percent || 0}% • Vendor: ${site.vendor_name || '—'}`}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => { setStageReview({ site, stage }); setStageNotes(ext.admin?.[stage]?.notes || ''); }}>
                        <Eye className="h-3 w-3 mr-1" /> Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {items.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No {stage} submissions yet.</CardContent></Card>}
        </div>

        <Dialog open={stageReview?.stage === stage} onOpenChange={(open) => { if (!open) { setStageReview(null); setStageNotes(''); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{stage === 'power' ? '⚡ Power' : '🏗️ Rollout'} Review — {stageReview?.site?.site_name}</DialogTitle></DialogHeader>
            {stageReview && (() => {
              const ext = parseExt(stageReview.site);
              const extStage = ext[stage] || {};
              const previous = ext.admin?.[stage];
              return (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Submitted Parameters (read-only)</h4>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {fields.map(([label, getter]) => {
                        const v = getter(stageReview.site, extStage);
                        return (
                          <div key={label} className="flex justify-between gap-2 border-b border-border/50 py-1">
                            <dt className="text-muted-foreground">{label}</dt>
                            <dd className="font-medium text-right truncate">
                              {isFileValue(v) ? (
                                <div className="flex flex-col items-end gap-1">
                                  {v.__files.map((path, i) => {
                                    const meta = v.metas?.[i];
                                    const name = meta?.file_name || path.split('/').pop() || `file-${i + 1}`;
                                    return (
                                      <div key={path + i} className="flex flex-col items-end gap-0.5 max-w-[280px] w-full">
                                        <div className="flex items-center gap-2 w-full">
                                        <span className="text-xs truncate flex-1 text-left" title={name}>{name}</span>

                                        <button
                                          type="button"
                                          onClick={async () => {
                                            toast({ title: 'Opening…', description: name });
                                            const ok = await openFileInNewTab(v.bucket, path);
                                            if (!ok) toast({ variant: 'destructive', title: 'Preview failed' });
                                          }}
                                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                                          title={`View ${name}`}
                                        >
                                          👁 View
                                        </button>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            toast({ title: 'Downloading…', description: name });
                                            const ok = await downloadFile(v.bucket, path, name);
                                            if (!ok) toast({ variant: 'destructive', title: 'Download failed' });
                                          }}
                                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                                          title={`Download ${name}`}
                                        >
                                          ⬇ Download
                                        </button>
                                        </div>
                                        {meta && (
                                          <span className="text-[10px] text-muted-foreground text-right">
                                            {meta.uploaded_at ? new Date(meta.uploaded_at).toLocaleString() : '—'}
                                            {meta.uploaded_by ? ` • by ${meta.uploaded_by}` : ''}
                                            {fmtFileSize(meta.file_size) ? ` • ${fmtFileSize(meta.file_size)}` : ''}
                                          </span>
                                        )}
                                      </div>
                                    );

                                  })}

                                </div>
                              ) : (v == null || v === '' ? '—' : String(v))}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                  {previous && (
                    <div className={`rounded-lg border p-3 text-xs ${previous.status === 'approved' ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'}`}>
                      <p className="font-semibold mb-1">Previous decision: {previous.status === 'approved' ? '✅ Approved' : '❌ Revisions requested'}</p>
                      <p className="text-muted-foreground">By {previous.reviewed_by || 'admin'} — {previous.notes}</p>
                    </div>
                  )}
                  <div className="space-y-2 border-t pt-4">
                    <Label>Feedback Comment <span className="text-destructive">*</span></Label>
                    <Textarea value={stageNotes} onChange={(e) => setStageNotes(e.target.value)} placeholder="Required feedback for the team..." rows={3} />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground" disabled={actionLoading} onClick={() => handleStageAction('approved')}>
                        <Check className="h-4 w-4 mr-1" /> Approve Stage
                      </Button>
                      <Button variant="destructive" className="flex-1" disabled={actionLoading} onClick={() => handleStageAction('revisions')}>
                        <X className="h-4 w-4 mr-1" /> Request Revisions
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderActivity = () => (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold">Activity Log</h2>
      <div className="space-y-0">
        {activities.map((act, i) => (
          <div key={act.id} className="flex gap-3 relative">
            {i < activities.length - 1 && <div className="absolute left-[7px] top-6 bottom-0 w-[2px] bg-border" />}
            <div className={`mt-1.5 h-4 w-4 rounded-full border-2 shrink-0 ${
              act.action.includes('approved') ? 'bg-success border-success' : 
              act.action.includes('rejected') ? 'bg-destructive border-destructive' : 'bg-primary border-primary'
            }`} />
            <div className="pb-6 min-w-0 flex-1">
              <p className="text-sm">{act.description}</p>
              <p className="text-xs text-muted-foreground">{act.user_name} • {formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <AuthGuard allowedRoles={['project_team']}>
        <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['project_team']}>
      <DashboardLayout title="Admin Dashboard" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'monitor' && <SiteMonitorTable sites={sites} onFileUpdated={fetchData} />}
        {activeTab === 'approvals' && renderApprovals()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'procurement' && renderProcurement()}
        {activeTab === 'power_review' && renderStageReviewList('power')}
        {activeTab === 'rollout_review' && renderStageReviewList('rollout')}
        {activeTab === 'activity' && renderActivity()}
      </DashboardLayout>
    </AuthGuard>
  );
}
