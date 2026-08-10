ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS chiefdom text,
  ADD COLUMN IF NOT EXISTS location_updated text,
  ADD COLUMN IF NOT EXISTS owner_sharing_status text,
  ADD COLUMN IF NOT EXISTS site_classification text,
  ADD COLUMN IF NOT EXISTS natca_classification text,
  ADD COLUMN IF NOT EXISTS technology_classification text[];

UPDATE public.sites
SET
  chiefdom = COALESCE(chiefdom, NULLIF(substring(notes FROM '"chiefdom"\s*:\s*"([^"]*)"'), '')),
  location_updated = COALESCE(location_updated, NULLIF(substring(notes FROM '"location_updated"\s*:\s*"([^"]*)"'), '')),
  owner_sharing_status = COALESCE(owner_sharing_status, NULLIF(substring(notes FROM '"owner_sharing_status"\s*:\s*"([^"]*)"'), '')),
  site_classification = COALESCE(site_classification, NULLIF(substring(notes FROM '"site_classification"\s*:\s*"([^"]*)"'), '')),
  natca_classification = COALESCE(natca_classification, NULLIF(substring(notes FROM '"natca_classification"\s*:\s*"([^"]*)"'), '')),
  technology_classification = COALESCE(
    technology_classification,
    CASE
      WHEN substring(notes FROM '"technology_classification"\s*:\s*\[([^]]*)\]') IS NULL THEN NULL
      ELSE regexp_split_to_array(
        regexp_replace(substring(notes FROM '"technology_classification"\s*:\s*\[([^]]*)\]'), '["\s]', '', 'g'),
        ','
      )
    END
  )
WHERE notes LIKE '%<<PLANNING_JSON>>%';