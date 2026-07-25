
-- Replace INSERT policy for site-documents to include power_team and rollout_team
DROP POLICY IF EXISTS "Upload site documents scoped" ON storage.objects;
CREATE POLICY "Upload site documents scoped"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'site-documents'
  AND (
    -- Planning/Admin uploads keyed by user id folder
    (
      (storage.foldername(name))[1] = (auth.uid())::text
      AND (public.has_role(auth.uid(), 'planning_team') OR public.has_role(auth.uid(), 'project_team'))
    )
    -- Power team uploads under power/
    OR (
      (storage.foldername(name))[1] = 'power'
      AND (public.has_role(auth.uid(), 'power_team') OR public.has_role(auth.uid(), 'project_team'))
    )
    -- Rollout team uploads under rollout/
    OR (
      (storage.foldername(name))[1] = 'rollout'
      AND (public.has_role(auth.uid(), 'rollout_team') OR public.has_role(auth.uid(), 'project_team'))
    )
  )
);

-- Replace SELECT policy so power/rollout teams can read their folders
DROP POLICY IF EXISTS "Read site documents scoped" ON storage.objects;
CREATE POLICY "Read site documents scoped"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'site-documents'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.has_role(auth.uid(), 'project_team')
    OR public.has_role(auth.uid(), 'procurement_team')
    OR (
      (storage.foldername(name))[1] = 'power'
      AND public.has_role(auth.uid(), 'power_team')
    )
    OR (
      (storage.foldername(name))[1] = 'rollout'
      AND (public.has_role(auth.uid(), 'rollout_team') OR public.has_role(auth.uid(), 'power_team'))
    )
  )
);

-- Replace UPDATE policy to allow upsert by power/rollout teams
DROP POLICY IF EXISTS "Owners or admins can update site docs" ON storage.objects;
CREATE POLICY "Owners or admins can update site docs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'site-documents'
  AND (
    owner = auth.uid()
    OR public.has_role(auth.uid(), 'project_team')
    OR (
      (storage.foldername(name))[1] = 'power'
      AND public.has_role(auth.uid(), 'power_team')
    )
    OR (
      (storage.foldername(name))[1] = 'rollout'
      AND public.has_role(auth.uid(), 'rollout_team')
    )
  )
)
WITH CHECK (
  bucket_id = 'site-documents'
  AND (
    owner = auth.uid()
    OR public.has_role(auth.uid(), 'project_team')
    OR (
      (storage.foldername(name))[1] = 'power'
      AND public.has_role(auth.uid(), 'power_team')
    )
    OR (
      (storage.foldername(name))[1] = 'rollout'
      AND public.has_role(auth.uid(), 'rollout_team')
    )
  )
);
