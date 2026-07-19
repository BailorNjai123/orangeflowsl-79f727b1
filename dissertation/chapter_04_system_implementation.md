# Chapter Four — System Implementation

## 4.1 Introduction

This chapter documents the concrete implementation of OrangeFlow SL. Each subsequent section addresses one operational concern — authentication, role assignment, planning, procurement, administrative control, notifications and audit, offline synchronisation, responsive user interface and administrative user management — and explains, at the level of design intent rather than raw source code, how the requirements set out in Chapter Three were satisfied.

## 4.2 System Overview

OrangeFlow SL is delivered as a single installable Progressive Web Application. On first load, the application registers a service worker, requests authentication credentials and — following successful login — routes the user to the dashboard that corresponds to their assigned role. Every mutation is issued to the managed PostgreSQL backend through the typed JavaScript client, or, when the network is unavailable, deposited in a local IndexedDB queue for later replay. Every mutation that succeeds is reflected in the chronological activity log and, where relevant, in an in‑app notification delivered to the affected downstream role.

## 4.3 Authentication and Session Management

Authentication is delegated to the managed authentication service, which issues short‑lived JWTs on successful email‑and‑password login. The JWT is persisted in the browser's local storage by the client library and automatically refreshed in the background. A dedicated `AuthGuard` component wraps every protected route, blocking rendering until the session state has been resolved, redirecting unauthenticated visitors to the login page and redirecting authenticated users away from routes not permitted for their role. Session hydration on cold start is centralised in a single `useAuth` hook so that route guards, navigation and data queries observe a consistent state.

## 4.4 Role Assignment and Access Control

Roles are represented by the enumerated type `app_role` with values `planning_team`, `procurement_team` and `project_team`, and stored in a dedicated `user_roles` table rather than on the user profile. A `SECURITY DEFINER` helper function, `has_role(user_id, role)`, is invoked from Row‑Level Security policies to test membership without recursive policy evaluation. A companion trigger, `prevent_role_self_escalation`, rejects any insert or update on `user_roles` initiated by a caller who is not already a Project Administrator, closing the class of vulnerabilities in which a compromised or hostile authenticated user attempts to grant themselves elevated privileges.

Row‑Level Security policies are declared on each operational table and scoped to the minimum audience required. Where a table is written to only by a specific role, the corresponding `INSERT` policy names that role; where a table's rows are personal to their owner, `SELECT` policies additionally admit the row owner. Explicit `GRANT` statements accompany every table so that PostgREST can reach the table at all — a step that must not be omitted because the public schema is not granted to authenticated roles by default.

## 4.5 Planning Module — Site Submission

Members of the Planning Team submit a proposed BTS site through a structured multi‑section form covering identification, geographic coordinates, technical specification and power arrangement. On submission the form is validated on the client, then written to the `sites` table. The submission is attributed to the authenticated user through the `submitted_by` column, which participates in downstream RLS predicates so that a planner can subsequently view and — while the submission remains in the pending state — edit their own record, but cannot alter another planner's submission.

## 4.6 Procurement Module — Nine‑Point Checklist

Once a site enters the procurement stage, a member of the Procurement Team opens the submission and completes a nine‑point compliance checklist. Each item is captured as structured data in the `procurement_submissions` table and, where evidentiary documentation is required, an accompanying file is uploaded to the private `procurement-documents` bucket. Files are stored under a path derived from the authenticated user's identifier, and both the read and write policies on the bucket require the caller either to own the path prefix or to hold a workflow role that is permitted to review the file. Retrieval is via short‑lived signed URLs generated on demand rather than by publicly exposing the bucket.

## 4.7 Administrative Pipeline Control

A Project Administrator receives every completed procurement submission on the administrative dashboard, together with the underlying site record and any uploaded documents. The administrator may approve or reject the submission; a rejection requires a reason, which is persisted so that the responsible planner and procurement officer can act on it. The administrator additionally has global visibility of all sites and their current status, and holds the sole authority to delete a site record — a restriction enforced by the RLS policy on `sites` rather than merely by the absence of a delete control in the interface.

## 4.8 Notifications and Activity Log

Every workflow state change generates two artefacts. First, an in‑app notification is written to the `notifications` table and delivered to the users whose role is next in the pipeline, or, in the case of a rejection, back to the originating planner. Second, an `activity_log` entry records the actor, the action, the target record and the timestamp. The activity log is append‑only in intent, its `SELECT` policy is scoped to administrators, and it constitutes the chronological, tamper‑evident audit trail that was absent from the incumbent manual workflow.

## 4.9 Offline Capture and Synchronisation

The offline subsystem consists of three cooperating parts. A service worker, registered on first load, caches the application shell and static assets so that the interface renders even when the network is unreachable. A queue module built on `idb-keyval` writes each mutation, when the browser reports itself offline, to an IndexedDB entry prefixed with `offline_queue_`, together with the target table, operation and payload. A synchronisation hook listens for the browser's `online` event and, on transition to online, iterates the queued entries in insertion order, dispatches each one to the appropriate table via the client, and deletes the entry on success or logs and preserves it on failure. Because each queued operation carries its own identifier and is applied through the same code path as an online operation, replay is idempotent from the perspective of the authoritative store.

## 4.10 User Interface and Responsive Design

The user interface is built with Tailwind CSS and the shadcn/ui component set, both configured against a single token palette expressing the Orange SL identity. All layouts are mobile‑first: components collapse from multi‑column to single‑column at the small‑viewport breakpoint, cards apply `min-w-0` and `overflow-hidden` to prevent overflow of long text, and a media query suppresses the visible scrollbar on viewports below the tablet breakpoint so that the installed PWA presents a native‑feeling surface. A print stylesheet reformats the dissertation viewer route for A4 output.

## 4.11 Administrative User Management via Edge Function

Creation, modification and deletion of user accounts require privileges that the browser‑side client is not permitted to hold. These operations are therefore delegated to a `manage-users` Deno Edge Function that authenticates the caller, verifies via `has_role` that the caller is a Project Administrator, and performs the requested operation using the service role key that is available only to server‑side code. A separate `seed-users` function performs first‑run provisioning with strong, randomly generated passwords. Deleted accounts are archived to `deleted_users_archive` for compliance retention, and any storage objects owned by a deleted user are removed from the private buckets before the corresponding database rows are purged, in accordance with the project's file‑management discipline.

## 4.12 Challenges Encountered and Solutions Adopted

Four classes of challenge shaped the final implementation:

1. **Policy recursion.** Naïve RLS policies that referenced `user_roles` from within their own predicate triggered recursive evaluation. The `SECURITY DEFINER` helper function `has_role` was introduced to short‑circuit this recursion while preserving least‑privilege semantics.
2. **Missing GRANTs on public tables.** Newly created public‑schema tables were unreachable through PostgREST until explicit `GRANT` statements were added in the same migration. This became a standing rule: every `CREATE TABLE` is accompanied by GRANTs to the roles that the policies permit.
3. **Overly permissive storage policies.** Early storage policies permitted any authenticated user to read from the buckets. These were replaced with owner‑or‑team predicates that restrict both read and write to the file's owner and to the workflow roles that legitimately need access.
4. **Silent offline replay failures.** An initial version of the queue processor swallowed errors. The processor now logs each failure in development builds, preserves the failing entry for a subsequent retry and reports aggregate processed and failed counts to the caller.

## 4.13 Chapter Summary

This chapter documented the implementation of OrangeFlow SL module by module and identified the principal engineering challenges encountered along the way. The next chapter reports the results of verifying the completed system against the requirements set out in Chapter Three.
