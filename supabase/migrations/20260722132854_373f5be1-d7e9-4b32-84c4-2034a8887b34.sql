
-- 1. Extend app_role enum with power_team and rollout_team
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'power_team';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'rollout_team';

-- 2. Add power/progress columns to sites
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS grid_transformer_capacity text DEFAULT '',
  ADD COLUMN IF NOT EXISTS solar_capacity numeric,
  ADD COLUMN IF NOT EXISTS generator_capacity numeric,
  ADD COLUMN IF NOT EXISTS power_rfi_status text DEFAULT 'Not Started',
  ADD COLUMN IF NOT EXISTS power_certificate_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS progress_percent numeric DEFAULT 0;
