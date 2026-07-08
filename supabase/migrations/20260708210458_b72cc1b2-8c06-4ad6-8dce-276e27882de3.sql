
-- 1. Remove public SELECT policies on storage.objects for private buckets
DROP POLICY IF EXISTS "Anyone can view procurement docs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view site docs" ON storage.objects;

-- 2. Tighten UPDATE/DELETE on storage.objects to owner or admin
DROP POLICY IF EXISTS "Users can update own procurement docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own site docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete procurement docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete site docs" ON storage.objects;

CREATE POLICY "Owners or admins can update procurement docs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'procurement-documents'
  AND (owner = auth.uid() OR public.has_role(auth.uid(), 'project_team'))
)
WITH CHECK (
  bucket_id = 'procurement-documents'
  AND (owner = auth.uid() OR public.has_role(auth.uid(), 'project_team'))
);

CREATE POLICY "Owners or admins can delete procurement docs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'procurement-documents'
  AND (owner = auth.uid() OR public.has_role(auth.uid(), 'project_team'))
);

CREATE POLICY "Owners or admins can update site docs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'site-documents'
  AND (owner = auth.uid() OR public.has_role(auth.uid(), 'project_team'))
)
WITH CHECK (
  bucket_id = 'site-documents'
  AND (owner = auth.uid() OR public.has_role(auth.uid(), 'project_team'))
);

CREATE POLICY "Owners or admins can delete site docs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'site-documents'
  AND (owner = auth.uid() OR public.has_role(auth.uid(), 'project_team'))
);

-- 3. Restrict activity_log SELECT to admins only
DROP POLICY IF EXISTS "All authenticated can view activity" ON public.activity_log;
CREATE POLICY "Admins can view activity log"
ON public.activity_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'project_team'));

-- 4. Revoke public/anon EXECUTE on SECURITY DEFINER helper functions; grant only to authenticated (required for RLS policies)
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
