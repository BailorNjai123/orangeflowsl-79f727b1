import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, WifiOff } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CACHE_KEY = 'orangeflow-sitemap-cache';

type MapSite = {
  id: string;
  site_id_code: string | null;
  site_name: string | null;
  latitude: number;
  longitude: number;
  current_phase: string | null;
  status: string | null;
};

function readCache(): { sites: MapSite[]; at: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const num = (v: any): number | null => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

export default function SiteMap({ sites }: { sites: any[] }) {
  const [query, setQuery] = useState('');
  const [offline, setOffline] = useState(!navigator.onLine);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Live sites from backend -> normalised + cached for offline use
  const liveSites = useMemo<MapSite[]>(() => {
    return (sites || [])
      .map((s) => {
        const lat = num(s?.latitude);
        const lng = num(s?.longitude);
        if (lat === null || lng === null) return null;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
        if (lat === 0 && lng === 0) return null;
        return {
          id: s.id,
          site_id_code: s.site_id_code ?? null,
          site_name: s.site_name ?? null,
          latitude: lat,
          longitude: lng,
          current_phase: s.current_phase ?? null,
          status: s.status ?? null,
        } as MapSite;
      })
      .filter(Boolean) as MapSite[];
  }, [sites]);

  const cached = useRef(readCache());
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    if (liveSites.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ sites: liveSites, at: Date.now() }));
      } catch { /* quota */ }
      setFromCache(false);
    } else if ((cached.current?.sites?.length ?? 0) > 0) {
      setFromCache(true);
    }
  }, [liveSites]);

  const allSites = liveSites.length > 0 ? liveSites : (cached.current?.sites ?? []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSites;
    return allSites.filter(
      (s) =>
        (s.site_id_code || '').toLowerCase().includes(q) ||
        (s.site_name || '').toLowerCase().includes(q)
    );
  }, [allSites, query]);

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(
      [8.4606, -11.7799], // Sierra Leone fallback view
      7
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Render markers whenever data / filter changes
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    markersRef.current = {};

    filtered.forEach((s) => {
      const marker = L.marker([s.latitude, s.longitude], {
        icon: DefaultIcon,
        title: s.site_id_code || s.site_name || 'Site',
      });
      marker.bindTooltip(s.site_id_code || s.site_name || 'Site', { direction: 'top' });
      marker.bindPopup(
        `<div style="min-width:200px;font-size:12px;line-height:1.5">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px">${escapeHtml(s.site_name || 'Unnamed site')}</div>
          <div><strong>Site ID:</strong> ${escapeHtml(s.site_id_code || '—')}</div>
          <div><strong>Latitude:</strong> ${s.latitude}</div>
          <div><strong>Longitude:</strong> ${s.longitude}</div>
          <div><strong>Project Stage:</strong> ${escapeHtml(s.current_phase || 'Not set')}</div>
          <div><strong>Status:</strong> ${escapeHtml(s.status || '—')}</div>
        </div>`
      );
      marker.addTo(layer);
      markersRef.current[s.id] = marker;
    });

    if (filtered.length > 0) {
      const bounds = L.latLngBounds(filtered.map((s) => [s.latitude, s.longitude] as [number, number]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    }
  }, [filtered]);

  const focusSite = (s: MapSite) => {
    const map = mapRef.current;
    const marker = markersRef.current[s.id];
    if (!map || !marker) return;
    map.setView([s.latitude, s.longitude], 15, { animate: true });
    marker.openPopup();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Site Map
          </h2>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {allSites.length} site{allSites.length === 1 ? '' : 's'} with valid coordinates
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Site ID or Site Name"
            className="pl-9"
          />
        </div>
      </div>

      {(offline || fromCache) && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>
            Showing site data from the last synchronisation
            {cached.current?.at ? ` (${new Date(cached.current.at).toLocaleString()})` : ''}. Map tiles may be
            unavailable while offline.
          </span>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div ref={containerRef} className="h-[60vh] min-h-[360px] w-full z-0" />
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <Card>
          <CardContent className="p-0 max-h-64 overflow-y-auto divide-y">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => focusSite(s)}
                className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.site_name || 'Unnamed site'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.site_id_code || '—'} · {s.latitude}, {s.longitude}
                  </p>
                </div>
                {s.status && <StatusBadge status={s.status as any} />}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {allSites.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No sites with valid latitude and longitude are available yet.
        </p>
      )}
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}
