
-- Fix 1: Profiles - restrict SELECT to own profile + admins
DROP POLICY IF EXISTS "Anyone authenticated can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'project_team'));

-- Fix 2: Make storage buckets private
UPDATE storage.buckets SET public = false WHERE id IN ('site-documents', 'procurement-documents');

-- Add storage RLS policies for authenticated access
CREATE POLICY "Authenticated users can read site documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'site-documents');

CREATE POLICY "Authenticated users can read procurement documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'procurement-documents');

-- Fix 3: Notifications - restrict INSERT to validated user_id or admins
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Users or admins can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'project_team')
);

-- Fix 4: Activity log - restrict INSERT to validated user_id or admins
DROP POLICY IF EXISTS "System can insert activity" ON public.activity_log;

CREATE POLICY "Validated activity log insert"
ON public.activity_log FOR INSERT TO authenticated
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid() OR public.has_role(auth.uid(), 'project_team')
);
