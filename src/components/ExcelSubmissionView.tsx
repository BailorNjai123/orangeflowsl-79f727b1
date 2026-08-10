import { useState } from 'react';
import { FileSpreadsheet, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadFile } from '@/lib/storageUtils';

export interface ExcelSubmissionMeta {
  path: string;
  name?: string;
  uploaded_at?: string;
  size?: number;
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
}: {
  meta: ExcelSubmissionMeta;
  siteIdCode?: string;
  submittedByName?: string;
  submittedAt?: string;
  compact?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await downloadFile(BUCKET, meta.path, meta.name || 'planning-submission.xlsx');
    setDownloading(false);
  };

  const date = meta.uploaded_at || submittedAt;

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2">
        <div className="rounded bg-primary/10 p-1.5 shrink-0">
          <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">{meta.name || meta.path.split('/').pop()}</p>
          <p className="text-[11px] text-muted-foreground">
            Excel (.xlsx){formatSize(meta.size) ? ` · ${formatSize(meta.size)}` : ''}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading} className="shrink-0 h-8">
          {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
          <span className="ml-1.5 hidden sm:inline">Download</span>
        </Button>
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
              {submittedByName && <div><span className="font-medium text-foreground/70">Submitted by:</span> {submittedByName}</div>}
              <div>
                <span className="font-medium text-foreground/70">File type:</span> Excel (.xlsx)
                {formatSize(meta.size) ? ` · ${formatSize(meta.size)}` : ''}
              </div>
            </dl>
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading} className="w-full sm:w-auto">
          {downloading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5 mr-1.5" />}
          Download Excel
        </Button>
        <p className="text-[11px] text-muted-foreground">
          The complete original workbook — all worksheets and data — is preserved exactly as submitted.
        </p>
      </div>
    </div>
  );
}
