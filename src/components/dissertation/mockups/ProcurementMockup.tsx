import { useState } from 'react';
import { BrowserFrame } from './BrowserFrame';
import { UploadCloud, FileCheck2 } from 'lucide-react';

const CHECKS = [
  'Site survey report received',
  'Land lease agreement signed',
  'Environmental clearance obtained',
  'Civil BOQ vendor quote received',
  'Power BOQ vendor quote received',
  'Transport & logistics plan approved',
  'Security deposit lodged',
  'RF planning sign-off complete',
  'Regulatory NATCOM clearance',
];

export default function ProcurementMockup() {
  const [state, setState] = useState<boolean[]>(Array(9).fill(false));
  const [dropped, setDropped] = useState(false);
  const passed = state.filter(Boolean).length;

  return (
    <BrowserFrame url="https://orangeflowsl.app/procurement/audit/SL-KEN-019">
      <div className="bg-white rounded-md border border-slate-200 p-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-900">Procurement Compliance Audit</h4>
            <p className="text-[11px] text-slate-500">Site: SL-KEN-019 — Kenema Relay</p>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${passed === 9 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {passed}/9 Passed
          </span>
        </div>

        <ul className="space-y-2 text-xs">
          {CHECKS.map((c, i) => (
            <li key={i} className="flex items-center gap-3 rounded border border-slate-200 px-3 py-2">
              <button
                onClick={() => setState((s) => s.map((v, idx) => (idx === i ? !v : v)))}
                className={`relative w-9 h-5 rounded-full transition ${state[i] ? 'bg-orange-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${state[i] ? 'translate-x-4' : ''}`} />
              </button>
              <span className="flex-1 text-slate-700">{c}</span>
              <input
                placeholder="Remark…"
                className="text-[11px] px-2 py-1 rounded border border-slate-200 w-28 bg-slate-50 outline-none"
              />
            </li>
          ))}
        </ul>

        <div
          onClick={() => setDropped(true)}
          className={`mt-4 cursor-pointer border-2 border-dashed rounded-lg p-4 text-center text-xs transition ${
            dropped ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-300 text-slate-500'
          }`}
        >
          {dropped ? (
            <span className="inline-flex items-center gap-2"><FileCheck2 className="h-4 w-4" /> bid-pack-SL-KEN-019.pdf uploaded (1.8 MB)</span>
          ) : (
            <span className="inline-flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Drop Bid Pack PDF here</span>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}
