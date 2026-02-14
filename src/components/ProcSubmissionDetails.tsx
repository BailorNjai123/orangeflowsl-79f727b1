import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, FileDown, Trash2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

const procSections = [
  {
    title: 'Land Acquisition',
    colorClass: 'border-l-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    items: [
      { key: 'land_identified', label: 'Land Identified', fileLabel: 'Land Identification / Survey' },
      { key: 'ownership_verified', label: 'Ownership Verified', fileLabel: 'Ownership Proof / Title' },
      { key: 'acquisition_approved', label: 'Land Acquisition Approved', fileLabel: 'Approval Document' },
    ],
  },
  {
    title: 'Land Lease',
    colorClass: 'border-l-purple-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600',
    items: [
      { key: 'lease_negotiation', label: 'Lease Negotiation Completed', fileLabel: 'Negotiation Summary' },
      { key: 'lease_signed', label: 'Land Lease Signed', fileLabel: 'Signed Lease Agreement' },
      { key: 'lease_registration', label: 'Lease Registration Completed', fileLabel: 'Registered Lease' },
    ],
  },
  {
    title: 'Handover to Vendor',
    colorClass: 'border-l-emerald-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
    items: [
      { key: 'road_access', label: 'Road Access Available', fileLabel: 'Road Access Approval / Photo' },
      { key: 'vendor_contract', label: 'Vendor Contract Signed', fileLabel: 'Vendor Contract' },
      { key: 'site_handover', label: 'Site Handover Completed', fileLabel: 'Handover Certificate' },
    ],
  },
];

function FileLink({ url, label, submissionId, fieldName, allowManage, onUpdated }: {
  url: string | null | undefined; label: string;
  submissionId?: string; fieldName?: string; allowManage?: boolean; onUpdated?: () => void;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!url) { setSignedUrl(null); return; }
    if (url.startsWith('http')) { setSignedUrl(url); return; }
    supabase.storage.from('procurement-documents').createSignedUrl(url, 3600).then(({ data }) => {
      if (data?.signedUrl) setSignedUrl(data.signedUrl);
    });
  }, [url]);

  const handleDelete = async () => {
    if (!url || !submissionId || !fieldName) return;
    setDeleting(true);
    if (!url.startsWith('http')) {
      await supabase.storage.from('procurement-documents').remove([url]);
    }
    await supabase.from('procurement_submissions').update({ [fieldName]: null }).eq('id', submissionId);
    setDeleting(false);
    onUpdated?.();
  };

  const handleReplace = async (file: File) => {
    if (!submissionId || !fieldName) return;
    setUploading(true);
    if (url && !url.startsWith('http')) {
      await supabase.storage.from('procurement-documents').remove([url]);
    }
    const ext = file.name.split('.').pop();
    const newPath = `${submissionId}/${Date.now()}_${fieldName.replace('_file_url', '')}.${ext}`;
    const { error } = await supabase.storage.from('procurement-documents').upload(newPath, file, { upsert: true });
    if (!error) {
      await supabase.from('procurement_submissions').update({ [fieldName]: newPath }).eq('id', submissionId);
    }
    setUploading(false);
    onUpdated?.();
  };

  if (!url && !allowManage) return null;

  return (
    <div className="flex flex-col gap-0.5 mt-1">
      {url && signedUrl ? (
        <a href={signedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <FileDown className="h-3 w-3" /> {label}
        </a>
      ) : url && !signedUrl ? (
        <span className="text-xs text-muted-foreground">Loading file...</span>
      ) : null}
      {allowManage && (
        <div className="flex items-center gap-1.5">
          <label className="cursor-pointer">
            <Input type="file" accept=".pdf,.jpg,.png,image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleReplace(file);
            }} disabled={uploading} />
            <span className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline cursor-pointer">
              <Upload className="h-3 w-3" /> {url ? 'Replace' : 'Upload'}
              {uploading && '...'}
            </span>
          </label>
          {url && (
            <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-0.5 text-[10px] text-destructive hover:underline">
              <Trash2 className="h-3 w-3" /> Remove{deleting && '...'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface ProcSubmissionDetailsProps {
  submission: any;
  allowFileManage?: boolean;
  onFileUpdated?: () => void;
}

export default function ProcSubmissionDetails({ submission, allowFileManage, onFileUpdated }: ProcSubmissionDetailsProps) {
  return (
    <div className="space-y-3">
      {procSections.map((section) => (
        <div key={section.title} className={`rounded-lg border border-l-4 ${section.colorClass} p-3`}>
          <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${section.textColor}`}>
            {section.title}
          </h5>
          <div className="space-y-2">
            {section.items.map((item) => {
              const value = submission[item.key];
              const fileUrl = submission[`${item.key}_file_url`];
              return (
                <div key={item.key} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{item.label}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${value ? 'text-success' : 'text-destructive'}`}>
                      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {value ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {(value || allowFileManage) && (
                    <FileLink url={fileUrl} label={item.fileLabel}
                      submissionId={submission.id} fieldName={`${item.key}_file_url`}
                      allowManage={allowFileManage} onUpdated={onFileUpdated} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {submission.notes && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <span className="text-xs font-semibold text-muted-foreground">Notes: </span>
          <span className="text-xs">{submission.notes}</span>
        </div>
      )}

      {submission.review_notes && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <span className="text-xs font-semibold text-muted-foreground">Review Notes: </span>
          <span className="text-xs">{submission.review_notes}</span>
        </div>
      )}
    </div>
  );
}
