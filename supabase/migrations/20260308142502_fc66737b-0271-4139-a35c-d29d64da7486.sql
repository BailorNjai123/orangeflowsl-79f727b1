
-- Add missing columns to sites table
ALTER TABLE public.sites
ADD COLUMN IF NOT EXISTS site_configuration TEXT DEFAULT ''::text,
ADD COLUMN IF NOT EXISTS power_requirement TEXT DEFAULT ''::text;
