import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAsObjectUrl, downloadFile } from '@/lib/storageUtils';

export interface ExcelSubmissionMeta {
  path: string;
  name?: string;
  uploaded_at?: string;
  size?: number;
}

const BUCKET = 'site-documents';

/**
 * Planning Review viewer for an uploaded Planning Excel submission.
 * Renders every worksheet of the original workbook and offers a download of the
 * untouched .xlsx file.
 */
export default function ExcelSubmissionView({ meta }: { meta: ExcelSubmissionMeta }) {
  const [sheets, setSheets] = useState<{ name: string; rows: any[][] }[] | null>(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await fetchAsObjectUrl(BUCKET, meta.path);
      if (!res) {
        if (!cancelled) { setError('Unable to load the Excel file.'); setLoading(false); }
        return;
      }
      try {
        const buf = await res.blob.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const parsed = wb.SheetNames.map(name => ({
          name,
          rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', blankrows: false }) as any[][],
        }));
        if (!cancelled) setSheets(parsed);
      } catch {
        if (!cancelled) setError('The file could not be read as a valid Excel workbook.');
      } finally {
        URL.revokeObjectURL(res.url);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [meta.path]);

  const handleDownload = async () => {
    setDownloading(true);
    await downloadFile(BUCKET, meta.path, meta.name || 'planning-submission.xlsx');
    setDownloading(false);
  };

  const sheet = sheets?.[active];

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
        <FileSpreadsheet className="h-3.5 w-3.5" /> Excel Submission
      </h4>
      <div className="rounded-lg border bg-card p-3 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{meta.name || meta.path.split('/').pop()}</p>
            {meta.uploaded_at && (
              <p className="text-[11px] text-muted-foreground">
                Uploaded {new Date(meta.uploaded_at).toLocaleString()}
              </p>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5 mr-1.5" />}
            Download Excel File
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading workbook…
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}

        {sheets && sheets.length > 0 && (
          <>
            {sheets.length > 1 && (
              <div className="flex gap-1.5 flex-wrap">
                {sheets.map((s, i) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                      i === active ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            <div className="max-h-[420px] overflow-auto rounded-md border">
              <table className="w-full text-[11px] border-collapse">
                <tbody>
                  {(sheet?.rows || []).map((row, ri) => (
                    <tr key={ri} className={ri === 0 ? 'bg-muted/60 font-semibold sticky top-0' : ri % 2 ? 'bg-muted/20' : ''}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-border/60 px-2 py-1 whitespace-nowrap align-top">
                          {cell === null || cell === undefined ? '' : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sheet && sheet.rows.length === 0 && (
              <p className="text-xs text-muted-foreground">This worksheet is empty.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
