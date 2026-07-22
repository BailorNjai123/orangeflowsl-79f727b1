import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Plus, FileText, Radio, MapPin, Building2, Loader2, Settings2, Paperclip } from 'lucide-react';
import SiteDetailsView from '@/components/SiteDetailsView';
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

const towerTypes = ['3-Leg', '4-Leg', 'Monopole'];
const towerMaterials = ['Steel', 'Concrete'];
const transmissionTypes = ['Microwave', 'Fiber', 'Satellite'];
const currentPhases = ['Planning', 'Foundation', 'Tower Erection', 'Integration'];
const siteTypes = ['Greenfield', 'Rooftop', 'Indoor', 'COW'];
const terrainTypes = ['Flat', 'Hilly', 'Swampy', 'Coastal'];
const accessRoadConditions = ['Good', 'Fair', 'Poor', 'No Road'];
const antennaTypes = ['Omni', 'Sector', 'Directional'];
const equipmentShelterTypes = ['Container', 'Cabinet', 'Building', 'None'];
const siteConfigurations = ['Standalone', 'Co-located', 'Rooftop', 'Underground', 'Hybrid'];
const deploymentStatuses = ['Not Started', 'In Progress', 'Completed'];
const scopeOptions = ['New Site', 'Upgrade', 'Swap', 'Expansion'];

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
  
  const [viewSite, setViewSite] = useState<SiteRow | null>(null);
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

    // Handle file uploads
    const uploadFile = async (fieldName: string): Promise<string | null> => {
      const file = fd.get(fieldName) as File;
      if (!file || file.size === 0) return editSite?.[`${fieldName}_url`] || null;
      
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/${Date.now()}_${fieldName}.${ext}`;
      const { error } = await supabase.storage.from('site-documents').upload(path, file, { upsert: true });
      if (error) {
        if (import.meta.env.DEV) console.error('Upload error:', error);
        return null;
      }
      return path;
    };

    const [sitePhotoUrl, layoutPlanUrl, approvalLetterUrl] = await Promise.all([
      uploadFile('site_photo'),
      uploadFile('layout_plan'),
      uploadFile('approval_letter'),
    ]);

    const siteData = {
      site_id_code: get('site_id_code'),
      site_name: get('site_name'),
      region: get('region'),
      district: get('district'),
      town: get('town'),
      dimensions: get('dimensions') || null,
      tower_height: getNum('tower_height'),
      foundation_depth: getNum('foundation_depth'),
      elevation: getNum('elevation'),
      distance_nearest_bts: getNum('distance_nearest_bts'),
      latitude: getNum('latitude'),
      longitude: getNum('longitude'),
      tower_type: get('tower_type') || null,
      tower_material: get('tower_material') || null,
      transmission_type: get('transmission_type') || null,
      earthing_resistance: getNum('earthing_resistance'),
      antenna_type: get('antenna_type') || null,
      number_of_antennas: getNum('number_of_antennas'),
      site_configuration: get('site_configuration') || null,
      equipment_shelter: get('equipment_shelter') || null,
      site_type: get('site_type') || null,
      terrain_type: get('terrain_type') || null,
      access_road_condition: get('access_road_condition') || null,
      vendor_name: get('vendor_name') || null,
      current_phase: get('current_phase') || null,
      planned_start_date: get('planned_start_date') || null,
      target_completion_date: get('target_completion_date') || null,
      last_inspection_date: get('last_inspection_date') || null,
      approval_date: get('approval_date') || null,
      scope: get('scope') || null,
      handover_to_vendor: get('handover_to_vendor') || null,
      soil_test: get('soil_test') || 'Not Started',
      site_implementation_design: get('site_implementation_design') || 'Not Started',
      cast_status: get('cast_status') || 'Not Started',
      tower_rig: get('tower_rig') || 'Not Started',
      civil_rfi: get('civil_rfi') || 'Not Started',
      
      on_air: get('on_air') || 'Not Started',
      notes: get('notes') || null,
      submitted_by: user!.id,
      status: 'pending' as const,
      site_photo_url: sitePhotoUrl,
      layout_plan_url: layoutPlanUrl,
      approval_letter_url: approvalLetterUrl,
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
      <div className="rounded-xl gradient-orange p-4 sm:p-5 md:p-6 text-primary-foreground">
        <h2 className="text-lg sm:text-xl font-bold">Welcome, {profile?.full_name || 'Planner'}! 👋</h2>
        <p className="text-xs sm:text-sm opacity-90 mt-1">Manage your BTS site submissions from here.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    <p className="text-xs text-muted-foreground">{site.region} • {site.site_id_code}</p>
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg sm:text-xl font-bold">{editSite ? 'Update Site' : 'Submit New BTS Site'}</h2>
        {editSite && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditSite(null)}>Cancel Edit</Button>
        )}
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> 📍 Basic Information</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="site_id_code">Site ID Code *</Label>
            <Input id="site_id_code" name="site_id_code" required placeholder="e.g. SITE003" defaultValue={editSite?.site_id_code || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site_name">Site Name *</Label>
            <Input id="site_name" name="site_name" required placeholder="e.g. Lumley Tower" defaultValue={editSite?.site_name || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <Input id="region" name="region" required placeholder="e.g. Western Area" defaultValue={editSite?.region || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District *</Label>
            <Input id="district" name="district" required placeholder="e.g. Freetown" defaultValue={editSite?.district || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="town">Town *</Label>
            <Input id="town" name="town" required placeholder="e.g. Lumley" defaultValue={editSite?.town || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions (m)</Label>
            <Input id="dimensions" name="dimensions" placeholder="e.g. 15x15" defaultValue={editSite?.dimensions || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tower_height">Tower Height (m) *</Label>
            <Input id="tower_height" name="tower_height" type="number" required placeholder="e.g. 60" defaultValue={editSite?.tower_height || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="foundation_depth">Foundation Depth (cm)</Label>
            <Input id="foundation_depth" name="foundation_depth" type="number" placeholder="e.g. 195" defaultValue={editSite?.foundation_depth || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="elevation">Elevation (m)</Label>
            <Input id="elevation" name="elevation" type="number" placeholder="e.g. 35" defaultValue={editSite?.elevation || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance_nearest_bts">Distance from Nearest BTS (km)</Label>
            <Input id="distance_nearest_bts" name="distance_nearest_bts" type="number" step="0.1" placeholder="e.g. 2.5" defaultValue={editSite?.distance_nearest_bts || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" name="latitude" type="number" step="0.000001" placeholder="e.g. 8.4657" defaultValue={editSite?.latitude || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" name="longitude" type="number" step="0.000001" placeholder="e.g. -13.2317" defaultValue={editSite?.longitude || ''} />
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> ⚙️ Technical Details</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tower Type *</Label>
            <Select name="tower_type" defaultValue={editSite?.tower_type || ''} required>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{towerTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tower Material *</Label>
            <Select name="tower_material" defaultValue={editSite?.tower_material || ''} required>
              <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
              <SelectContent>{towerMaterials.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Transmission Type</Label>
            <Select name="transmission_type" defaultValue={editSite?.transmission_type || ''}>
              <SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger>
              <SelectContent>{transmissionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="earthing_resistance">Earthing Resistance (Ohm)</Label>
            <Input id="earthing_resistance" name="earthing_resistance" type="number" placeholder="e.g. 5" defaultValue={editSite?.earthing_resistance || ''} />
          </div>
          <div className="space-y-2">
            <Label>Antenna Type</Label>
            <Select name="antenna_type" defaultValue={editSite?.antenna_type || ''}>
              <SelectTrigger><SelectValue placeholder="Select antenna type" /></SelectTrigger>
              <SelectContent>{antennaTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="number_of_antennas">Number of Antennas</Label>
            <Input id="number_of_antennas" name="number_of_antennas" type="number" placeholder="e.g. 3" defaultValue={editSite?.number_of_antennas || ''} />
          </div>
          <div className="space-y-2">
            <Label>Site Configuration</Label>
            <Select name="site_configuration" defaultValue={editSite?.site_configuration || ''}>
              <SelectTrigger><SelectValue placeholder="Select configuration" /></SelectTrigger>
              <SelectContent>{siteConfigurations.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Equipment Shelter</Label>
            <Select name="equipment_shelter" defaultValue={editSite?.equipment_shelter || ''}>
              <SelectTrigger><SelectValue placeholder="Select shelter type" /></SelectTrigger>
              <SelectContent>{equipmentShelterTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>


      {/* Project & Vendor Details */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> 🏗️ Project & Vendor Details</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Scope</Label>
            <Select name="scope" defaultValue={editSite?.scope || ''}>
              <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
              <SelectContent>{scopeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor_name">Vendor Assigned *</Label>
            <Input id="vendor_name" name="vendor_name" required placeholder="e.g. Huawei, ZTE" defaultValue={editSite?.vendor_name || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="handover_to_vendor">Handover to Vendor</Label>
            <Input id="handover_to_vendor" name="handover_to_vendor" type="date" defaultValue={editSite?.handover_to_vendor || ''} />
          </div>
          <div className="space-y-2">
            <Label>Site Type</Label>
            <Select name="site_type" defaultValue={editSite?.site_type || ''}>
              <SelectTrigger><SelectValue placeholder="Select site type" /></SelectTrigger>
              <SelectContent>{siteTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Terrain Type</Label>
            <Select name="terrain_type" defaultValue={editSite?.terrain_type || ''}>
              <SelectTrigger><SelectValue placeholder="Select terrain type" /></SelectTrigger>
              <SelectContent>{terrainTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Access Road Condition</Label>
            <Select name="access_road_condition" defaultValue={editSite?.access_road_condition || ''}>
              <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
              <SelectContent>{accessRoadConditions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Current Phase *</Label>
            <Select name="current_phase" defaultValue={editSite?.current_phase || ''} required>
              <SelectTrigger><SelectValue placeholder="Select phase" /></SelectTrigger>
              <SelectContent>{currentPhases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="planned_start_date">Planned Start Date</Label>
            <Input id="planned_start_date" name="planned_start_date" type="date" defaultValue={editSite?.planned_start_date || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_completion_date">Expected Completion Date</Label>
            <Input id="target_completion_date" name="target_completion_date" type="date" defaultValue={editSite?.target_completion_date || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_inspection_date">Last Inspection Date</Label>
            <Input id="last_inspection_date" name="last_inspection_date" type="date" defaultValue={editSite?.last_inspection_date || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="approval_date">Approval Date</Label>
            <Input id="approval_date" name="approval_date" type="date" defaultValue={editSite?.approval_date || ''} />
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Paperclip className="h-4 w-4 text-primary" /> 📂 Attachments</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="site_photo">Upload Site Photo</Label>
            <Input id="site_photo" name="site_photo" type="file" accept="image/*" />
            {editSite?.site_photo_url && <p className="text-xs text-muted-foreground">Current file uploaded ✓</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="layout_plan">Upload Site Layout Plan</Label>
            <Input id="layout_plan" name="layout_plan" type="file" accept=".pdf,.jpg,.png" />
            {editSite?.layout_plan_url && <p className="text-xs text-muted-foreground">Current file uploaded ✓</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="approval_letter">Upload Approval Letter (PDF)</Label>
            <Input id="approval_letter" name="approval_letter" type="file" accept=".pdf" />
            {editSite?.approval_letter_url && <p className="text-xs text-muted-foreground">Current file uploaded ✓</p>}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Progress */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">🚀 Deployment Progress</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {[
            { name: 'soil_test', label: 'Soil Test' },
            { name: 'site_implementation_design', label: 'Site Implementation Design' },
            { name: 'cast_status', label: 'Cast' },
            { name: 'tower_rig', label: 'Tower Rig' },
            { name: 'civil_rfi', label: 'Civil RFI' },
            { name: 'power_rfi', label: 'Power RFI' },
            { name: 'on_air', label: 'On Air' },
          ].map(field => (
            <div key={field.name} className="space-y-2">
              <Label>{field.label}</Label>
              <Select name={field.name} defaultValue={editSite?.[field.name] || 'Not Started'}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>{deploymentStatuses.map(s => <SelectItem key={s} value={s}>{s === 'Not Started' ? '🔴' : s === 'In Progress' ? '🟡' : '🟢'} {s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="pt-6">
          <Label htmlFor="notes">📝 Comments</Label>
          <Textarea id="notes" name="notes" className="mt-2" rows={4} defaultValue={editSite?.notes || ''} placeholder="Enter any comments..." />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full sm:w-auto gradient-orange border-0 text-primary-foreground" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {editSite ? 'Update Site' : 'Submit Site'}
      </Button>
    </form>
  );

  const renderSubmissions = () => (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold">My Submissions</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : sites.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No submissions yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sites.map(site => (
            <Card key={site.id} className="overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{site.site_name}</h3>
                      <StatusBadge status={site.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {site.site_id_code} • {site.region} • {new Date(site.created_at).toLocaleDateString()}
                    </p>
                    {site.review_notes && (
                      <p className="text-xs mt-2 p-2 rounded bg-muted text-muted-foreground">
                        <span className="font-medium">Review Notes:</span> {site.review_notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => setViewSite(site)}>View</Button>
                    {(site.status === 'pending' || site.status === 'rejected') && (
                      <Button size="sm" variant="outline" onClick={() => startEdit(site)}>Edit</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Site Dialog */}
      {viewSite && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setViewSite(null)}>
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{viewSite.site_name}</h3>
              <Button size="sm" variant="ghost" onClick={() => setViewSite(null)}>✕</Button>
            </div>
            <SiteDetailsView site={viewSite} allowFileManage={viewSite.status === 'pending' || viewSite.status === 'rejected'} onFileUpdated={fetchSites} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AuthGuard allowedRoles={['planning_team']}>
      <DashboardLayout title="Planning Dashboard" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'submit' && renderSubmitForm()}
        {activeTab === 'submissions' && renderSubmissions()}
      </DashboardLayout>
    </AuthGuard>
  );
}
