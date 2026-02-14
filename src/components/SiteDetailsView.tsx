import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileDown, MapPin, Radio, Calendar, User, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SiteDetailsViewProps {
  site: any;
  allowFileManage?: boolean;
  onFileUpdated?: () => void;
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-right">{value ?? '-'}</span>
    </div>
  );
}

function FileLink({ label, bucket, path, siteId, fieldName, allowManage, onUpdated }: {
  label: string; bucket: string; path: string | null | undefined;
  siteId?: string; fieldName?: string; allowManage?: boolean; onUpdated?: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!path) { setUrl(null); return; }
    // If it's already a full URL (legacy signed URL), use directly
    if (path.startsWith('http')) {
      setUrl(path);
      return;
    }
    // Otherwise generate a signed URL from the storage path
    supabase.storage.from(bucket).createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }, [path, bucket]);

  const handleDelete = async () => {
    if (!path || !siteId || !fieldName) return;
    setDeleting(true);
    // Delete file from storage if it's a path (not legacy URL)
    if (!path.startsWith('http')) {
      await supabase.storage.from(bucket).remove([path]);
    }
    // Clear the URL field in the sites table
    await supabase.from('sites').update({ [fieldName]: null }).eq('id', siteId);
    setDeleting(false);
    onUpdated?.();
  };

  const handleReplace = async (file: File) => {
    if (!siteId || !fieldName) return;
    setUploading(true);
    // Delete old file
    if (path && !path.startsWith('http')) {
      await supabase.storage.from(bucket).remove([path]);
    }
    const ext = file.name.split('.').pop();
    const newPath = `${siteId}/${Date.now()}_${fieldName.replace('_url', '')}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(newPath, file, { upsert: true });
    if (!error) {
      await supabase.from('sites').update({ [fieldName]: newPath }).eq('id', siteId);
    }
    setUploading(false);
    onUpdated?.();
  };

  if (!path && !allowManage) return null;

  return (
    <div className="flex flex-col gap-1">
      {path && url ? (
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <FileDown className="h-3 w-3" /> {label}
        </a>
      ) : !path ? (
        <span className="text-xs text-muted-foreground">No {label.toLowerCase()}</span>
      ) : (
        <span className="text-xs text-muted-foreground">Loading...</span>
      )}
      {allowManage && (
        <div className="flex items-center gap-1.5 mt-0.5">
          <label className="cursor-pointer">
            <Input type="file" accept=".pdf,.jpg,.png,image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleReplace(file);
            }} disabled={uploading} />
            <span className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline cursor-pointer">
              <Upload className="h-3 w-3" /> {path ? 'Replace' : 'Upload'}
              {uploading && '...'}
            </span>
          </label>
          {path && (
            <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-0.5 text-[10px] text-destructive hover:underline">
              <Trash2 className="h-3 w-3" /> Remove{deleting && '...'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function SiteDetailsView({ site, allowFileManage, onFileUpdated }: SiteDetailsViewProps) {
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
        <div className="rounded-lg border bg-card p-3 flex flex-wrap gap-4">
          <FileLink label="Site Photo" bucket="site-documents" path={site.site_photo_url}
            siteId={site.id} fieldName="site_photo_url" allowManage={allowFileManage} onUpdated={onFileUpdated} />
          <FileLink label="Layout Plan" bucket="site-documents" path={site.layout_plan_url}
            siteId={site.id} fieldName="layout_plan_url" allowManage={allowFileManage} onUpdated={onFileUpdated} />
          <FileLink label="Approval Letter" bucket="site-documents" path={site.approval_letter_url}
            siteId={site.id} fieldName="approval_letter_url" allowManage={allowFileManage} onUpdated={onFileUpdated} />
          {!allowFileManage && !site.site_photo_url && !site.layout_plan_url && !site.approval_letter_url && (
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
