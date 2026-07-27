-- 1. Restrict direct inserts to self only
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Controlled server-side routine for workflow notifications to other users
CREATE OR REPLACE FUNCTION public.send_workflow_notification(
  _user_ids uuid[],
  _title text,
  _message text,
  _type text DEFAULT 'info',
  _link text DEFAULT ''
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller uuid := auth.uid();
  _safe_link text;
  _safe_type text;
  _count integer := 0;
BEGIN
  IF _caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Only users with a workflow role may notify other users
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _caller) THEN
    RAISE EXCEPTION 'You do not have permission to send notifications';
  END IF;

  IF _user_ids IS NULL OR array_length(_user_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  IF array_length(_user_ids, 1) > 200 THEN
    RAISE EXCEPTION 'Too many recipients';
  END IF;

  IF coalesce(btrim(_title), '') = '' THEN
    RAISE EXCEPTION 'Title is required';
  END IF;

  -- Only internal app links are allowed (blocks phishing URLs)
  _safe_link := coalesce(_link, '');
  IF _safe_link <> '' AND _safe_link !~ '^/[A-Za-z0-9/_\-\?\=\&\.]*$' THEN
    _safe_link := '';
  END IF;

  _safe_type := coalesce(nullif(btrim(_type), ''), 'info');
  IF _safe_type NOT IN ('info', 'success', 'warning', 'error', 'security', 'workflow') THEN
    _safe_type := 'info';
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT DISTINCT u, left(btrim(_title), 200), left(coalesce(_message, ''), 1000), _safe_type, _safe_link
  FROM unnest(_user_ids) AS u
  WHERE u IS NOT NULL;

  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

REVOKE ALL ON FUNCTION public.send_workflow_notification(uuid[], text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_workflow_notification(uuid[], text, text, text, text) TO authenticated;