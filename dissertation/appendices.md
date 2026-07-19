# Appendices

The appendices reproduce the principal source artefacts of OrangeFlow SL in a form suitable for external review, discharging the requirement that the dissertation record the implementation in reproducible detail. Where an artefact exceeds a comfortable reading length, a representative excerpt is reproduced here and the full form is referenced by path in the repository.

## Appendix A — Database Schema and Enumerations

The domain vocabulary is closed under two enumerations:

```sql
CREATE TYPE public.app_role       AS ENUM ('planning_team', 'procurement_team', 'project_team');
CREATE TYPE public.site_status    AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.feedback_status AS ENUM ('pending', 'accepted', 'rejected');
```

The seven principal relations are defined in `supabase/migrations/20260212233307_*.sql`. The two workflow‑critical relations are reproduced here in full.

```sql
CREATE TABLE public.sites (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  site_name                TEXT NOT NULL,
  site_id_code             TEXT NOT NULL DEFAULT '',
  region                   TEXT NOT NULL DEFAULT '',
  district                 TEXT NOT NULL DEFAULT '',
  town                     TEXT NOT NULL DEFAULT '',
  address                  TEXT DEFAULT '',
  latitude                 DECIMAL,
  longitude                DECIMAL,
  site_type                TEXT DEFAULT '',
  terrain_type             TEXT DEFAULT '',
  access_road_condition    TEXT DEFAULT '',
  tower_type               TEXT DEFAULT '',
  tower_height             DECIMAL,
  antenna_type             TEXT DEFAULT '',
  number_of_antennas       INTEGER DEFAULT 0,
  power_source             TEXT DEFAULT '',
  backup_power             TEXT DEFAULT '',
  equipment_shelter        TEXT DEFAULT '',
  project_name             TEXT DEFAULT '',
  vendor_name              TEXT DEFAULT '',
  contractor_name          TEXT DEFAULT '',
  estimated_cost           DECIMAL,
  target_completion_date   DATE,
  site_photo_url           TEXT DEFAULT '',
  layout_plan_url          TEXT DEFAULT '',
  approval_letter_url      TEXT DEFAULT '',
  notes                    TEXT DEFAULT '',
  review_notes             TEXT DEFAULT '',
  status                   site_status NOT NULL DEFAULT 'pending',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.procurement_submissions (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id                         UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  submitted_by                    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by                     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  land_identified                 BOOLEAN NOT NULL DEFAULT false,
  land_identified_file_url        TEXT DEFAULT '',
  ownership_verified              BOOLEAN NOT NULL DEFAULT false,
  ownership_verified_file_url     TEXT DEFAULT '',
  acquisition_approved            BOOLEAN NOT NULL DEFAULT false,
  acquisition_approved_file_url   TEXT DEFAULT '',
  lease_negotiation               BOOLEAN NOT NULL DEFAULT false,
  lease_negotiation_file_url      TEXT DEFAULT '',
  lease_signed                    BOOLEAN NOT NULL DEFAULT false,
  lease_signed_file_url           TEXT DEFAULT '',
  lease_registration              BOOLEAN NOT NULL DEFAULT false,
  lease_registration_file_url     TEXT DEFAULT '',
  road_access                     BOOLEAN NOT NULL DEFAULT false,
  road_access_file_url            TEXT DEFAULT '',
  vendor_contract                 BOOLEAN NOT NULL DEFAULT false,
  vendor_contract_file_url        TEXT DEFAULT '',
  site_handover                   BOOLEAN NOT NULL DEFAULT false,
  site_handover_file_url          TEXT DEFAULT '',
  notes                           TEXT DEFAULT '',
  review_notes                    TEXT DEFAULT '',
  status                          site_status NOT NULL DEFAULT 'pending',
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The full schema, including `profiles`, `user_roles`, `procurement_feedback`, `notifications` and `activity_log`, is contained in the initial migration.

## Appendix B — Row‑Level Security Policies and Security Definer Functions

```sql
-- Role oracle: SECURITY DEFINER, STABLE, pinned search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

-- Defensive trigger against self‑escalation on user_roles
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'project_team') THEN
    RAISE EXCEPTION 'Only administrators can assign user roles';
  END IF;
  RETURN NEW;
END;
$$;

-- Sample policies (illustrative subset)
CREATE POLICY "Planning team can insert sites"
  ON public.sites FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'planning_team')
              AND auth.uid() = submitted_by);

CREATE POLICY "Admins can delete sites"
  ON public.sites FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'project_team'));

CREATE POLICY "Admins can view activity log"
  ON public.activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'project_team'));
```

Storage policies attached to `storage.objects` require both a path prefix match on the caller's `user_id` and the appropriate workflow role for `SELECT` and `INSERT` on the `site-documents` and `procurement-documents` buckets.

## Appendix C — Privileged Edge Function (User Management)

The `manage-users` Edge Function (`supabase/functions/manage-users/index.ts`) mediates account creation, role assignment and deactivation. The function verifies the caller's JWT, verifies that the caller holds the `project_team` role via `has_role`, and only then invokes the administrative Auth API with the service‑role key. The service‑role key is available exclusively inside the function's runtime environment; it is not present in the browser at any time. The full source is preserved in the repository and versioned with the rest of the code.

## Appendix D — Offline Queue and Synchronisation Hook

The offline queue is implemented in `src/lib/offlineQueue.ts` and consumed by `src/hooks/useOnlineSync.ts`. The queue writes each mutation to IndexedDB under a monotonically increasing key prefixed with `offline_queue_`; the synchronisation hook subscribes to the browser's `online` and `offline` events and, upon reconnection, iterates the queue in insertion order, applying each mutation and deleting successful entries. Failed entries are preserved for subsequent retry.

## Appendix E — Package Manifest (Runtime Dependencies)

The runtime dependency set is declared in `package.json` at the repository root. Principal entries include: `react` ^18, `react-dom` ^18, `react-router-dom` ^6, `@tanstack/react-query` ^5, `@supabase/supabase-js` ^2, `idb-keyval` ^6, `zod` ^3, `tailwindcss` ^3, `vite` ^5, `vite-plugin-pwa` ^0.20 and the shadcn/ui component set built over Radix UI primitives.

## Appendix F — Diagrams

The system architecture, use‑case, activity, flowchart, entity‑relationship and database‑schema diagrams referenced from Chapter Three are provided as fluid SVG files at the repository root (`system_architecture.svg`, `use_case_diagram.svg`, `activity_diagram.svg`, `system_flowchart.svg`, `entity_relationship_diagram.svg`, `database_schema.svg`) and mirrored under `public/dissertation/` for in‑application delivery through the `/dissertation` route.
