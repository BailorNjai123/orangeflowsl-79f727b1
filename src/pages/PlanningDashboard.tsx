import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Plus, FileText, Radio, MapPin, Building2, Loader2 } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, value: 'dashboard' },
  { label: 'Submit New Site', icon: Plus, value: 'submit' },
  { label: 'My Submissions', icon: FileText, value: 'submissions' },
];

const regions = ['Western Area', 'Northern', 'Southern', 'Eastern'];
const towerTypes = ['Greenfield', 'Rooftop', 'Camouflage', 'COW (Cell on Wheels)'];
const terrainTypes = ['Flat', 'Hilly', 'Mountainous', 'Swampy', 'Urban'];
const powerSources = ['Grid Power', 'Solar', 'Hybrid (Grid+Solar)', 'Generator'];
const siteTypes = ['Macro', 'Micro', 'Small Cell', 'Indoor'];

type SiteRow = {
  id: string;
  site_id_code: string;
  site_name: string;
  region: string;
  district: string;
  town: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  review_notes: string | null;
  [key: string]: any;
};

export default function PlanningDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editSite, setEditSite] = useState<SiteRow | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchSites = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('submitted_by', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setSites(data as SiteRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchSites(); }, [user]);

  const pending = sites.filter(s => s.status === 'pending').length;
  const approved = sites.filter(s => s.status === 'approved').length;
  const rejected = sites.filter(s => s.status === 'rejected').length;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => fd.get(k)?.toString() || '';
    const getNum = (k: string) => { const v = fd.get(k)?.toString(); return v ? parseFloat(v) : null; };

    const siteData = {
      site_name: get('site_name'),
      region: get('region'),
      district: get('district'),
      town: get('town'),
      address: get('address') || null,
      latitude: getNum('latitude'),
      longitude: getNum('longitude'),
      site_type: get('site_type') || null,
      tower_type: get('tower_type') || null,
      tower_height: getNum('tower_height'),
      antenna_type: get('antenna_type') || null,
      number_of_antennas: getNum('number_of_antennas'),
      power_source: get('power_source') || null,
      backup_power: get('backup_power') || null,
      terrain_type: get('terrain_type') || null,
      access_road_condition: get('access_road_condition') || null,
      equipment_shelter: get('equipment_shelter') || null,
      project_name: get('project_name') || null,
      contractor_name: get('contractor_name') || null,
      vendor_name: get('vendor_name') || null,
      estimated_cost: getNum('estimated_cost'),
      target_completion_date: get('target_completion_date') || null,
      notes: get('notes') || null,
      submitted_by: user!.id,
      status: 'pending' as const,
    };

    let error;
    if (editSite) {
      ({ error } = await supabase.from('sites').update(siteData).eq('id', editSite.id));
    } else {
      ({ error } = await supabase.from('sites').insert(siteData));
    }

    setSubmitting(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: editSite ? 'Site Updated' : 'Site Submitted', description: 'Your BTS site has been submitted for review.' });
      setEditSite(null);
      fetchSites();
      setActiveTab('submissions');
    }
  };

  const startEdit = (site: SiteRow) => {
    setEditSite(site);
    setActiveTab('submit');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="rounded-xl gradient-orange p-5 md:p-6 text-primary-foreground">
        <h2 className="text-xl font-bold">Welcome, {profile?.full_name || 'Planner'}! 👋</h2>
        <p className="text-sm opacity-90 mt-1">Manage your BTS site submissions from here.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="Total" value={sites.length} icon={Radio} />
        <StatCard title="Pending" value={pending} icon={FileText} color="text-warning" />
        <StatCard title="Approved" value={approved} icon={FileText} color="text-success" />
        <StatCard title="Rejected" value={rejected} icon={FileText} color="text-destructive" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Submissions</CardTitle></CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No submissions yet. Submit your first BTS site!</p>
          ) : (
            <div className="space-y-3">
              {sites.slice(0, 5).map(site => (
                <div key={site.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{site.site_name}</p>
                    <p className="text-xs text-muted-foreground">{site.region} • {site.district}</p>
                  </div>
                  <StatusBadge status={site.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSubmitForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{editSite ? 'Update Site' : 'Submit New BTS Site'}</h2>
        {editSite && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditSite(null)}>Cancel Edit</Button>
        )}
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Basic Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="site_name">Site Name *</Label>
            <Input id="site_name" name="site_name" required defaultValue={editSite?.site_name || ''} />
          </div>
          <div className="space-y-2">
            <Label>Region *</Label>
            <Select name="region" defaultValue={editSite?.region || ''} required>
              <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
              <SelectContent>{regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District *</Label>
            <Input id="district" name="district" required defaultValue={editSite?.district || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="town">Town *</Label>
            <Input id="town" name="town" required defaultValue={editSite?.town || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={editSite?.address || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" name="latitude" type="number" step="any" defaultValue={editSite?.latitude || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" name="longitude" type="number" step="any" defaultValue={editSite?.longitude || ''} />
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Radio className="h-4 w-4 text-primary" /> Technical Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Site Type</Label>
            <Select name="site_type" defaultValue={editSite?.site_type || ''}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{siteTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tower Type</Label>
            <Select name="tower_type" defaultValue={editSite?.tower_type || ''}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{towerTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tower_height">Tower Height (m)</Label>
            <Input id="tower_height" name="tower_height" type="number" defaultValue={editSite?.tower_height || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="antenna_type">Antenna Type</Label>
            <Input id="antenna_type" name="antenna_type" defaultValue={editSite?.antenna_type || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number_of_antennas">Number of Antennas</Label>
            <Input id="number_of_antennas" name="number_of_antennas" type="number" defaultValue={editSite?.number_of_antennas || ''} />
          </div>
          <div className="space-y-2">
            <Label>Power Source</Label>
            <Select name="power_source" defaultValue={editSite?.power_source || ''}>
              <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>{powerSources.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="backup_power">Backup Power</Label>
            <Input id="backup_power" name="backup_power" defaultValue={editSite?.backup_power || ''} />
          </div>
          <div className="space-y-2">
            <Label>Terrain Type</Label>
            <Select name="terrain_type" defaultValue={editSite?.terrain_type || ''}>
              <SelectTrigger><SelectValue placeholder="Select terrain" /></SelectTrigger>
              <SelectContent>{terrainTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="access_road_condition">Access Road Condition</Label>
            <Input id="access_road_condition" name="access_road_condition" defaultValue={editSite?.access_road_condition || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipment_shelter">Equipment Shelter</Label>
            <Input id="equipment_shelter" name="equipment_shelter" defaultValue={editSite?.equipment_shelter || ''} />
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Project &amp; Vendor Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project_name">Project Name</Label>
            <Input id="project_name" name="project_name" defaultValue={editSite?.project_name || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractor_name">Contractor</Label>
            <Input id="contractor_name" name="contractor_name" defaultValue={editSite?.contractor_name || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor_name">Vendor</Label>
            <Input id="vendor_name" name="vendor_name" defaultValue={editSite?.vendor_name || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
            <Input id="estimated_cost" name="estimated_cost" type="number" defaultValue={editSite?.estimated_cost || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_completion_date">Target Completion</Label>
            <Input id="target_completion_date" name="target_completion_date" type="date" defaultValue={editSite?.target_completion_date || ''} />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="pt-6">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea id="notes" name="notes" className="mt-2" rows={4} defaultValue={editSite?.notes || ''} placeholder="Any additional information about this site..." />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full sm:w-auto gradient-orange border-0 text-primary-foreground" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {editSite ? 'Update Site' : 'Submit for Review'}
      </Button>
    </form>
  );

  const renderSubmissions = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">My Submissions</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : sites.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No submissions yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sites.map(site => (
            <Card key={site.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{site.site_name}</h3>
                      <StatusBadge status={site.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {site.site_id_code} • {site.region}, {site.district} • {new Date(site.created_at).toLocaleDateString()}
                    </p>
                    {site.review_notes && (
                      <p className="text-xs mt-2 p-2 rounded bg-muted text-muted-foreground">
                        <span className="font-medium">Review Notes:</span> {site.review_notes}
                      </p>
                    )}
                  </div>
                  {(site.status === 'pending' || site.status === 'rejected') && (
                    <Button size="sm" variant="outline" onClick={() => startEdit(site)}>
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AuthGuard allowedRoles={['planning_team']}>
      <DashboardLayout
        title="Planning Dashboard"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'submit' && renderSubmitForm()}
        {activeTab === 'submissions' && renderSubmissions()}
      </DashboardLayout>
    </AuthGuard>
  );
}
