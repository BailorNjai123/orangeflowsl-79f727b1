import { useState, useEffect } from 'react';
import { LayoutDashboard, Zap, Loader2, FileCheck } from 'lucide-react';
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
  { label: 'Power Queue', icon: Zap, value: 'queue' },
];

const rfiStatuses = ['Not Started', 'In Progress', 'Approved', 'Rejected'];

type SiteRow = any;

export default function PowerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [procMap, setProcMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editSite, setEditSite] = useState<SiteRow | null>(null);
  const [saving, setSaving] = useState(false);
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
  const approvedCount = sites.filter(s => s.power_rfi_status === 'Approved').length;
  const pendingCount = eligibleSites.filter(s => s.power_rfi_status !== 'Approved').length;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editSite) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => fd.get(k)?.toString() || '';
    const getNum = (k: string) => { const v = fd.get(k)?.toString(); return v ? parseFloat(v) : null; };

    let certUrl = editSite.power_certificate_url || '';
    const certFile = fd.get('power_certificate') as File;
    if (certFile && certFile.size > 0) {
      const ext = certFile.name.split('.').pop();
      const path = `${user!.id}/${Date.now()}_power_cert.${ext}`;
      const { error: upErr } = await supabase.storage.from('site-documents').upload(path, certFile, { upsert: true });
      if (!upErr) certUrl = path;
    }

    const { error } = await supabase.from('sites').update({
      grid_transformer_capacity: get('grid_transformer_capacity') || null,
      solar_capacity: getNum('solar_capacity'),
      generator_capacity: getNum('generator_capacity'),
      power_rfi_status: get('power_rfi_status') || 'Not Started',
      power_certificate_url: certUrl,
    }).eq('id', editSite.id);

    setSaving(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      await supabase.from('activity_log').insert({
        action: 'power_updated',
        description: `Power parameters updated for "${editSite.site_name}" (RFI: ${get('power_rfi_status')})`,
        user_id: user!.id, user_name: profile?.full_name,
        entity_type: 'site', entity_id: editSite.id,
      });
      toast({ title: 'Power record updated' });
      setEditSite(null);
      fetchData();
    }
  };

  return (
    <AuthGuard allowedRoles={['power_team']}>
      <DashboardLayout title="Power Dashboard" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="rounded-xl gradient-orange p-4 sm:p-6 text-primary-foreground">
                  <h2 className="text-lg sm:text-xl font-bold">Welcome, {profile?.full_name || 'Power Engineer'}! ⚡</h2>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">Configure grid, solar and generator capacity for procurement-approved sites.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <StatCard title="Eligible Sites" value={eligibleSites.length} icon={FileCheck} />
                  <StatCard title="Pending Power RFI" value={pendingCount} icon={Zap} color="text-warning" />
                  <StatCard title="RFI Approved" value={approvedCount} icon={Zap} color="text-success" />
                </div>
              </>
            )}

            {(activeTab === 'queue' || activeTab === 'overview') && (
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
                            <p className="text-xs text-muted-foreground">
                              {site.site_id_code} • RFI: <span className="font-medium">{site.power_rfi_status || 'Not Started'}</span>
                            </p>
                          </div>
                          <Button size="sm" onClick={() => setEditSite(site)}>Configure</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Dialog open={!!editSite} onOpenChange={o => { if (!o) setEditSite(null); }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Power Configuration — {editSite?.site_name}</DialogTitle></DialogHeader>
            {editSite && (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grid_transformer_capacity">Grid / Transformer Capacity</Label>
                  <Input id="grid_transformer_capacity" name="grid_transformer_capacity" placeholder="e.g. 100 kVA @ 11kV" defaultValue={editSite.grid_transformer_capacity || ''} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="solar_capacity">Solar Capacity (kWp)</Label>
                    <Input id="solar_capacity" name="solar_capacity" type="number" step="0.1" defaultValue={editSite.solar_capacity || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="generator_capacity">Generator Capacity (kVA)</Label>
                    <Input id="generator_capacity" name="generator_capacity" type="number" step="0.1" defaultValue={editSite.generator_capacity || ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Power RFI Status</Label>
                  <Select name="power_rfi_status" defaultValue={editSite.power_rfi_status || 'Not Started'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{rfiStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="power_certificate">Power Certificate (PDF/Image)</Label>
                  <Input id="power_certificate" name="power_certificate" type="file" accept=".pdf,image/*" />
                  {editSite.power_certificate_url && <p className="text-xs text-muted-foreground">Current certificate uploaded ✓</p>}
                </div>
                <Button type="submit" className="w-full gradient-orange border-0 text-primary-foreground" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Power Record
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  );
}
