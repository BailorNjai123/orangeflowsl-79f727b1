import { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, ClipboardList, Loader2, Check, X, Radio, Paperclip } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, value: 'dashboard' },
  { label: 'Site Feedback', icon: MessageSquare, value: 'feedback' },
  { label: 'Procurement Form', icon: ClipboardList, value: 'submissions' },
];

type Site = any;
type Feedback = any;
type ProcSubmission = any;

const procSections = [
  {
    title: 'Land Acquisition',
    color: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    items: [
      { key: 'land_identified', label: 'Land Identified', fileLabel: 'Land Identification / Survey PDF' },
      { key: 'ownership_verified', label: 'Ownership Verified', fileLabel: 'Ownership Proof / Title PDF' },
      { key: 'acquisition_approved', label: 'Land Acquisition Approved', fileLabel: 'Approval Document PDF' },
    ],
  },
  {
    title: 'Land Lease',
    color: 'border-purple-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600',
    items: [
      { key: 'lease_negotiation', label: 'Lease Negotiation Completed', fileLabel: 'Negotiation Summary PDF' },
      { key: 'lease_signed', label: 'Land Lease Signed', fileLabel: 'Signed Lease Agreement PDF' },
      { key: 'lease_registration', label: 'Lease Registration Completed', fileLabel: 'Registered Lease PDF' },
    ],
  },
  {
    title: 'Handover to Vendor',
    color: 'border-emerald-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
    items: [
      { key: 'road_access', label: 'Road Access Available', fileLabel: 'Road Access Approval / Photo' },
      { key: 'vendor_contract', label: 'Vendor Contract Signed', fileLabel: 'Vendor Contract PDF' },
      { key: 'site_handover', label: 'Site Handover to Vendor Completed', fileLabel: 'Site Handover Certificate PDF' },
    ],
  },
];

