
DROP POLICY IF EXISTS "Power team can update sites" ON public.sites;
DROP POLICY IF EXISTS "Rollout team can update sites" ON public.sites;

CREATE POLICY "Power team can update approved sites"
ON public.sites
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'power_team'::app_role)
  AND status = 'approved'::site_status
)
WITH CHECK (
  has_role(auth.uid(), 'power_team'::app_role)
  AND status = 'approved'::site_status
);

CREATE POLICY "Rollout team can update approved sites"
ON public.sites
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'rollout_team'::app_role)
  AND status = 'approved'::site_status
)
WITH CHECK (
  has_role(auth.uid(), 'rollout_team'::app_role)
  AND status = 'approved'::site_status
);
