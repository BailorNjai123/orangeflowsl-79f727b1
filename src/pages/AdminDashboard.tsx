import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Users, FileCheck, Activity, Loader2, Check, X, Eye, Plus, UserCog, Lock, Unlock, KeyRound, Trash2 } from 'lucide-react';
import SiteDetailsView from '@/components/SiteDetailsView';
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
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, value: 'overview' },
  { label: 'Site Approvals', icon: CheckSquare, value: 'approvals' },
  { label: 'User Management', icon: Users, value: 'users' },
  { label: 'Procurement Review', icon: FileCheck, value: 'procurement' },
  { label: 'Activity Log', icon: Activity, value: 'activity' },
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

  const callManageUsers = async (body: any) => {
    const res = await supabase.functions.invoke('manage-users', { body });
    if (res.error) throw new Error(res.error.message);
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

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name || !newUser.role) {
      toast({ variant: 'destructive', title: 'Error', description: 'Fill all required fields' }); return;
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

  const getUserRole = (userId: string) => userRoles.find(r => r.user_id === userId)?.role || 'N/A';
  const filteredSites = statusFilter === 'all' ? sites : sites.filter(s => s.status === statusFilter);
  const pending = sites.filter(s => s.status === 'pending').length;
  const procPending = procSubmissions.filter(s => s.status === 'pending').length;

  const roleBadgeColor: Record<string, string> = {
    project_team: 'bg-blue-500/10 text-blue-600',
    planning_team: 'bg-emerald-500/10 text-emerald-600',
    procurement_team: 'bg-primary/10 text-primary',
  };
  const roleLabels: Record<string, string> = {
    project_team: 'Project Team',
    planning_team: 'Planning Team',
    procurement_team: 'Procurement Team',
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total Sites" value={sites.length} icon={LayoutDashboard} />
        <StatCard title="Pending" value={pending} icon={CheckSquare} color="text-warning" onClick={() => { setActiveTab('approvals'); setStatusFilter('pending'); }} />
        <StatCard title="Users" value={profiles.length} icon={Users} />
        <StatCard title="Proc. Pending" value={procPending} icon={FileCheck} color="text-primary" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
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
        <Card>
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
                    <h3 className="font-semibold text-sm">{site.site_name}</h3>
                    <StatusBadge status={site.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{site.site_id_code} • {site.region}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedSite(site); setReviewNotes(''); }}>
                    <Eye className="h-3 w-3 mr-1" /> Review
                  </Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (!confirm(`Delete site "${site.site_name}"? This cannot be undone.`)) return;
                    const filePaths = [site.site_photo_url, site.layout_plan_url, site.approval_letter_url].filter(Boolean).filter((p: string) => !p.startsWith('http'));
                    if (filePaths.length > 0) await supabase.storage.from('site-documents').remove(filePaths);
                    const { error } = await supabase.from('sites').delete().eq('id', site.id);
                    if (!error) { toast({ title: 'Site deleted' }); fetchData(); }
                    else toast({ variant: 'destructive', title: 'Error', description: error.message });
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
            <div className="space-y-2"><Label>Password *</Label><Input type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" /></div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="project_team">Project Team (Admin)</SelectItem>
                  <SelectItem value="planning_team">Planning Team</SelectItem>
                  <SelectItem value="procurement_team">Procurement Team</SelectItem>
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
            <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" /></div>
            <Button className="w-full gradient-orange border-0 text-primary-foreground" onClick={handleResetPassword} disabled={userActionLoading}>
              {userActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
                    if (!confirm('Delete this procurement submission?')) return;
                    const { error } = await supabase.from('procurement_submissions').delete().eq('id', proc.id);
                    if (!error) { toast({ title: 'Deleted' }); fetchData(); }
                    else toast({ variant: 'destructive', title: 'Error', description: error.message });
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
        {activeTab === 'approvals' && renderApprovals()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'procurement' && renderProcurement()}
        {activeTab === 'activity' && renderActivity()}
      </DashboardLayout>
    </AuthGuard>
  );
}
