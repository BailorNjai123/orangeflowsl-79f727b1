DROP POLICY IF EXISTS "Read procurement documents scoped" ON storage.objects;
CREATE POLICY "Read procurement documents scoped"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'procurement-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'project_team')
    OR public.has_role(auth.uid(), 'procurement_team')
    OR public.has_role(auth.uid(), 'rollout_team')
  )
);