export default function ProcurementDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [approvedSites, setApprovedSites] = useState<Site[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [mySubmissions, setMySubmissions] = useState<ProcSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [formSite, setFormSite] = useState<Site | null>(null);
  const [formValues, setFormValues] = useState<Record<string, boolean>>({});
  const [formFiles, setFormFiles] = useState<Record<string, File | null>>({});
  const [formNotes, setFormNotes] = useState('');
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    const [allSitesRes, sitesRes, feedbackRes, procRes] = await Promise.all([
      supabase.from('sites').select('*').order('created_at', { ascending: false }),
      supabase.from('sites').select('*').eq('status', 'approved').order('updated_at', { ascending: false }),
      supabase.from('procurement_feedback').select('*, sites(site_name, site_id_code, region, district)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('procurement_submissions').select('*, sites(site_name, site_id_code, region, district)').eq('submitted_by', user.id).order('created_at', { ascending: false }),
    ]);
    if (allSitesRes.data) setAllSites(allSitesRes.data);
    if (sitesRes.data) setApprovedSites(sitesRes.data);
    if (feedbackRes.data) setFeedbacks(feedbackRes.data);
    if (procRes.data) setMySubmissions(procRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleFeedback = async (status: 'accepted' | 'rejected') => {
    if (!selectedSite || !feedbackNotes.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please add feedback notes.' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('procurement_feedback').insert({
      site_id: selectedSite.id, user_id: user!.id, status, feedback_notes: feedbackNotes,
    });
    setSubmitting(false);
    if (!error) {
      await supabase.from('activity_log').insert({
        action: status === 'accepted' ? 'procurement_feedback_accepted' : 'procurement_feedback_rejected',
        description: `Procurement ${status} site "${selectedSite.site_name}"`,
        user_id: user!.id, user_name: profile?.full_name, entity_type: 'site', entity_id: selectedSite.id,
      });
      toast({ title: `Feedback submitted: ${status}` });
      setSelectedSite(null); setFeedbackNotes(''); fetchData();
    } else toast({ variant: 'destructive', title: 'Error', description: error.message });
  };

  const initForm = (site: Site) => {
    setFormSite(site);
    const init: Record<string, boolean> = {};
    const initFiles: Record<string, File | null> = {};
    procSections.forEach(s => s.items.forEach(i => { init[i.key] = false; initFiles[i.key] = null; }));
    setFormValues(init);
    setFormFiles(initFiles);
    setFormNotes('');
    setActiveTab('submissions');
  };

  const handleProcSubmit = async () => {
    if (!formSite) return;
    setSubmitting(true);

    // Upload files
    const fileUrls: Record<string, string | null> = {};
    for (const section of procSections) {
      for (const item of section.items) {
        const file = formFiles[item.key];
        if (file && file.size > 0) {
          const ext = file.name.split('.').pop();
          const path = `${user!.id}/${formSite.id}/${item.key}_${Date.now()}.${ext}`;
          const { error } = await supabase.storage.from('procurement-documents').upload(path, file);
          if (!error) {
            const { data: urlData } = supabase.storage.from('procurement-documents').getPublicUrl(path);
            fileUrls[`${item.key}_file_url`] = urlData.publicUrl;
          }
        }
      }
    }

    const { error } = await supabase.from('procurement_submissions').insert({
      site_id: formSite.id, submitted_by: user!.id,
      ...formValues, ...fileUrls,
      notes: formNotes || null, status: 'pending',
    });
    setSubmitting(false);
    if (!error) {
      await supabase.from('activity_log').insert({
        action: 'procurement_submitted',
        description: `Procurement form submitted for "${formSite.site_name}"`,
        user_id: user!.id, user_name: profile?.full_name,
        entity_type: 'procurement_submission', entity_id: formSite.id,
      });
      toast({ title: 'Procurement form submitted for review!' });
      setFormSite(null); fetchData();
    } else toast({ variant: 'destructive', title: 'Error', description: error.message });
  };

  // Sites pending feedback (all submitted sites, not just approved)
  const pendingSitesForFeedback = allSites.filter(s => s.status === 'pending' && !feedbacks.find(f => f.site_id === s.id));
  const acceptedFeedbacks = feedbacks.filter(f => f.status === 'accepted');

  const sitesForProcForm = approvedSites.filter(s => {
    const fb = feedbacks.find(f => f.site_id === s.id && f.status === 'accepted');
    const alreadySubmitted = mySubmissions.find(p => p.site_id === s.id);
    return fb && !alreadySubmitted;
  });

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="rounded-xl gradient-orange p-4 sm:p-5 md:p-6 text-primary-foreground">
        <h2 className="text-lg sm:text-xl font-bold">Welcome, {profile?.full_name || 'Team'}! 👋</h2>
        <p className="text-xs sm:text-sm opacity-90 mt-1">Manage procurement feedback and submissions.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Pending Review" value={pendingSitesForFeedback.length} icon={MessageSquare} color="text-warning" />
        <StatCard title="Accepted" value={acceptedFeedbacks.length} icon={Check} color="text-success" />
        <StatCard title="Submissions" value={mySubmissions.length} icon={ClipboardList} />
        <StatCard title="All Sites" value={allSites.length} icon={Radio} />
      </div>
      {pendingSitesForFeedback.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Sites Awaiting Feedback</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pendingSitesForFeedback.slice(0, 5).map(site => (
              <div key={site.id} className="flex items-center justify-between p-3 rounded-lg border gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{site.site_name}</p>
                  <p className="text-xs text-muted-foreground">{site.region}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setSelectedSite(site); setFeedbackNotes(''); setActiveTab('feedback'); }}>Review</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold">Site Feedback</h2>
      {pendingSitesForFeedback.map(site => (
        <Card key={site.id} className={selectedSite?.id === site.id ? 'ring-2 ring-primary' : ''}>
          <CardContent className="p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">{site.site_name}</h3>
                <p className="text-xs text-muted-foreground">{site.site_id_code} • {site.region}</p>
              </div>
              {selectedSite?.id !== site.id && (
                <Button size="sm" variant="outline" onClick={() => { setSelectedSite(site); setFeedbackNotes(''); }}>Give Feedback</Button>
              )}
            </div>
            {selectedSite?.id === site.id && (
              <div className="space-y-3 border-t pt-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Type:</span> {site.tower_type || '-'}</div>
                  <div><span className="text-muted-foreground">Height:</span> {site.tower_height ? `${site.tower_height}m` : '-'}</div>
                  <div><span className="text-muted-foreground">Phase:</span> {site.current_phase || '-'}</div>
                  <div><span className="text-muted-foreground">Vendor:</span> {site.vendor_name || '-'}</div>
                </div>
                <Textarea value={feedbackNotes} onChange={(e) => setFeedbackNotes(e.target.value)} placeholder="Your feedback notes (required)..." rows={3} />
                <div className="flex gap-2">
                  <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground" disabled={submitting} onClick={() => handleFeedback('accepted')}>
                    <Check className="h-4 w-4 mr-1" /> Accept
                  </Button>
                  <Button variant="destructive" className="flex-1" disabled={submitting} onClick={() => handleFeedback('rejected')}>
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {pendingSitesForFeedback.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No sites awaiting feedback.</CardContent></Card>}

      {feedbacks.length > 0 && (
        <>
          <h3 className="text-base sm:text-lg font-semibold mt-6">Recently Reviewed</h3>
          {feedbacks.map(fb => (
            <Card key={fb.id} className={`border-l-4 ${fb.status === 'accepted' ? 'border-l-success' : 'border-l-destructive'}`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{fb.sites?.site_name}</span>
                  <StatusBadge status={fb.status === 'accepted' ? 'approved' : 'rejected'} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{fb.feedback_notes}</p>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-bold">Procurement Submissions</h2>

      {formSite ? (
        <div className="space-y-4">
          <Card className="gradient-orange text-primary-foreground">
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-bold">{formSite.site_name}</h3>
              <p className="text-sm opacity-90">{formSite.site_id_code} • {formSite.region}</p>
            </CardContent>
          </Card>

          {procSections.map((section, si) => (
            <Card key={section.title} className={`border-l-4 ${section.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${section.bgColor} ${section.textColor}`}>{si + 1}</span>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map(item => (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${formValues[item.key] ? 'text-success' : 'text-destructive'}`}>
                          {formValues[item.key] ? 'Yes' : 'No'}
                        </span>
                        <Switch checked={formValues[item.key]} onCheckedChange={(v) => setFormValues(prev => ({ ...prev, [item.key]: v }))} />
                      </div>
                    </div>
                    {formValues[item.key] && (
                      <div className="ml-3 sm:ml-4 space-y-1">
                        <Label className="text-xs flex items-center gap-1"><Paperclip className="h-3 w-3" /> {item.fileLabel}</Label>
                        <Input type="file" accept=".pdf,.jpg,.png" className="text-xs" onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormFiles(prev => ({ ...prev, [item.key]: file }));
                        }} />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="pt-6 space-y-3">
              <Label>Additional Notes</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3} placeholder="Any additional notes..." />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFormSite(null)}>Cancel</Button>
            <Button className="flex-1 gradient-orange border-0 text-primary-foreground" disabled={submitting} onClick={handleProcSubmit}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit to Project Team
            </Button>
          </div>
        </div>
      ) : (
        <>
          {sitesForProcForm.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-semibold">Sites Awaiting Procurement Action</h3>
              {sitesForProcForm.map(site => (
                <Card key={site.id}>
                  <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{site.site_name}</p>
                      <p className="text-xs text-muted-foreground">{site.region}</p>
                    </div>
                    <Button size="sm" className="gradient-orange border-0 text-primary-foreground" onClick={() => initForm(site)}>Take Action</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {mySubmissions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-semibold">My Submissions</h3>
              {mySubmissions.map(proc => (
                <Card key={proc.id}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h4 className="text-sm font-semibold">{proc.sites?.site_name || 'Site'}</h4>
                      <StatusBadge status={proc.status} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {procSections.flatMap(s => s.items).map(p => (
                        <span key={p.key} className={`text-[10px] px-1.5 py-0.5 rounded ${proc[p.key] ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          {proc[p.key] ? '✓' : '✗'} {p.label}
                        </span>
                      ))}
                    </div>
                    {proc.review_notes && <p className="text-xs mt-2 p-2 rounded bg-muted text-muted-foreground">Review: {proc.review_notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {sitesForProcForm.length === 0 && mySubmissions.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No procurement actions available. Accept sites in the Feedback tab first.</CardContent></Card>
          )}
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <AuthGuard allowedRoles={['procurement_team']}>
        <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['procurement_team']}>
      <DashboardLayout title="Procurement Dashboard" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'feedback' && renderFeedback()}
        {activeTab === 'submissions' && renderSubmissions()}
      </DashboardLayout>
    </AuthGuard>
  );
}
