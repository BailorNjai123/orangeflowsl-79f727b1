import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, MessageSquare, ClipboardList, Loader2, Check, X, Radio } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
      { key: 'land_identified', label: 'Land Identified' },
      { key: 'ownership_verified', label: 'Ownership Verified' },
      { key: 'acquisition_approved', label: 'Acquisition Approved' },
    ],
  },
  {
    title: 'Land Lease',
    color: 'border-purple-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600',
    items: [
      { key: 'lease_negotiation', label: 'Lease Negotiation' },
      { key: 'lease_signed', label: 'Lease Signed' },
      { key: 'lease_registration', label: 'Lease Registration' },
    ],
  },
  {
    title: 'Handover to Vendor',
    color: 'border-emerald-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
    items: [
      { key: 'road_access', label: 'Road Access' },
      { key: 'vendor_contract', label: 'Vendor Contract' },
      { key: 'site_handover', label: 'Site Handover' },
    ],
  },
];

export default function ProcurementDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [approvedSites, setApprovedSites] = useState<Site[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [mySubmissions, setMySubmissions] = useState<ProcSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [formSite, setFormSite] = useState<Site | null>(null);
  const [formValues, setFormValues] = useState<Record<string, boolean>>({});
  const [formNotes, setFormNotes] = useState('');
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    const [sitesRes, feedbackRes, procRes] = await Promise.all([
      supabase.from('sites').select('*').eq('status', 'approved').order('updated_at', { ascending: false }),
      supabase.from('procurement_feedback').select('*, sites(site_name, site_id_code, region, district)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('procurement_submissions').select('*, sites(site_name, site_id_code, region, district)').eq('submitted_by', user.id).order('created_at', { ascending: false }),
    ]);
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
      site_id: selectedSite.id,
      user_id: user!.id,
      status,
      feedback_notes: feedbackNotes,
    });
    setSubmitting(false);
    if (!error) {
      toast({ title: `Feedback submitted: ${status}` });
      setSelectedSite(null);
      setFeedbackNotes('');
      fetchData();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const initForm = (site: Site) => {
    setFormSite(site);
    const init: Record<string, boolean> = {};
    procSections.forEach(s => s.items.forEach(i => { init[i.key] = false; }));
    setFormValues(init);
    setFormNotes('');
    setActiveTab('submissions');
  };

  const handleProcSubmit = async () => {
    if (!formSite) return;
    setSubmitting(true);
    const { error } = await supabase.from('procurement_submissions').insert({
      site_id: formSite.id,
      submitted_by: user!.id,
      ...formValues,
      notes: formNotes || null,
      status: 'pending',
    });
    setSubmitting(false);
    if (!error) {
      await supabase.from('activity_log').insert({
        action: 'procurement_submitted',
        description: `Procurement form submitted for "${formSite.site_name}"`,
        user_id: user!.id,
        user_name: profile?.full_name,
        entity_type: 'procurement_submission',
        entity_id: formSite.id,
      });
      toast({ title: 'Procurement form submitted for review!' });
      setFormSite(null);
      fetchData();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const pendingFeedback = approvedSites.filter(s => !feedbacks.find(f => f.site_id === s.id));
  const acceptedFeedbacks = feedbacks.filter(f => f.status === 'accepted');

  // Sites accepted via feedback and not yet submitted via procurement
  const sitesForProcForm = approvedSites.filter(s => {
    const fb = feedbacks.find(f => f.site_id === s.id && f.status === 'accepted');
    const alreadySubmitted = mySubmissions.find(p => p.site_id === s.id);
    return fb && !alreadySubmitted;
  });

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="rounded-xl gradient-orange p-5 md:p-6 text-primary-foreground">
        <h2 className="text-xl font-bold">Welcome, {profile?.full_name || 'Team'}! 👋</h2>
        <p className="text-sm opacity-90 mt-1">Manage procurement feedback and submissions.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="Pending Review" value={pendingFeedback.length} icon={MessageSquare} color="text-warning" />
        <StatCard title="Accepted" value={acceptedFeedbacks.length} icon={Check} color="text-success" />
        <StatCard title="Submissions" value={mySubmissions.length} icon={ClipboardList} />
        <StatCard title="All Sites" value={approvedSites.length} icon={Radio} />
      </div>

      {pendingFeedback.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Sites Awaiting Feedback</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pendingFeedback.slice(0, 5).map(site => (
              <div key={site.id} className="flex items-center justify-between p-3 rounded-lg border gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{site.site_name}</p>
                  <p className="text-xs text-muted-foreground">{site.region} • {site.district}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setSelectedSite(site); setFeedbackNotes(''); setActiveTab('feedback'); }}>
                  Review
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Site Feedback</h2>

      {/* Pending sites */}
      {pendingFeedback.map(site => (
        <Card key={site.id} className={selectedSite?.id === site.id ? 'ring-2 ring-primary' : ''}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-semibold text-sm">{site.site_name}</h3>
                <p className="text-xs text-muted-foreground">{site.site_id_code} • {site.region}, {site.district}</p>
              </div>
              {selectedSite?.id !== site.id && (
                <Button size="sm" variant="outline" onClick={() => { setSelectedSite(site); setFeedbackNotes(''); }}>
                  Give Feedback
                </Button>
              )}
            </div>
            {selectedSite?.id === site.id && (
              <div className="space-y-3 border-t pt-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Type:</span> {site.site_type || '-'}</div>
                  <div><span className="text-muted-foreground">Tower:</span> {site.tower_type || '-'}</div>
                  <div><span className="text-muted-foreground">Height:</span> {site.tower_height ? `${site.tower_height}m` : '-'}</div>
                  <div><span className="text-muted-foreground">Power:</span> {site.power_source || '-'}</div>
                </div>
                <Textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Your feedback notes (required)..."
                  rows={3}
                />
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
      {pendingFeedback.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No sites awaiting feedback.</CardContent></Card>}

      {/* Recent feedbacks */}
      {feedbacks.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-6">Recently Reviewed</h3>
          {feedbacks.map(fb => (
            <Card key={fb.id} className={`border-l-4 ${fb.status === 'accepted' ? 'border-l-success' : 'border-l-destructive'}`}>
              <CardContent className="p-4">
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
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Procurement Submissions</h2>

      {/* The 9-Parameter Form */}
      {formSite ? (
        <div className="space-y-4">
          <Card className="gradient-orange text-primary-foreground">
            <CardContent className="p-4">
              <h3 className="font-bold">{formSite.site_name}</h3>
              <p className="text-sm opacity-90">{formSite.site_id_code} • {formSite.region}, {formSite.district}</p>
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
              <CardContent className="space-y-3">
                {section.items.map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${formValues[item.key] ? 'text-success' : 'text-destructive'}`}>
                        {formValues[item.key] ? 'Yes' : 'No'}
                      </span>
                      <Switch
                        checked={formValues[item.key]}
                        onCheckedChange={(v) => setFormValues(prev => ({ ...prev, [item.key]: v }))}
                      />
                    </div>
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
          {/* Sites awaiting action */}
          {sitesForProcForm.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">Sites Awaiting Procurement Action</h3>
              {sitesForProcForm.map(site => (
                <Card key={site.id}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{site.site_name}</p>
                      <p className="text-xs text-muted-foreground">{site.region} • {site.district}</p>
                    </div>
                    <Button size="sm" className="gradient-orange border-0 text-primary-foreground" onClick={() => initForm(site)}>
                      Take Action
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* My submissions history */}
          {mySubmissions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">My Submissions</h3>
              {mySubmissions.map(proc => (
                <Card key={proc.id}>
                  <CardContent className="p-4">
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
                    {proc.review_notes && (
                      <p className="text-xs mt-2 p-2 rounded bg-muted text-muted-foreground">Review: {proc.review_notes}</p>
                    )}
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
