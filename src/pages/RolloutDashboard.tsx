import { useState, useEffect } from 'react';
import { LayoutDashboard, Rocket, Loader2, CheckCircle2 } from 'lucide-react';
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

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, value: 'overview' },
  { label: 'Rollout Queue', icon: Rocket, value: 'queue' },
];

const deploymentStatuses = ['Not Started', 'In Progress', 'Completed'];

type SiteRow = any;

const progressFields: Array<[string, string]> = [
  ['soil_test', 'Soil Test'],
  ['site_implementation_design', 'Site Implementation Design'],
  ['cast_status', 'Cast'],
  ['tower_rig', 'Tower Rig'],
  ['civil_rfi', 'Civil RFI'],
  ['on_air', 'On Air'],
];

export default function RolloutDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSite, setEditSite] = useState<SiteRow | null>(null);
  const [saving, setSaving] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    const { data } = await supabase.from('sites').select('*').order('created_at', { ascending: false });
    if (data) setSites(data);
    setLoading(false);
  };
  useEffect(() => { if (user) fetchData(); }, [user]);

  const eligibleSites = sites.filter(s => s.power_rfi_status === 'Approved');
  const onAirCount = sites.filter(s => s.on_air === 'Completed').length;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editSite) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => fd.get(k)?.toString() || '';
    const getNum = (k: string) => { const v = fd.get(k)?.toString(); return v ? parseFloat(v) : null; };

    const updates: Record<string, any> = {
      progress_percent: getNum('progress_percent') ?? 0,
    };
    for (const [name] of progressFields) updates[name] = get(name) || 'Not Started';

    const { error } = await supabase.from('sites').update(updates).eq('id', editSite.id);
    setSaving(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      await supabase.from('activity_log').insert({
        action: 'rollout_updated',
        description: `Rollout progress updated for "${editSite.site_name}" (${updates.progress_percent}%)`,
        user_id: user!.id, user_name: profile?.full_name,
        entity_type: 'site', entity_id: editSite.id,
      });
      toast({ title: 'Rollout progress saved' });
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
                  <h2 className="text-lg sm:text-xl font-bold">Welcome, {profile?.full_name || 'Rollout Engineer'}! 🚀</h2>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">Track deployment progress on sites with approved power RFI.</p>
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
                  <p className="text-sm text-muted-foreground text-center py-8">No sites with approved Power RFI yet.</p>
                ) : (
                  <div className="space-y-3">
                    {eligibleSites.map(site => (
                      <div key={site.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{site.site_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {site.site_id_code} • Progress: <span className="font-medium">{site.progress_percent || 0}%</span> • On Air: {site.on_air || 'Not Started'}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => setEditSite(site)}>Update</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={!!editSite} onOpenChange={o => { if (!o) setEditSite(null); }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Rollout Progress — {editSite?.site_name}</DialogTitle></DialogHeader>
            {editSite && (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="progress_percent">Overall Progress (%)</Label>
                  <Input id="progress_percent" name="progress_percent" type="number" min={0} max={100} defaultValue={editSite.progress_percent || 0} />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {progressFields.map(([name, label]) => (
                    <div key={name} className="space-y-2">
                      <Label>{label}</Label>
                      <Select name={name} defaultValue={editSite[name] || 'Not Started'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{deploymentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <Button type="submit" className="w-full gradient-orange border-0 text-primary-foreground" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Progress
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  );
}
