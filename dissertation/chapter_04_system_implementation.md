# Chapter Four — System Implementation and Testing

## 4.1 Introduction

This chapter documents the implementation of OrangeFlow SL in detail. It presents the physical organisation of the codebase, the database schema and its Row‑Level Security policies, the authentication and role‑resolution pipeline, the offline synchronisation mechanism, the privileged administrative Edge Function, the storage and signed‑URL delivery pipeline for evidentiary documents, and the front‑end architecture through which these components are surfaced to the user. Where source excerpts are pertinent to the exposition they are cited by relative path into the repository, and their complete forms are reproduced in the appendices.

## 4.2 Repository Organisation

The repository is organised into three top‑level trees corresponding to the three architectural tiers. The `src/` tree holds the React presentation tier, subdivided into `pages/` for route‑level components (`Login`, `PlanningDashboard`, `ProcurementDashboard`, `AdminDashboard`, `Dissertation`), `components/` for shared presentation components (including `AuthGuard`, `DashboardLayout`, `SiteMonitorTable`, `ProcSubmissionDetails`), `hooks/` for cross‑cutting behaviour (`useAuth`, `useOnlineSync`, `use-mobile`), `lib/` for framework‑agnostic helpers (`offlineQueue`, `storageUtils`) and `integrations/supabase/` for the auto‑generated backend client. The `supabase/migrations/` tree holds the immutable, forward‑only SQL migrations by which the database schema and its RLS policies are constructed. The `supabase/functions/` tree holds the privileged Deno Edge Functions, principally `manage-users` and `seed-users`.

## 4.3 Database Schema

The database is composed of two enumerated types (`app_role` with values `planning_team`, `procurement_team`, `project_team`; and `site_status` with values `pending`, `approved`, `rejected`, together with a parallel `feedback_status`) and seven relations.

- **`profiles`** — the human‑readable profile of each user (name, email, phone, department, active flag), keyed by the immutable `user_id` foreign key onto `auth.users`.
- **`user_roles`** — the authoritative record of role membership, deliberately held in a table distinct from `profiles` so that role assignment is separately protected. Composite unique on `(user_id, role)`.
- **`sites`** — the primary domain relation, one row per BTS candidate site, capturing identification, geographic, technical and power‑system fields together with the current `status` and the identity of the last reviewer.
- **`procurement_submissions`** — the nine‑point compliance checklist for a site, held as nine boolean flags and nine paired storage paths, so that each completed item may be accompanied by evidentiary upload.
- **`procurement_feedback`** — free‑text feedback attached by Procurement to a site, distinct from the checklist.
- **`notifications`** — per‑user notification queue, delivered to the recipient's dashboard.
- **`activity_log`** — the chronological audit trail.

The complete schema is reproduced in **Appendix A**. A concise summary of the principal columns of `sites` and `procurement_submissions` is given here as Table 4.1.

| Table | Selected columns |
|---|---|
| `sites` | `id`, `submitted_by`, `reviewed_by`, `site_name`, `site_id_code`, `region`, `district`, `latitude`, `longitude`, `tower_type`, `tower_height`, `power_source`, `status`, `review_notes` |
| `procurement_submissions` | `id`, `site_id`, `submitted_by`, `land_identified`, `ownership_verified`, `acquisition_approved`, `lease_negotiation`, `lease_signed`, `lease_registration`, `road_access`, `vendor_contract`, `site_handover`, and the nine paired `_file_url` paths |

## 4.4 Role Resolution and the Role Oracle

Role membership is queried through two `SECURITY DEFINER` helper functions, both marked `STABLE` and both pinned to `search_path = public` in order to defeat schema‑poisoning attacks:

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles
                 WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;
```

`has_role` is invoked from within RLS policies that need to gate an operation on the caller's role. Because these functions run under the definer's authority they bypass recursive policy evaluation on `user_roles`, thereby avoiding the infinite‑recursion trap discussed in Chapter Two.

Defensively, a trigger `prevent_role_self_escalation` is attached to `user_roles` and refuses any insert or update issued by a caller that does not itself hold the `project_team` role:

```sql
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
```

## 4.5 Row‑Level Security Policies

Every user‑facing table is protected by RLS. The full policy set is reproduced in Appendix A; the principal policies are summarised here to make the security model legible without reference to that appendix.

- **`profiles`**: any authenticated user may `SELECT`; the owner may `UPDATE` their own row; the administrator may `UPDATE` or `DELETE` any row.
- **`user_roles`**: the owner may `SELECT` their own role; administrators may `SELECT` all roles and are the sole role permitted to `INSERT`, `UPDATE` or `DELETE`.
- **`sites`**: `SELECT` is scoped to the submitter and to members of the workflow roles; `INSERT` requires the `planning_team` role and that the new row's `submitted_by` equal `auth.uid()`; `UPDATE` is available to the submitter (while the row remains pending) and to the administrator; `DELETE` is available only to the administrator.
- **`procurement_submissions`** and **`procurement_feedback`**: `SELECT` is scoped to the site's submitter and to the workflow roles; `INSERT` and `UPDATE` require the `procurement_team` role and equality of `submitted_by` (or `user_id`) to `auth.uid()`.
- **`activity_log`**: `SELECT` is restricted to administrators; the log is written by the application on every state transition.

## 4.6 Storage and Signed URL Delivery

Two private object‑storage buckets — `site-documents` and `procurement-documents` — hold the evidentiary uploads. Neither bucket is publicly readable. Access is mediated by RLS policies attached to the `storage.objects` relation which require that (i) the object path lie under a folder prefix equal to the caller's `user_id`, and (ii) the caller hold the appropriate workflow role. Delivery to the browser is via a short‑lived signed URL, requested at the point of authorised access:

```typescript
const { data, error } = await supabase.storage
  .from('procurement-documents')
  .createSignedUrl(path, 3600); // one hour
