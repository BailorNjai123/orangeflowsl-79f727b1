ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS scope text DEFAULT '',
  ADD COLUMN IF NOT EXISTS handover_to_vendor date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS soil_test text DEFAULT 'Not Started',
  ADD COLUMN IF NOT EXISTS site_implementation_design text DEFAULT 'Not Started',
  ADD COLUMN IF NOT EXISTS cast_status text DEFAULT 'Not Started',
  ADD COLUMN IF NOT EXISTS tower_rig text DEFAULT 'Not Started',
  ADD COLUMN IF NOT EXISTS civil_rfi text DEFAULT 'Not Started',
  ADD COLUMN IF NOT EXISTS power_rfi text DEFAULT 'Not Started',
  ADD COLUMN IF NOT EXISTS on_air text DEFAULT 'Not Started';