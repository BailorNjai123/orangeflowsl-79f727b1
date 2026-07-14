import { useState } from 'react';
import { BrowserFrame } from './BrowserFrame';

const tabs = ['Identification', 'Geo', 'Tower', 'Power', 'Review'];

export default function PlanningMockup() {
  const [tab, setTab] = useState(0);
  return (
    <BrowserFrame url="https://orangeflowsl.app/planning/new-site">
      <div className="bg-white rounded-md border border-slate-200 p-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold text-slate-900">New Site Proposal</h4>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">Draft</span>
        </div>

        <div className="flex gap-1 border-b border-slate-200 mb-4 overflow-x-auto">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`text-xs px-3 py-2 border-b-2 transition ${
                tab === i ? 'border-orange-500 text-orange-600 font-semibold' : 'border-transparent text-slate-500'
              }`}
            >
              {i + 1}. {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <Field label="Site ID" value="SL-FT-001" />
          <Field label="Site Name" value="Freetown Central Tower A" />
          <Field label="Latitude" value="8.4841° N" />
          <Field label="Longitude" value="-13.2299° W" />
          <Field label="Tower Height (m)" value="42" />
          <Field label="Antenna Azimuth" value="120° / 240° / 360°" />
          <Field label="Solar Array (kW)" value="6.4" />
          <Field label="Battery Bank (kWh)" value="28.8" />
          <Field label="Hybrid Genset" value="Diesel 7.5 kVA" />
          <Field label="Grid Availability" value="Intermittent" />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="text-xs px-3 py-1.5 rounded-md border border-slate-300 text-slate-600">Save Draft</button>
          <button className="text-xs px-3 py-1.5 rounded-md bg-orange-500 text-white font-medium">Submit to Procurement →</button>
        </div>
      </div>
    </BrowserFrame>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</span>
      <div className="mt-0.5 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-800">{value}</div>
    </div>
  );
}
