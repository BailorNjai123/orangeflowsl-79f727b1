import { useCallback, useEffect, useState } from 'react';
import { CloudOff, CloudUpload, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  OutboxRecord,
  outboxStats,
  processOutbox,
  resolveConflict,
  retryRecord,
} from '@/lib/offline/outbox';
import { onOfflineChange } from '@/lib/offline/db';

const statusLabel: Record<string, string> = {
  pending: 'Pending Sync',
  syncing: 'Syncing',
  synced: 'Synced',
  failed: 'Sync Failed',
  conflict: 'Conflict — needs review',
};

export default function SyncStatusIndicator() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [records, setRecords] = useState<OutboxRecord[]>([]);
  const [justSynced, setJustSynced] = useState(false);

  const refresh = useCallback(async () => {
    const s = await outboxStats();
    setRecords(s.records);
  }, []);

  useEffect(() => {
    refresh();
    const off = onOfflineChange(refresh);
    const on = () => { setOnline(true); processOutbox().then(r => { if (r.synced) { setJustSynced(true); setTimeout(() => setJustSynced(false), 6000); } refresh(); }); };
    const offline = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', offline);
    const t = setInterval(() => { if (navigator.onLine) processOutbox().then(refresh); }, 30_000);
    return () => {
      off();
      window.removeEventListener('online', on);
      window.removeEventListener('offline', offline);
      clearInterval(t);
    };
  }, [refresh]);

  const pending = records.filter(r => r.status === 'pending').length;
  const syncing = records.filter(r => r.status === 'syncing').length;
  const failed = records.filter(r => r.status === 'failed').length;
  const conflicts = records.filter(r => r.status === 'conflict').length;

  let Icon = CloudUpload;
  let text = `${pending + syncing} pending sync`;
  let tone = 'bg-amber-500/15 text-amber-700 border-amber-500/30';

  if (!online) {
    Icon = CloudOff;
    text = records.length ? `Offline — ${records.length} saved locally` : 'Offline — working locally';
    tone = 'bg-muted text-muted-foreground border-border';
  } else if (syncing) { Icon = RefreshCw; text = 'Syncing…'; tone = 'bg-primary/10 text-primary border-primary/30'; }
  else if (conflicts) { Icon = AlertTriangle; text = `${conflicts} conflict${conflicts > 1 ? 's' : ''}`; tone = 'bg-destructive/10 text-destructive border-destructive/30'; }
  else if (failed) { Icon = AlertTriangle; text = `${failed} sync failed`; tone = 'bg-destructive/10 text-destructive border-destructive/30'; }
  else if (records.length === 0) { Icon = CheckCircle2; text = justSynced ? 'All changes synced' : 'Online'; tone = 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'; }

  return (
    <div className="fixed bottom-3 right-3 z-[90] print:hidden">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur ${tone}`}
          >
            <Icon className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span className="max-w-[180px] truncate">{text}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Offline data</p>
            <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={!online} onClick={() => processOutbox().then(refresh)}>
              Sync now
            </Button>
          </div>
          {records.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {online ? 'Everything is synchronised with the central database.' : 'No offline submissions waiting. You can keep working — data is saved locally.'}
            </p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {records.map(r => (
                <li key={r.id} className="rounded-md border p-2">
                  <p className="text-xs font-medium">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.siteIdCode ? `Site ${r.siteIdCode} · ` : ''}
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-[11px] font-medium">{statusLabel[r.status]}</p>
                  {r.error && <p className="text-[11px] text-destructive">{r.error}</p>}
                  {r.status === 'failed' && (
                    <Button size="sm" variant="outline" className="mt-1 h-6 text-[11px]" onClick={() => retryRecord(r.id).then(refresh)}>
                      Retry
                    </Button>
                  )}
                  {r.status === 'conflict' && (
                    <div className="mt-1 flex gap-2">
                      <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => resolveConflict(r.id, 'apply').then(refresh)}>
                        Apply mine
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={() => resolveConflict(r.id, 'discard').then(refresh)}>
                        Discard
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
