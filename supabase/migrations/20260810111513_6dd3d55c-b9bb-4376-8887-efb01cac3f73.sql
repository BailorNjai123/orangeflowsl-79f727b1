DROP POLICY IF EXISTS "Read site documents scoped" ON storage.objects;

CREATE POLICY "Read site documents scoped"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'site-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'project_team'::public.app_role)
    OR (
      public.has_role(auth.uid(), 'procurement_team'::public.app_role)
      AND COALESCE((storage.foldername(name))[2], '') <> 'excel'
    )
    OR (
      (storage.foldername(name))[1] = 'power'
      AND public.has_role(auth.uid(), 'power_team'::public.app_role)
    )
    OR (
      (storage.foldername(name))[1] = 'rollout'
      AND (
        public.has_role(auth.uid(), 'rollout_team'::public.app_role)
        OR public.has_role(auth.uid(), 'power_team'::public.app_role)
      )
    )
  )
);