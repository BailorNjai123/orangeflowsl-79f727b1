import { useState } from 'react';
import { FileSpreadsheet, FileDown, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadFile } from '@/lib/storageUtils';

export interface ExcelSubmissionMeta {
  path: string;
  name?: string;
  uploaded_at?: string;
  size?: number;
  submitted_by_name?: string;
}

const BUCKET = 'site-documents';

const formatSize = (bytes?: number) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * Planning Excel submission card.
 * The original workbook is preserved untouched — it is never converted into a
 * table, PDF or form. Only file metadata plus a download action is shown.
 */
export default function ExcelSubmissionView({
  meta,
  siteIdCode,
  submittedByName,
  submittedAt,
  compact = false,
  allowDelete = false,
  onDelete,
}: {
  meta: ExcelSubmissionMeta;
  siteIdCode?: string;
  submittedByName?: string;
  submittedAt?: string;
  compact?: boolean;
  /** Admin only — permanently removes the stored workbook. */
  allowDelete?: boolean;
  onDelete?: () => Promise<void> | void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await downloadFile(BUCKET, meta.path, meta.name || 'planning-submission.xlsx');
    setDownloading(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Delete this Excel submission permanently? This cannot be undone.')) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  const date = meta.uploaded_at || submittedAt;
  const byName = submittedByName || meta.submitted_by_name;

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2">
        <div className="rounded bg-primary/10 p-1.5 shrink-0">
          <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">{meta.name || meta.path.split('/').pop()}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            Excel (.xlsx){formatSize(meta.size) ? ` · ${formatSize(meta.size)}` : ''}
            {siteIdCode ? ` · ${siteIdCode}` : ''}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {byName ? `By ${byName}` : ''}{byName && date ? ' · ' : ''}
            {date ? new Date(date).toLocaleString() : ''}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading} className="shrink-0 h-8">
          {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
          <span className="ml-1.5 hidden sm:inline">Download</span>
        </Button>
        {allowDelete && onDelete && (
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting} className="shrink-0 h-8">
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            <span className="ml-1.5 hidden sm:inline">Delete</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
        <FileSpreadsheet className="h-3.5 w-3.5" /> Planning Excel Submission
      </h4>
      <div className="rounded-lg border bg-card p-3 space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="rounded-md bg-primary/10 p-2 shrink-0">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium break-all">{meta.name || meta.path.split('/').pop()}</p>
            <dl className="text-[11px] text-muted-foreground space-y-0.5">
              {siteIdCode && <div><span className="font-medium text-foreground/70">Site ID:</span> {siteIdCode}</div>}
              {date && <div><span className="font-medium text-foreground/70">Submitted:</span> {new Date(date).toLocaleString()}</div>}
              {byName && <div><span className="font-medium text-foreground/70">Submitted by:</span> {byName}</div>}
              <div>
                <span className="font-medium text-foreground/70">File type:</span> Excel (.xlsx)
                {formatSize(meta.size) ? ` · ${formatSize(meta.size)}` : ''}
              </div>
            </dl>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading} className="w-full sm:w-auto">
            {downloading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5 mr-1.5" />}
            Download Excel
          </Button>
          {allowDelete && onDelete && (
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting} className="w-full sm:w-auto">
              {deleting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
              Delete Excel
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          The complete original workbook — all worksheets and data — is preserved exactly as submitted.
        </p>
      </div>
    </div>
  );
}
