import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileDown, MapPin, Ruler, Radio, Zap, Calendar, User } from 'lucide-react';

interface SiteDetailsViewProps {
  site: any;
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-right">{value ?? '-'}</span>
    </div>
  );
}

function FileLink({ label, bucket, path }: { label: string; bucket: string; path: string | null | undefined }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    supabase.storage.from(bucket).createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }, [path, bucket]);

  if (!path) return null;

  return (
    <a href={url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
      <FileDown className="h-3 w-3" /> {label}
    </a>
  );
}

export default function SiteDetailsView({ site }: SiteDetailsViewProps) {
  return (
    <div className="space-y-4">
      {/* Basic Information */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> Basic Information
        </h4>
        <div className="rounded-lg border bg-card p-3">
          <DetailRow label="Site ID" value={site.site_id_code} />
          <DetailRow label="Site Name" value={site.site_name} />
          <DetailRow label="Region" value={site.region} />
          <DetailRow label="District" value={site.district} />
          <DetailRow label="Town" value={site.town} />
          <DetailRow label="Address" value={site.address} />
          <DetailRow label="Dimensions" value={site.dimensions} />
          <DetailRow label="Tower Height" value={site.tower_height ? `${site.tower_height}m` : null} />
          <DetailRow label="Foundation Depth" value={site.foundation_depth ? `${site.foundation_depth}m` : null} />
          <DetailRow label="Elevation" value={site.elevation ? `${site.elevation}m` : null} />
          <DetailRow label="Distance from Nearest BTS" value={site.distance_nearest_bts ? `${site.distance_nearest_bts}km` : null} />
          <DetailRow label="Latitude" value={site.latitude} />
          <DetailRow label="Longitude" value={site.longitude} />
        </div>
      </div>

      {/* Technical Details */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5" /> Technical Details
        </h4>
        <div className="rounded-lg border bg-card p-3">
          <DetailRow label="Tower Type" value={site.tower_type} />
          <DetailRow label="Tower Material" value={site.tower_material} />
          <DetailRow label="Transmission Type" value={site.transmission_type} />
          <DetailRow label="Power Backup Type" value={site.power_backup_type} />
          <DetailRow label="Battery Bank Type" value={site.battery_bank_type} />
          <DetailRow label="No. of Battery Banks" value={site.number_of_battery_banks} />
          <DetailRow label="Earthing Resistance" value={site.earthing_resistance ? `${site.earthing_resistance}Ω` : null} />
          <DetailRow label="Antenna Type" value={site.antenna_type} />
          <DetailRow label="No. of Antennas" value={site.number_of_antennas} />
          <DetailRow label="Power Source" value={site.power_source} />
          <DetailRow label="Backup Power" value={site.backup_power} />
          <DetailRow label="Equipment Shelter" value={site.equipment_shelter} />
        </div>
      </div>

      {/* Project & Vendor Details */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" /> Project & Vendor Details
        </h4>
        <div className="rounded-lg border bg-card p-3">
          <DetailRow label="Vendor Assigned" value={site.vendor_name} />
          <DetailRow label="Contractor" value={site.contractor_name} />
          <DetailRow label="Project Name" value={site.project_name} />
          <DetailRow label="Current Phase" value={site.current_phase} />
          <DetailRow label="Site Type" value={site.site_type} />
          <DetailRow label="Terrain Type" value={site.terrain_type} />
          <DetailRow label="Access Road Condition" value={site.access_road_condition} />
          <DetailRow label="Estimated Cost" value={site.estimated_cost ? `$${Number(site.estimated_cost).toLocaleString()}` : null} />
        </div>
      </div>

      {/* Dates */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> Key Dates
        </h4>
        <div className="rounded-lg border bg-card p-3">
          <DetailRow label="Planned Start Date" value={site.planned_start_date} />
          <DetailRow label="Target Completion" value={site.target_completion_date} />
          <DetailRow label="Last Inspection" value={site.last_inspection_date} />
          <DetailRow label="Approval Date" value={site.approval_date} />
        </div>
      </div>

      {/* Attachments */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <FileDown className="h-3.5 w-3.5" /> Attachments
        </h4>
        <div className="rounded-lg border bg-card p-3 flex flex-wrap gap-3">
          <FileLink label="Site Photo" bucket="site-documents" path={site.site_photo_url} />
          <FileLink label="Layout Plan" bucket="site-documents" path={site.layout_plan_url} />
          <FileLink label="Approval Letter" bucket="site-documents" path={site.approval_letter_url} />
          {!site.site_photo_url && !site.layout_plan_url && !site.approval_letter_url && (
            <span className="text-xs text-muted-foreground">No attachments</span>
          )}
        </div>
      </div>

      {/* Notes */}
      {site.notes && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h4>
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">{site.notes}</div>
        </div>
      )}
    </div>
  );
}
