
-- Allow admins to delete procurement submissions
CREATE POLICY "Admins can delete procurement submissions"
ON public.procurement_submissions
FOR DELETE
USING (has_role(auth.uid(), 'project_team'::app_role));

-- Allow planning team to delete their own pending/rejected sites
CREATE POLICY "Planning can delete own sites"
ON public.sites
FOR DELETE
USING (
  has_role(auth.uid(), 'planning_team'::app_role)
  AND auth.uid() = submitted_by
  AND status IN ('pending', 'rejected')
);
