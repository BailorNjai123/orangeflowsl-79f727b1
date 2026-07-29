import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSignedUrl, extractStoragePath, openFileInNewTab, downloadFile } from '@/lib/storageUtils';
import { cleanNote } from '@/lib/planningNotes';

import { FileDown, MapPin, Radio, Calendar, User, Trash2, Upload, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SiteDetailsViewProps {
  site: any;
  allowFileManage?: boolean;
  onFileUpdated?: () => void;
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex justify-between items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-right">{value}</span>
    </div>
  );
}

function AlwaysShowRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const display = value === null || value === undefined || value === '' ? '-' : value;
  return (
    <div className="flex justify-between items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-right">{display}</span>
    </div>
  );
}

function FileLink({ label, bucket, path, siteId, fieldName, allowManage, onUpdated }: {
  label: string; bucket: string; path: string | null | undefined;
  siteId?: string; fieldName?: string; allowManage?: boolean; onUpdated?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [opening, setOpening] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const storagePath = extractStoragePath(path, bucket);
  const hasFile = storagePath !== null;
  const filename = storagePath?.split('/').pop() || label;

  const handleOpen = async () => {
    setOpening(true);
    await openFileInNewTab(bucket, path);
    setOpening(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    await downloadFile(bucket, path, filename);
    setDownloading(false);
  };

  const handleDelete = async () => {
    if (!path || !siteId || !fieldName) return;
    setDeleting(true);
    if (storagePath) await supabase.storage.from(bucket).remove([storagePath]);
    await supabase.from('sites').update({ [fieldName]: null }).eq('id', siteId);
    setDeleting(false);
    onUpdated?.();
  };

  const handleReplace = async (file: File) => {
    if (!siteId || !fieldName) return;
    setUploading(true);
    if (storagePath) await supabase.storage.from(bucket).remove([storagePath]);
    const ext = file.name.split('.').pop();
    const newPath = `${siteId}/${Date.now()}_${fieldName.replace('_url', '')}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(newPath, file, { upsert: true });
    if (!error) await supabase.from('sites').update({ [fieldName]: newPath }).eq('id', siteId);
    setUploading(false);
    onUpdated?.();
  };

  if (!hasFile && !allowManage) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {hasFile ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpen}
            disabled={opening}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            <ExternalLink className="h-3 w-3" /> {label}{opening && '...'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline"
            title={`Download ${filename}`}
          >
            <FileDown className="h-3 w-3" /> Download{downloading && '...'}
          </button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground italic">No {label.toLowerCase()}</span>
      )}
      {allowManage && (
        <div className="flex items-center gap-1.5 ml-auto">
          <label className="cursor-pointer">
            <Input type="file" accept=".pdf,.jpg,.png,image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleReplace(file);
            }} disabled={uploading} />
            <span className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline cursor-pointer">
              <Upload className="h-3 w-3" /> {hasFile ? 'Replace' : 'Upload'}{uploading && '...'}
            </span>
          </label>
          {hasFile && (
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
      {/* Submission Info */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Submission Info
        </h4>
        <div className="rounded-lg border bg-card p-3">
          <AlwaysShowRow label="Site ID Code" value={site.site_id_code} />
          <AlwaysShowRow label="Site Name" value={site.site_name} />
          <AlwaysShowRow label="Status" value={site.status} />
          <AlwaysShowRow label="Submitted" value={site.created_at ? new Date(site.created_at).toLocaleDateString() : null} />
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> Basic Information
        </h4>
        <div className="rounded-lg border bg-card p-3">
          <AlwaysShowRow label="Region" value={site.region} />
          <AlwaysShowRow label="District" value={site.district} />
          <AlwaysShowRow label="Town" value={site.town} />
          <DetailRow label="Address" value={site.address} />
          <DetailRow label="Dimensions" value={site.dimensions} />
          <AlwaysShowRow label="Tower Height" value={site.tower_height ? `${site.tower_height}m` : null} />
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
           <AlwaysShowRow label="Tower Type" value={site.tower_type} />
           <AlwaysShowRow label="Tower Material" value={site.tower_material} />
           <DetailRow label="Transmission Type" value={site.transmission_type} />
           <DetailRow label="Site Configuration" value={site.site_configuration} />
           <DetailRow label="Power Requirement" value={site.power_requirement ? `${site.power_requirement} kW` : null} />
           <DetailRow label="Power Source" value={site.power_source} />
           <DetailRow label="Power Backup Type" value={site.power_backup_type} />
           <DetailRow label="Battery Bank Type" value={site.battery_bank_type} />
           <DetailRow label="No. of Battery Banks" value={site.number_of_battery_banks} />
           <DetailRow label="Earthing Resistance" value={site.earthing_resistance ? `${site.earthing_resistance}Ω` : null} />
           <DetailRow label="Antenna Type" value={site.antenna_type} />
           <DetailRow label="No. of Antennas" value={site.number_of_antennas} />
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
          <AlwaysShowRow label="Vendor Assigned" value={site.vendor_name} />
          <DetailRow label="Contractor" value={site.contractor_name} />
          <DetailRow label="Project Name" value={site.project_name} />
          <AlwaysShowRow label="Current Phase" value={site.current_phase} />
          <DetailRow label="Site Type" value={site.site_type} />
          <DetailRow label="Terrain Type" value={site.terrain_type} />
          <DetailRow label="Access Road Condition" value={site.access_road_condition} />
          <DetailRow label="Estimated Cost" value={site.estimated_cost ? `$${Number(site.estimated_cost).toLocaleString()}` : null} />
        </div>
      </div>

      {/* Key Dates */}
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
        <div className="rounded-lg border bg-card p-3 space-y-2">
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

      {cleanNote(site.notes) && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h4>
          <div className="rounded-lg border bg-muted/50 p-3 text-sm whitespace-pre-wrap">{cleanNote(site.notes)}</div>
        </div>
      )}

    </div>
  );
}
