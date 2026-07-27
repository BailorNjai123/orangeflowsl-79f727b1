import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { openFileInNewTab, downloadFile } from '@/lib/storageUtils';
import { Check, X, Trash2, Upload, ExternalLink, AlertTriangle, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const procSections = [
  {
    title: 'Land Acquisition',
    color: 'border-l-blue-500',
    bgIcon: 'bg-blue-500/10 text-blue-600',
    items: [
      { key: 'land_identified', label: 'Land Identified', fileLabel: 'Land Identification / Survey' },
      { key: 'ownership_verified', label: 'Ownership Verified', fileLabel: 'Ownership Proof / Title' },
      { key: 'acquisition_approved', label: 'Land Acquisition Approved', fileLabel: 'Approval Document' },
    ],
  },
  {
    title: 'Land Lease',
    color: 'border-l-purple-500',
    bgIcon: 'bg-purple-500/10 text-purple-600',
    items: [
      { key: 'lease_negotiation', label: 'Lease Negotiation Completed', fileLabel: 'Negotiation Summary' },
      { key: 'lease_signed', label: 'Land Lease Signed', fileLabel: 'Signed Lease Agreement' },
      { key: 'lease_registration', label: 'Lease Registration Completed', fileLabel: 'Registered Lease' },
    ],
  },
  {
    title: 'Handover to Vendor',
    color: 'border-l-emerald-500',
    bgIcon: 'bg-emerald-500/10 text-emerald-600',
    items: [
      { key: 'handover_to_vendor', label: 'Handover to Vendor', fileLabel: 'Handover to Vendor Document' },
      { key: 'road_access', label: 'Road Access Available', fileLabel: 'Road Access Approval / Photo' },

      { key: 'vendor_contract', label: 'Vendor Contract Signed', fileLabel: 'Vendor Contract' },
      { key: 'site_handover', label: 'Site Handover Completed', fileLabel: 'Handover Certificate' },
    ],
  },
];

const BUCKET = 'procurement-documents';

function getStoragePath(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null;
  // If it looks like a URL, try to extract path
  if (value.includes('supabase.co/storage/')) {
    try {
      const url = new URL(value);
      const pathParts = url.pathname.split(`/${BUCKET}/`);
      if (pathParts.length > 1) return decodeURIComponent(pathParts[1]);
    } catch { /* ignore */ }
    return null;
  }
  return value;
}

function FileLink({ url, label, submissionId, fieldName, allowManage, onUpdated }: {
  url: string | null | undefined; label: string;
  submissionId?: string; fieldName?: string; allowManage?: boolean; onUpdated?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [opening, setOpening] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const storagePath = getStoragePath(url);
  const hasFile = storagePath !== null;
  const filename = storagePath?.split('/').pop() || label;

  const handleOpen = async () => {
    setOpening(true);
    const ok = await openFileInNewTab(BUCKET, storagePath);
    setOpening(false);
    if (!ok && import.meta.env.DEV) console.error('[Storage] Preview unavailable', storagePath);
  };

  const handleDownload = async () => {
    setDownloading(true);
    await downloadFile(BUCKET, storagePath, filename);
    setDownloading(false);
  };

  const handleDelete = async () => {
    if (!storagePath || !submissionId || !fieldName) return;
    setDeleting(true);
    await supabase.storage.from(BUCKET).remove([storagePath]);
    await supabase.from('procurement_submissions').update({ [fieldName]: null }).eq('id', submissionId);
    setDeleting(false);
    onUpdated?.();
  };

  const handleReplace = async (file: File) => {
    if (!submissionId || !fieldName) return;
    setUploading(true);
    if (storagePath) await supabase.storage.from(BUCKET).remove([storagePath]);
    const ext = file.name.split('.').pop();
    const newPath = `${submissionId}/${Date.now()}_${fieldName.replace('_file_url', '')}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(newPath, file, { upsert: true });
    if (!uploadErr) await supabase.from('procurement_submissions').update({ [fieldName]: newPath }).eq('id', submissionId);
    setUploading(false);
    onUpdated?.();
  };

  if (!hasFile && !allowManage) return null;

  return (
    <div className="flex items-center gap-2 mt-1 ml-6 flex-wrap">
      {hasFile ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpen}
            disabled={opening}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            <ExternalLink className="h-3 w-3" /> {label}{opening && '...'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline"
            title={`Download ${filename}`}
          >
            <Download className="h-3 w-3" /> Download{downloading && '...'}
          </button>
        </div>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
          <AlertTriangle className="h-3 w-3" /> No file attached
        </span>
      )}
      {allowManage && (
        <div className="flex items-center gap-1.5 ml-auto">
          <label className="cursor-pointer">
            <Input type="file" accept=".pdf,.jpg,.png,image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleReplace(file);
            }} disabled={uploading} />
            <span className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline cursor-pointer">
              <Upload className="h-3 w-3" /> {hasFile ? 'Replace' : 'Upload'}{uploading && '...'}
            </span>
          </label>
          {hasFile && (
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
  const totalItems = procSections.reduce((acc, s) => acc + s.items.length, 0);
  const completedItems = procSections.reduce((acc, s) => acc + s.items.filter(i => submission[i.key]).length, 0);
  const progress = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">Completion Progress</span>
          <span className="text-xs font-bold">{completedItems}/{totalItems} ({progress}%)</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {procSections.map((section, si) => (
        <div key={section.title} className={`rounded-lg border border-l-4 ${section.color} overflow-hidden`}>
          <div className="px-3 py-2 bg-muted/30 flex items-center gap-2">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${section.bgIcon}`}>
              {si + 1}
            </span>
            <h5 className="text-xs font-semibold uppercase tracking-wider">
              {section.title}
            </h5>
            <span className="ml-auto text-[10px] text-muted-foreground font-medium">
              {section.items.filter(i => submission[i.key]).length}/{section.items.length}
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {section.items.map((item) => {
              const value = submission[item.key];
              const fileUrl = submission[`${item.key}_file_url`];
              const hasFileUrl = getStoragePath(fileUrl) !== null;
              return (
                <div key={item.key} className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{item.label}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      value ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {value ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {/* Show file link when: item is checked and has file, OR allowFileManage is true, OR item has a file regardless of check */}
                  {(value || allowFileManage || hasFileUrl) && (
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
