
-- Add new columns to sites table for the updated form
ALTER TABLE public.sites 
  ADD COLUMN IF NOT EXISTS dimensions text DEFAULT '',
  ADD COLUMN IF NOT EXISTS foundation_depth numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS elevation numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS distance_nearest_bts numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tower_material text DEFAULT '',
  ADD COLUMN IF NOT EXISTS transmission_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS power_backup_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS battery_bank_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS number_of_battery_banks integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS earthing_resistance numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_phase text DEFAULT '',
  ADD COLUMN IF NOT EXISTS planned_start_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_inspection_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS planning_approval_status text DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS project_review_status text DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS final_approval_by text DEFAULT '',
  ADD COLUMN IF NOT EXISTS approval_date date DEFAULT NULL;
