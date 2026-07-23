
-- 1) Audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  caller_user_id UUID,
  caller_role TEXT,
  arguments JSONB,
  error_message TEXT,
  error_code TEXT,
  severity TEXT NOT NULL DEFAULT 'error',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.security_audit_log TO authenticated;
GRANT ALL ON public.security_audit_log TO service_role;

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security audit log"
  ON public.security_audit_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'project_team'));

CREATE INDEX IF NOT EXISTS security_audit_log_occurred_at_idx
  ON public.security_audit_log (occurred_at DESC);
CREATE INDEX IF NOT EXISTS security_audit_log_function_name_idx
  ON public.security_audit_log (function_name);

-- 2) Central logger + admin alerting (SECURITY DEFINER so it can always write)
CREATE OR REPLACE FUNCTION public.log_security_event(
  _function_name TEXT,
  _arguments JSONB,
  _error_message TEXT,
  _error_code TEXT,
  _severity TEXT DEFAULT 'error'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _role TEXT := current_setting('request.jwt.claim.role', true);
  _admin RECORD;
BEGIN
  INSERT INTO public.security_audit_log (
    function_name, caller_user_id, caller_role, arguments,
    error_message, error_code, severity
  ) VALUES (
    _function_name, _uid, _role, _arguments,
    _error_message, _error_code, _severity
  );

  -- Fan-out an in-app notification to every administrator
  FOR _admin IN
    SELECT user_id FROM public.user_roles WHERE role = 'project_team'
  LOOP
    BEGIN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        _admin.user_id,
        'Security function failure',
        format('%s failed: %s', _function_name, COALESCE(_error_message, 'unknown')),
        'security',
        '/admin'
      );
    EXCEPTION WHEN OTHERS THEN
      -- Never let notification failure block the audit write
      NULL;
    END;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.log_security_event(TEXT, JSONB, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_security_event(TEXT, JSONB, TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 3) Wrap has_role with error capture
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO _result;
  RETURN _result;
EXCEPTION WHEN OTHERS THEN
  PERFORM public.log_security_event(
    'has_role',
    jsonb_build_object('user_id', _user_id, 'role', _role),
    SQLERRM,
    SQLSTATE,
    'error'
  );
  RETURN false; -- fail-closed
END;
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated, service_role;

-- 4) Wrap get_user_role with error capture
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result app_role;
BEGIN
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1 INTO _result;
  RETURN _result;
EXCEPTION WHEN OTHERS THEN
  PERFORM public.log_security_event(
    'get_user_role',
    jsonb_build_object('user_id', _user_id),
    SQLERRM,
    SQLSTATE,
    'error'
  );
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_role(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, service_role;

-- 5) Wrap prevent_role_self_escalation to capture blocked escalations
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'project_team') THEN
    PERFORM public.log_security_event(
      'prevent_role_self_escalation',
      jsonb_build_object('attempted_user_id', NEW.user_id, 'attempted_role', NEW.role, 'actor', auth.uid()),
      'Blocked non-admin role assignment attempt',
      'P0001',
      'critical'
    );
    RAISE EXCEPTION 'Only administrators can assign user roles';
  END IF;
  RETURN NEW;
END;
$$;
