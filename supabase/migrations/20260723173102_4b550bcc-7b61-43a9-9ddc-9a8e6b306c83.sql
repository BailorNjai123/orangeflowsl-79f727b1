
DROP POLICY IF EXISTS "Workflow roles can view sites" ON public.sites;
DROP POLICY IF EXISTS "Admins can delete procurement submissions" ON public.procurement_submissions;

CREATE POLICY "Workflow roles can view sites" ON public.sites
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'planning_team') OR
    public.has_role(auth.uid(), 'procurement_team') OR
    public.has_role(auth.uid(), 'power_team') OR
    public.has_role(auth.uid(), 'rollout_team') OR
    public.has_role(auth.uid(), 'project_team')
  );

CREATE POLICY "Admins can delete procurement submissions" ON public.procurement_submissions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'project_team'));
