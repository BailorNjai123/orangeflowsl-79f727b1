import { useState } from 'react';
import { ExternalLink, Download, FileText, AlertTriangle, Clock, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { openFileInNewTab, downloadFile } from '@/lib/storageUtils';


export const PROC_BUCKET = 'procurement-documents';

export const PO_STATUSES = ['Draft', 'Issued', 'Approved', 'Closed', 'Cancelled'];
export const DELIVERY_STATUSES = ['Pending', 'Partial Delivery', 'Delivered'];
export const PAYMENT_STATUSES = ['Pending', 'Partially Paid', 'Fully Paid'];
export const PROCUREMENT_STATUSES = ['In Progress', 'Ready for Handover', 'Handed Over to Rollout', 'Completed'];

export type MgmtField = {
  key: string;
  label: string;
  type: 'text' | 'date' | 'email' | 'tel' | 'select';
  options?: string[];
};

export const procMgmtGroups: Array<{ title: string; color: string; fields: MgmtField[] }> = [
  {
    title: 'A. Vendor Information',
    color: 'border-l-blue-500',
    fields: [
      { key: 'vendor_name', label: 'Vendor Name', type: 'text' },
      { key: 'supplier_company', label: 'Supplier Company', type: 'text' },
      { key: 'contact_person', label: 'Contact Person', type: 'text' },
      { key: 'phone_number', label: 'Phone Number', type: 'tel' },
      { key: 'email_address', label: 'Email Address', type: 'email' },
    ],
  },
  {
    title: 'B. Purchase Order Information',
    color: 'border-l-purple-500',
    fields: [
      { key: 'po_number', label: 'Purchase Order Number', type: 'text' },
      { key: 'po_date', label: 'Purchase Order Date', type: 'date' },
      { key: 'po_status', label: 'Purchase Order Status', type: 'select', options: PO_STATUSES },
    ],
  },
  {
    title: 'C. Material Delivery Information',
    color: 'border-l-amber-500',
    fields: [
      { key: 'material_delivery_status', label: 'Material Delivery Status', type: 'select', options: DELIVERY_STATUSES },
      { key: 'expected_delivery_date', label: 'Expected Delivery Date', type: 'date' },
      { key: 'actual_delivery_date', label: 'Actual Delivery Date', type: 'date' },
    ],
  },
  {
    title: 'D. Financial Information',
    color: 'border-l-emerald-500',
    fields: [
      { key: 'invoice_number', label: 'Invoice Number', type: 'text' },
      { key: 'payment_status', label: 'Payment Status', type: 'select', options: PAYMENT_STATUSES },
    ],
  },
  {
    title: 'E. Procurement Status',
    color: 'border-l-orange-500',
    fields: [
      { key: 'procurement_status', label: 'Procurement Status', type: 'select', options: PROCUREMENT_STATUSES },
    ],
  },
];

export const procDocFields: Array<{ key: string; label: string; required: boolean }> = [
  { key: 'purchase_order_doc_url', label: 'Purchase Order (PO)', required: true },
  { key: 'delivery_note_doc_url', label: 'Delivery Note', required: true },
  { key: 'grn_doc_url', label: 'Goods Received Note (GRN)', required: true },
  { key: 'vendor_delivery_cert_doc_url', label: 'Vendor Delivery Certificate', required: true },
  { key: 'material_handover_form_doc_url', label: 'Material Handover Form', required: true },
  { key: 'material_inspection_report_doc_url', label: 'Material Inspection Report (Optional)', required: false },
];

export function procurementStatusBadge(status?: string | null) {
  const s = status || 'In Progress';
  const map: Record<string, string> = {
    'In Progress': 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    'Ready for Handover': 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    'Handed Over to Rollout': 'bg-purple-100 text-purple-700 hover:bg-purple-100',
    'Completed': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  };
  return <Badge className={map[s] || map['In Progress']}>{s}</Badge>;
}

function fmt(v: any) {
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

/** Read-only document card with View + Download (used by Rollout & Admin, and Procurement preview) */
export function ProcDocCard({ path, label }: { path?: string | null; label: string }) {
  const [busy, setBusy] = useState<'' | 'view' | 'download'>('');
  const hasFile = !!path && path.trim() !== '';
  const filename = hasFile ? (path!.split('/').pop() || label) : '';

  return (
    <div className="flex items-center gap-2 rounded-lg border p-2.5">
      <FileText className={`h-4 w-4 shrink-0 ${hasFile ? 'text-primary' : 'text-muted-foreground'}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {hasFile ? filename : 'No document uploaded'}
        </p>
      </div>
      {hasFile ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={async () => { setBusy('view'); await openFileInNewTab(PROC_BUCKET, path); setBusy(''); }}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> View{busy === 'view' && '...'}
          </button>
          <button
            type="button"
            onClick={async () => { setBusy('download'); await downloadFile(PROC_BUCKET, path, filename); setBusy(''); }}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            <Download className="h-3 w-3" /> Download{busy === 'download' && '...'}
          </button>
        </div>
      ) : (
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      )}
    </div>
  );
}

/** Build a procurement timeline / audit trail from the submission record */
export function buildProcTimeline(sub: any): Array<{ label: string; date?: string | null; done: boolean }> {
  if (!sub) return [];
  return [
    { label: 'Land Approved', date: sub.created_at, done: !!sub.acquisition_approved },
    { label: 'Lease Completed', date: sub.created_at, done: !!sub.lease_registration },
    { label: 'Vendor Assigned', date: sub.created_at, done: !!(sub.vendor_name || sub.supplier_company) },
    { label: 'Purchase Order Created', date: sub.po_date, done: !!sub.po_number },
    { label: 'Materials Delivered', date: sub.actual_delivery_date, done: sub.material_delivery_status === 'Delivered' },
    {
      label: 'Site Handed Over to Rollout',
      date: sub.updated_at,
      done: ['Handed Over to Rollout', 'Completed'].includes(sub.procurement_status) || !!sub.site_handover,
    },
  ];
}

export function ProcTimeline({ submission }: { submission: any }) {
  const steps = buildProcTimeline(submission);
  return (
    <div className="space-y-0">
      {steps.map((s, i) => (
        <div key={s.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={`h-2.5 w-2.5 rounded-full ${s.done ? 'bg-success' : 'bg-muted-foreground/30'}`} />
            {i < steps.length - 1 && <span className="w-px flex-1 bg-border" />}
          </div>
          <div className="pb-4 -mt-1 min-w-0">
            <p className={`text-xs font-medium ${s.done ? '' : 'text-muted-foreground'}`}>{s.label}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {s.done && s.date ? new Date(s.date).toLocaleDateString() : 'Pending'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full read-only view of Section 4 + Section 5 (+ optional timeline) */
export default function ProcurementManagementView({
  submission,
  showTimeline = true,
}: {
  submission: any;
  showTimeline?: boolean;
}) {
  if (!submission) return null;

  return (
    <div className="space-y-4">
      {procMgmtGroups.map(group => (
        <Card key={group.title} className={`border-l-4 ${group.color}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider">{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {group.fields.map(f => (
              <div key={f.key} className="flex items-start justify-between gap-2 border-b border-border/40 py-1">
                <span className="text-[11px] text-muted-foreground">{f.label}</span>
                <span className="text-xs font-medium text-right break-all">
                  {f.key === 'procurement_status'
                    ? procurementStatusBadge(submission[f.key])
                    : fmt(submission[f.key])}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="border-l-4 border-l-slate-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider">Procurement Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {procDocFields.map(d => (
            <ProcDocCard key={d.key} label={d.label} path={submission[d.key]} />
          ))}
        </CardContent>
      </Card>

      {showTimeline && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider">Procurement Timeline / Audit Trail</CardTitle>
          </CardHeader>
          <CardContent><ProcTimeline submission={submission} /></CardContent>
        </Card>
      )}
    </div>
  );
}
