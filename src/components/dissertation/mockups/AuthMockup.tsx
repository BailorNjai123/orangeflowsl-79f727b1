import { useState } from 'react';
import { MobileFrame } from './BrowserFrame';
import { Radio, Lock, Mail, ShieldCheck } from 'lucide-react';

const roles = [
  { id: 'planning', label: 'Planning' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'admin', label: 'Admin' },
];

export default function AuthMockup() {
  const [role, setRole] = useState('planning');
  const [authed, setAuthed] = useState(false);

  return (
    <MobileFrame>
      <div className="flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-md">
          <Radio className="h-6 w-6 text-white" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>OrangeFlow SL</h3>
        <p className="text-xs text-slate-500">Authentication Gate</p>

        <div className="w-full mt-5 space-y-3 text-left">
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-300 px-2 py-2 bg-white">
              <Mail className="h-4 w-4 text-slate-400" />
              <input defaultValue="planner@orange.sl" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-300 px-2 py-2 bg-white">
              <Lock className="h-4 w-4 text-slate-400" />
              <input type="password" defaultValue="••••••••" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
          </label>

          <div>
            <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">Active Role</span>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`text-xs py-1.5 rounded-md border transition ${
                    role === r.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setAuthed(true)}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-md bg-slate-900 text-white text-sm py-2.5 hover:bg-slate-800"
          >
            <ShieldCheck className="h-4 w-4" /> Authenticate
          </button>

          {authed && (
            <div className="mt-2 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs p-2 text-center">
              ✓ Session issued for role: <strong>{role}</strong>
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
