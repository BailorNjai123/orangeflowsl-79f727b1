import { useState } from 'react';
import { BrowserFrame } from './BrowserFrame';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Row {
  id: string;
  name: string;
  region: string;
  status: string;
  submitted: string;
}

interface LogEntry {
  time: string;
  actor: string;
  action: string;
}

const INITIAL: Row[] = [
  { id: 'SL-FT-001', name: 'Freetown Central A', region: 'Western', status: 'Awaiting Approval', submitted: '2026-07-12' },
  { id: 'SL-KEN-019', name: 'Kenema Relay', region: 'Eastern', status: 'Awaiting Approval', submitted: '2026-07-13' },
  { id: 'SL006', name: 'Bo Junction Node', region: 'Southern', status: 'Awaiting Approval', submitted: '2026-07-14' },
];

export default function AdminMockup() {
  const [rows, setRows] = useState(INITIAL);
  const [log, setLog] = useState<LogEntry[]>([
    { time: '09:14', actor: 'admin@orange.sl', action: 'Signed in to Admin Pipeline' },
  ]);

  const act = (id: string, ok: boolean) => {
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRows((r) => r.map((row) => (row.id === id ? { ...row, status: ok ? 'Approved ✓' : 'Rejected ✗' } : row)));
    setLog((l) => [
      { time: t, actor: 'admin@orange.sl', action: `${ok ? 'APPROVED' : 'REJECTED'} site ${id}` },
      ...l,
    ]);
  };

  return (
    <BrowserFrame url="https://orangeflowsl.app/admin/pipeline">
      <div className="bg-white rounded-md border border-slate-200 p-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <h4 className="text-base font-bold text-slate-900 mb-3">Admin Pipeline Control</h4>

        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2">Site ID</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Region</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-right px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-200">
                  <td className="px-3 py-2 font-mono">{r.id}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2 text-slate-500">{r.region}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      r.status.includes('Approved') ? 'bg-green-100 text-green-700' :
                      r.status.includes('Rejected') ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2 text-right space-x-1">
                    <button onClick={() => act(r.id, true)} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-green-600 text-white">
                      <CheckCircle2 className="h-3 w-3" /> Approve
                    </button>
                    <button onClick={() => act(r.id, false)} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-red-500 text-white">
                      <XCircle className="h-3 w-3" /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Chronological Audit Log</h5>
          <div className="rounded border border-slate-200 bg-slate-900 text-green-300 font-mono text-[11px] max-h-40 overflow-y-auto p-3 space-y-0.5">
            {log.map((l, i) => (
              <div key={i}>[{l.time}] {l.actor} — {l.action}</div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
