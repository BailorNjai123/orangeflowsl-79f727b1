import { useState } from 'react';
import { Check, X, Download, ExternalLink, Lock } from 'lucide-react';
import { openFileInNewTab, downloadFile, extractStoragePath } from '@/lib/storageUtils';

const BUCKET = 'procurement-documents';

/**
 * Rollout-facing readiness view.
 * Procurement remains the document owner. Rollout only ever sees:
 *  - status (Yes/No) for every parameter
 *  - view/download for the explicitly permitted execution documents
 * Restricted files (ownership certificates, signed lease, vendor contract)
 * are never rendered, linked, or resolved to a storage path here.
 */
type Param = {
  key: string;
  label: string;
  /** documents Rollout may view/download when the parameter is Yes */
  docs?: Array<{ field: string; label: string }>;
};

const SECTIONS: Array<{ title: string; color: string; badge: string; params: Param[] }> = [
  {
    title: 'Land Acquisition',
    color: 'border-l-blue-500',
    badge: 'bg-blue-500/10 text-blue-600',
    params: [
      {
        key: 'land_identified',
        label: 'Land Identified',
        docs: [
          { field: 'land_identified_file_url', label: 'Land Identification / Survey Document' },
        ],
      },
      { key: 'ownership_verified', label: 'Ownership Verified' },
      {
        key: 'acquisition_approved',
        label: 'Land Acquisition Approved',
        docs: [{ field: 'acquisition_approved_file_url', label: 'Approval Document' }],
      },
    ],
  },
  {
    title: 'Land Lease',
    color: 'border-l-purple-500',
    badge: 'bg-purple-500/10 text-purple-600',
    params: [
      {
        key: 'lease_negotiation',
        label: 'Lease Negotiation Completed',
        docs: [{ field: 'lease_negotiation_file_url', label: 'Negotiation Summary' }],
      },
      { key: 'lease_signed', label: 'Land Lease Signed' },
      { key: 'lease_registration', label: 'Lease Registration Completed' },
    ],
  },
  {
    title: 'Handover to Vendor',
    color: 'border-l-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-600',
    params: [
      {
        key: 'road_access',
        label: 'Road Access Available',
        docs: [{ field: 'road_access_file_url', label: 'Road Access Document' }],
      },
      { key: 'vendor_contract', label: 'Vendor Contract Signed' },
      {
        key: 'site_handover',
        label: 'Site Handover Completed',
        docs: [{ field: 'site_handover_file_url', label: 'Site Handover Document' }],
      },
    ],
  },
];

function DocRow({ path, label }: { path: string; label: string }) {
  const [busy, setBusy] = useState<'view' | 'download' | null>(null);
  const filename = path.split('/').pop() || label;

  return (
    <div className="flex items-center gap-3 flex-wrap ml-6 mt-1">
      <span className="text-xs text-muted-foreground truncate">{label}</span>
      <button
        type="button"
        disabled={busy !== null}
        onClick={async () => { setBusy('view'); await openFileInNewTab(BUCKET, path); setBusy(null); }}
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
      >
        <ExternalLink className="h-3 w-3" /> View{busy === 'view' && '...'}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={async () => { setBusy('download'); await downloadFile(BUCKET, path, filename); setBusy(null); }}
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Download className="h-3 w-3" /> Download{busy === 'download' && '...'}
      </button>
    </div>
  );
}

export default function RolloutProcurementReadiness({ submission }: { submission: any }) {
  if (!submission) {
    return <p className="text-xs text-muted-foreground">No procurement submission linked to this site.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        Read-only readiness synchronized from Procurement. Restricted legal and commercial documents are not shared.
      </div>

      {SECTIONS.map((section, si) => {
        const done = section.params.filter(p => !!submission[p.key]).length;
        return (
          <div key={section.title} className={`rounded-lg border border-l-4 ${section.color} overflow-hidden`}>
            <div className="px-3 py-2 bg-muted/30 flex items-center gap-2">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${section.badge}`}>
                {si + 1}
              </span>
              <h5 className="text-xs font-semibold uppercase tracking-wider">{section.title}</h5>
              <span className="ml-auto text-[10px] font-medium text-muted-foreground">
                {done}/{section.params.length} Completed
              </span>
            </div>
            <div className="divide-y divide-border/50">
              {section.params.map(param => {
                const yes = !!submission[param.key];
                const docs = yes
                  ? (param.docs || [])
                      .map(d => ({ ...d, path: extractStoragePath(submission[d.field], BUCKET) }))
                      .filter(d => !!d.path)
                  : [];
                return (
                  <div key={param.key} className="px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">{param.label}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        yes ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {yes ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {yes ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {docs.map(d => <DocRow key={d.field} path={d.path as string} label={d.label} />)}
                    {yes && !param.docs && (
                      <p className="ml-6 mt-1 text-[10px] text-muted-foreground inline-flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Status only — document retained by Procurement
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Compact checklist tracker: all 9 parameters grouped by section. */
export function RolloutReadinessTracker({ submission }: { submission: any }) {
  if (!submission) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {SECTIONS.map(section => (
        <div key={section.title} className={`rounded-lg border border-l-4 ${section.color} p-3 space-y-1.5`}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title} — {section.params.filter(p => !!submission[p.key]).length}/{section.params.length}
          </p>
          {section.params.map(p => (
            <div key={p.key} className="flex items-center gap-1.5 text-xs">
              {submission[p.key]
                ? <Check className="h-3.5 w-3.5 text-success shrink-0" />
                : <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              <span className={submission[p.key] ? '' : 'text-muted-foreground'}>{p.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
