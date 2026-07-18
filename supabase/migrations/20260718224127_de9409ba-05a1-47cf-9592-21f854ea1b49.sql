
-- Tighten storage.objects policies for procurement-documents & site-documents
DROP POLICY IF EXISTS "Authenticated users can read procurement documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read site documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload procurement docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload site docs" ON storage.objects;

-- SELECT: owner (first path segment matches uid) OR reviewer roles
CREATE POLICY "Read procurement documents scoped"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'procurement-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'project_team')
    OR public.has_role(auth.uid(), 'procurement_team')
  )
);

CREATE POLICY "Read site documents scoped"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'site-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'project_team')
    OR public.has_role(auth.uid(), 'procurement_team')
  )
);

-- INSERT: must upload under own uid folder AND have appropriate role
CREATE POLICY "Upload procurement documents scoped"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'procurement-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    public.has_role(auth.uid(), 'procurement_team')
    OR public.has_role(auth.uid(), 'project_team')
  )
);

CREATE POLICY "Upload site documents scoped"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'site-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    public.has_role(auth.uid(), 'planning_team')
    OR public.has_role(auth.uid(), 'project_team')
  )
);

-- Defensive trigger to prevent any privilege escalation on user_roles:
-- callers other than service_role may only insert roles if they are project_team admin.
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'project_team') THEN
    RAISE EXCEPTION 'Only administrators can assign user roles';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_self_escalation_trg ON public.user_roles;
CREATE TRIGGER prevent_role_self_escalation_trg
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();
