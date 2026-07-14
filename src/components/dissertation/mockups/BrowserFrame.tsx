import { ReactNode } from 'react';

export function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-300 shadow-lg overflow-hidden bg-white my-6 print:shadow-none">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <div className="ml-4 flex-1 text-xs font-mono text-slate-500 bg-white rounded px-3 py-1 border border-slate-200 truncate">
          {url}
        </div>
      </div>
      <div className="bg-slate-50 p-4">{children}</div>
    </div>
  );
}

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto my-6 w-full max-w-[380px] rounded-[2.2rem] border-[10px] border-slate-800 bg-slate-800 shadow-xl print:shadow-none">
      <div className="mx-auto h-5 w-24 bg-slate-800 rounded-b-2xl -mt-1 mb-1" />
      <div className="rounded-[1.4rem] overflow-hidden bg-white min-h-[560px] p-4">{children}</div>
    </div>
  );
}
