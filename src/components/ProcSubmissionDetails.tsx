import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, FileDown } from 'lucide-react';

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

function FileLink({ url, label }: { url: string | null | undefined; label: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    supabase.storage.from('procurement-documents').createSignedUrl(url, 3600).then(({ data }) => {
      if (data?.signedUrl) setSignedUrl(data.signedUrl);
    });
  }, [url]);

  if (!url) return null;
  return (
    <a href={signedUrl || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
      <FileDown className="h-3 w-3" /> {label}
    </a>
  );
}

interface ProcSubmissionDetailsProps {
  submission: any;
}

export default function ProcSubmissionDetails({ submission }: ProcSubmissionDetailsProps) {
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
                  {value && <FileLink url={fileUrl} label={item.fileLabel} />}
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
