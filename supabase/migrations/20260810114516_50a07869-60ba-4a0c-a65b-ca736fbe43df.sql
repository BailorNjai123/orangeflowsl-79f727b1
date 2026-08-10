UPDATE public.sites
SET technology_classification = ARRAY(
  SELECT jsonb_array_elements_text(
    ('[' || substring(sites.notes FROM '"technology_classification"\s*:\s*\[([^]]*)\]') || ']')::jsonb
  )
)
WHERE notes LIKE '%<<PLANNING_JSON>>%'
  AND substring(notes FROM '"technology_classification"\s*:\s*\[([^]]*)\]') IS NOT NULL;