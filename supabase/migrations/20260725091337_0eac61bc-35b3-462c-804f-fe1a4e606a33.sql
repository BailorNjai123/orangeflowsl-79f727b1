
-- Widen procurement_submissions SELECT to include rollout & power teams
DROP POLICY IF EXISTS "Workflow roles can view procurement submissions" ON public.procurement_submissions;
CREATE POLICY "Workflow roles can view procurement submissions"
ON public.procurement_submissions
FOR SELECT
TO authenticated
USING (
  auth.uid() = submitted_by
  OR public.has_role(auth.uid(), 'planning_team'::app_role)
  OR public.has_role(auth.uid(), 'procurement_team'::app_role)
  OR public.has_role(auth.uid(), 'power_team'::app_role)
  OR public.has_role(auth.uid(), 'rollout_team'::app_role)
  OR public.has_role(auth.uid(), 'project_team'::app_role)
);

-- Allow authenticated users to send in-app notifications to other users
DROP POLICY IF EXISTS "Users or admins can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
