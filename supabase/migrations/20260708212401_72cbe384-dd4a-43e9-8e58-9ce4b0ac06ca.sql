
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

DROP POLICY IF EXISTS "All authenticated can view sites" ON public.sites;
CREATE POLICY "Workflow roles can view sites"
ON public.sites FOR SELECT
TO authenticated
USING (
  auth.uid() = submitted_by
  OR public.has_role(auth.uid(), 'planning_team')
  OR public.has_role(auth.uid(), 'procurement_team')
  OR public.has_role(auth.uid(), 'project_team')
);

DROP POLICY IF EXISTS "All authenticated can view submissions" ON public.procurement_submissions;
CREATE POLICY "Workflow roles can view procurement submissions"
ON public.procurement_submissions FOR SELECT
TO authenticated
USING (
  auth.uid() = submitted_by
  OR public.has_role(auth.uid(), 'planning_team')
  OR public.has_role(auth.uid(), 'procurement_team')
  OR public.has_role(auth.uid(), 'project_team')
);

DROP POLICY IF EXISTS "All authenticated can view feedback" ON public.procurement_feedback;
CREATE POLICY "Involved users can view procurement feedback"
ON public.procurement_feedback FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'procurement_team')
  OR public.has_role(auth.uid(), 'project_team')
  OR auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.sites s
    WHERE s.id = procurement_feedback.site_id
      AND s.submitted_by = auth.uid()
  )
);
