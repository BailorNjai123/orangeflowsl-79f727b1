
-- Broaden SELECT to include new roles
DROP POLICY IF EXISTS "Workflow roles can view sites" ON public.sites;
CREATE POLICY "Workflow roles can view sites" ON public.sites
FOR SELECT
USING (
  (auth.uid() = submitted_by)
  OR public.has_role(auth.uid(), 'planning_team')
  OR public.has_role(auth.uid(), 'procurement_team')
  OR public.has_role(auth.uid(), 'power_team')
  OR public.has_role(auth.uid(), 'rollout_team')
  OR public.has_role(auth.uid(), 'project_team')
);

-- Power team can update sites (their power fields)
CREATE POLICY "Power team can update sites" ON public.sites
FOR UPDATE
USING (public.has_role(auth.uid(), 'power_team'));

-- Rollout team can update sites (rollout/progress fields)
CREATE POLICY "Rollout team can update sites" ON public.sites
FOR UPDATE
USING (public.has_role(auth.uid(), 'rollout_team'));
