import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Users, FileCheck, Activity, Loader2, Check, X, Eye, Lock, Plus, Pencil, Trash2 } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    const [sitesRes, procRes, actRes, profilesRes, rolesRes] = await Promise.all([
      supabase.from('sites').select('*').order('created_at', { ascending: false }),
      supabase.from('procurement_submissions').select('*, sites(site_name, site_id_code, region, district)').order('created_at', { ascending: false }),
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

  const handleSiteAction = async (site: Site, action: 'approved' | 'rejected') => {
    setActionLoading(true);
    const { error } = await supabase.from('sites').update({
      status: action,
      reviewed_by: user!.id,
      review_notes: reviewNotes || null,
    }).eq('id', site.id);

    if (!error) {
      await supabase.from('activity_log').insert({
        action: action === 'approved' ? 'site_approved' : 'site_rejected',
        description: `Site "${site.site_name}" was ${action}`,
        user_id: user!.id,
        user_name: profile?.full_name,
        entity_type: 'site',
        entity_id: site.id,
      });
      toast({ title: `Site ${action}` });
      setSelectedSite(null);
      setReviewNotes('');
      fetchData();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
    setActionLoading(false);
  };

  const handleProcAction = async (proc: ProcSubmission, action: 'approved' | 'rejected') => {
    setActionLoading(true);
    const { error } = await supabase.from('procurement_submissions').update({
      status: action,
      reviewed_by: user!.id,
      review_notes: procReviewNotes || null,
    }).eq('id', proc.id);

    if (!error) {
      await supabase.from('activity_log').insert({
        action: action === 'approved' ? 'procurement_approved' : 'procurement_rejected',
        description: `Procurement submission for "${proc.sites?.site_name}" was ${action}`,
        user_id: user!.id,
        user_name: profile?.full_name,
        entity_type: 'procurement_submission',
        entity_id: proc.id,
      });
      toast({ title: `Procurement ${action}` });
      setSelectedProc(null);
      setProcReviewNotes('');
      fetchData();
    }
    setActionLoading(false);
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

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
        <h2 className="text-xl font-bold">Site Approvals</h2>
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
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{site.site_name}</h3>
                    <StatusBadge status={site.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{site.site_id_code} • {site.region}, {site.district}, {site.town}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedSite(site); setReviewNotes(''); }}>
                    <Eye className="h-3 w-3 mr-1" /> Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredSites.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No sites found.</CardContent></Card>}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedSite} onOpenChange={(open) => { if (!open) setSelectedSite(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedSite?.site_name}</DialogTitle></DialogHeader>
          {selectedSite && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Site ID:</span> <span className="font-medium">{selectedSite.site_id_code}</span></div>
                <div><span className="text-muted-foreground">Region:</span> <span className="font-medium">{selectedSite.region}</span></div>
                <div><span className="text-muted-foreground">District:</span> <span className="font-medium">{selectedSite.district}</span></div>
                <div><span className="text-muted-foreground">Town:</span> <span className="font-medium">{selectedSite.town}</span></div>
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{selectedSite.site_type || '-'}</span></div>
                <div><span className="text-muted-foreground">Tower:</span> <span className="font-medium">{selectedSite.tower_type || '-'}</span></div>
                <div><span className="text-muted-foreground">Height:</span> <span className="font-medium">{selectedSite.tower_height ? `${selectedSite.tower_height}m` : '-'}</span></div>
                <div><span className="text-muted-foreground">Power:</span> <span className="font-medium">{selectedSite.power_source || '-'}</span></div>
                <div><span className="text-muted-foreground">Terrain:</span> <span className="font-medium">{selectedSite.terrain_type || '-'}</span></div>
                <div><span className="text-muted-foreground">Cost:</span> <span className="font-medium">{selectedSite.estimated_cost ? `$${selectedSite.estimated_cost.toLocaleString()}` : '-'}</span></div>
              </div>
              {selectedSite.notes && (
                <div><span className="text-sm text-muted-foreground">Notes:</span><p className="text-sm mt-1 p-2 rounded bg-muted">{selectedSite.notes}</p></div>
              )}
              {selectedSite.status === 'pending' && (
                <div className="space-y-3 border-t pt-4">
                  <Label>Review Notes</Label>
                  <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Add notes for your decision..." />
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
      <h2 className="text-xl font-bold">User Management</h2>
      <div className="space-y-3">
        {profiles.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roleBadgeColor[getUserRole(p.user_id)] || 'bg-muted text-muted-foreground'}`}>
                      {getUserRole(p.user_id)}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{p.department || '-'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const procParams = [
    { key: 'land_identified', label: 'Land Identified' },
    { key: 'ownership_verified', label: 'Ownership Verified' },
    { key: 'acquisition_approved', label: 'Acquisition Approved' },
    { key: 'lease_negotiation', label: 'Lease Negotiation' },
    { key: 'lease_signed', label: 'Lease Signed' },
    { key: 'lease_registration', label: 'Lease Registration' },
    { key: 'road_access', label: 'Road Access' },
    { key: 'vendor_contract', label: 'Vendor Contract' },
    { key: 'site_handover', label: 'Site Handover' },
  ];

  const renderProcurement = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Procurement Review</h2>
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="Total" value={procSubmissions.length} icon={FileCheck} />
        <StatCard title="Pending" value={procPending} icon={FileCheck} color="text-warning" />
        <StatCard title="Approved" value={procSubmissions.filter(s => s.status === 'approved').length} icon={FileCheck} color="text-success" />
      </div>
      <div className="space-y-3">
        {procSubmissions.map(proc => (
          <Card key={proc.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{proc.sites?.site_name || 'Site'}</h3>
                    <StatusBadge status={proc.status} />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {procParams.map(p => (
                      <span key={p.key} className={`text-[10px] px-1.5 py-0.5 rounded ${proc[p.key] ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {proc[p.key] ? '✓' : '✗'} {p.label}
                      </span>
                    ))}
                  </div>
                </div>
                {proc.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => { setSelectedProc(proc); setProcReviewNotes(''); }}>
                      Review
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {procSubmissions.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No procurement submissions yet.</CardContent></Card>}
      </div>

      <Dialog open={!!selectedProc} onOpenChange={(open) => { if (!open) setSelectedProc(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review Procurement</DialogTitle></DialogHeader>
          {selectedProc && (
            <div className="space-y-4">
              <p className="text-sm font-medium">{selectedProc.sites?.site_name}</p>
              <div className="grid grid-cols-1 gap-2">
                {procParams.map(p => (
                  <div key={p.key} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                    <span>{p.label}</span>
                    <span className={selectedProc[p.key] ? 'text-success font-medium' : 'text-destructive font-medium'}>
                      {selectedProc[p.key] ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                ))}
              </div>
              {selectedProc.notes && <p className="text-sm p-2 rounded bg-muted">{selectedProc.notes}</p>}
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
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Activity Log</h2>
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