```

A dedicated download control, added in a later iteration, fetches the object as a blob via `supabase.storage.from(bucket).download(path)` and presents it as a browser download rather than a redirect, so that PDFs open in the user's local reader without triggering unrelated in‑browser rendering behaviour.

## 4.7 Authentication and Route Guarding

Authentication is implemented as email/password login against the managed backend, returning a JWT that is persisted in `localStorage` by the client library and attached to every subsequent PostgREST request. A React context, `useAuth`, holds the current `user`, resolves the user's `role` via `get_user_role`, and exposes a `loading` flag during the initial hydration.

Route guarding is expressed by the `AuthGuard` component (`src/components/AuthGuard.tsx`), which is wrapped around every protected route and consults `useAuth`. Unauthenticated users are redirected to `/login`; authenticated users whose role does not fall within the route's `allowedRoles` set are redirected to the dashboard of their actual role via a small explicit map. It is important to observe that this route guard is a **usability** measure, not a **security** measure: security is enforced at the database layer by RLS. The route guard exists so that users do not see interfaces they cannot use, not to prevent access to data they should not see.

## 4.8 Offline Capture and Synchronisation

The offline layer is composed of three concerns. **Capture** is implemented in `src/lib/offlineQueue.ts`, which serialises writable mutations to IndexedDB under keys prefixed with `offline_queue_`, together with a monotonically increasing sequence number, an operation type and the intended payload. **Detection** is implemented in `src/hooks/useOnlineSync.ts`, which subscribes to the browser's `online` and `offline` events and to a periodic polling tick. **Reconciliation**, invoked by the sync hook whenever the browser reports connectivity, iterates the queue in insertion order, applies each mutation to the backend and deletes the queue entry on success. On failure the entry is preserved for a subsequent retry; no entry is silently discarded. This design satisfies the three properties of a reliable offline layer identified in Chapter Two: durability of capture, ordered application and idempotence under retry.

## 4.9 Privileged Edge Function for User Management

The creation, deletion and role assignment of user accounts require the service role, which is not available in the browser. These operations are therefore mediated by the `manage-users` Edge Function (`supabase/functions/manage-users/index.ts`), which is invoked from the administrator dashboard over an authenticated fetch. The function verifies the caller's JWT, verifies that the caller holds the `project_team` role, and only then invokes the administrative Auth API with the service‑role key. This pattern confines the service role to a small, auditable trusted‑code path and prevents its exposure to the browser under any circumstances. The complete source of the function is reproduced in **Appendix C**.

## 4.10 Front‑End Component Architecture

The front end is organised around a small set of composable components. `DashboardLayout` renders the outer chrome — header, navigation and content region — that is common to every dashboard route. `SiteMonitorTable` renders the tabular view of sites; `ProcSubmissionDetails` renders the nine‑point checklist and its evidentiary uploads; `StatCard` and `StatusBadge` supply the atomic presentational elements from which the dashboards are composed. Data acquisition is centralised on TanStack Query, whose caching, background refetching and stale‑while‑revalidate semantics give the dashboards their thirty‑second refresh cadence without additional bespoke code.

## 4.11 Notifications and the Activity Log

Every state transition — site submission, checklist completion, approval, rejection — writes a row to `activity_log` and dispatches a notification to the recipient user. The notifications table is subscribed to by each dashboard via the client library's real‑time channels, so that the recipient's dashboard updates without a manual reload.

## 4.12 Testing and Verification

Testing was conducted along the four axes defined in Chapter Three. For **functional** verification, each functional requirement was exercised through a role‑based scenario against a live backend; the results are reported in Chapter Five. For **security** verification, RLS policies were exercised through negative testing, and the migration‑level policy set was inspected to confirm that the enforced restrictions persist independently of any particular version of the client code. The `prevent_role_self_escalation` trigger was exercised by attempting, as an authenticated non‑administrator, to insert a row into `user_roles` granting oneself the administrator role; the operation was refused as required. For **offline** verification, the network was disabled at the browser level, writable operations were performed, the resulting IndexedDB queue was inspected under the browser developer tools, and the network was subsequently re‑enabled; the queue was observed to drain in insertion order and the corresponding rows to appear in the database. For **responsive** verification, the interface was rendered at 390, 820 and 1440 CSS pixels and inspected for horizontal overflow, clipping and legibility.

Beyond the four‑axis strategy, a lightweight Vitest suite exercises pure helper functions in isolation, and Playwright was driven from the shell to capture visual evidence for the responsive strand. The generated diagrams referenced throughout Chapter Three were themselves verified to scale fluidly to all three viewport widths without clipping.

## 4.13 Deployment

The application is deployed as a PWA served over HTTPS from a globally distributed edge, with the backend hosted on the managed platform in the same region. The service worker is generated by `vite-plugin-pwa` at build time and caches the application shell for offline first paint. The `manifest.json` declares the installability metadata (name, short name, theme colour, icons) required for the browser to offer the "install" affordance. Deployment is automated from the trunk branch of the source repository.

## 4.14 Chapter Summary

This chapter documented the implementation of OrangeFlow SL: the repository organisation, the database schema, the role‑resolution helpers and self‑escalation trigger, the Row‑Level Security policies, the storage and signed‑URL delivery pipeline, the authentication and route‑guarding surface, the offline capture and reconciliation mechanism, the privileged Edge Function for user management, the front‑end component architecture and the testing and deployment posture. The empirical results obtained from the testing strategy set out here are reported in Chapter Five.
