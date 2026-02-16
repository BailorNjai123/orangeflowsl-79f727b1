
-- Archive table for deleted users
CREATE TABLE public.deleted_users_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id uuid NOT NULL,
  email text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  department text DEFAULT '',
  phone text DEFAULT '',
  role text DEFAULT '',
  was_active boolean DEFAULT true,
  deleted_by uuid,
  deleted_by_name text DEFAULT '',
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  reason text DEFAULT ''
);

-- Enable RLS
ALTER TABLE public.deleted_users_archive ENABLE ROW LEVEL SECURITY;

-- Only admins can view archived users
CREATE POLICY "Admins can view deleted users archive"
ON public.deleted_users_archive
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'project_team'::app_role));

-- Only admins can insert (via edge function with service role, but policy for safety)
CREATE POLICY "Admins can insert deleted users archive"
ON public.deleted_users_archive
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'project_team'::app_role));
