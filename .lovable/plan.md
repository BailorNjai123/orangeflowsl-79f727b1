# OrangeFlow SL — Power/Rollout Dashboard Refactor

Large architectural change. Procurement & Admin visual layouts stay untouched — only additive changes (new role options in Admin user-management form, new workflow triggers behind the scenes).

## 1. Database (new migration)

- Extend `app_role` enum: add `'power_team'`, `'rollout_team'`.
- Update `prevent_role_self_escalation` — still admin-only.
- Add columns to `sites` if missing: `grid_transformer_capacity text`, `solar_capacity numeric`, `generator_capacity numeric`, `power_rfi_status text default 'Not Started'`, `power_certificate_url text`, `progress_percent numeric default 0`.
- RLS: allow `power_team` SELECT on sites where status ≥ handed_over; UPDATE only power_* columns. Allow `rollout_team` SELECT similarly; UPDATE milestone columns.
- Trigger `sync_power_to_rollout`: when `power_rfi_status` → 'Completed', set `sites.power_rfi = 'Completed'` and insert activity_log entry.
- Trigger `recalc_progress`: on update of milestone cols (soil_test, site_implementation_design, cast_status, tower_rig, civil_rfi, power_rfi, on_air) recompute `progress_percent = completed/7*100`.
- Trigger `activate_power_rollout`: when procurement handover date set OR status transitions, no-op (activation is implicit via RLS + status filter).
- GRANTs for new role rows.

## 2. Auth & Routing

- `useAuth` AppRole type ← add `'power_team' | 'rollout_team'`.
- `AuthGuard` redirect map: `power_team → /dashboard/power`, `rollout_team → /dashboard/rollout`.
- `App.tsx`: add routes `/dashboard/power` (PowerDashboard), `/dashboard/rollout` (RolloutDashboard).
- `Login.tsx` post-login redirect: same mapping.

## 3. Planning Dashboard

Remove all power inputs from the site form/module UI: `power_source`, `power_requirement`, `power_backup_type`, `battery_bank_type`, `number_of_battery_banks`, `earthing_resistance`. Keep the other 61 fields intact. Do not delete columns from DB (Power dashboard will own them).

## 4. Power Dashboard (new)

`src/pages/PowerDashboard.tsx` — lists sites where `status IN ('handed_over_to_vendor','in_progress','completed')`. Detail drawer with Section A (editable fields) and Section B (RFI status badge + certificate upload to `site-documents` bucket at path `power/{site_id}/...`). Validation: earthing_resistance ≤ 5.0. Read-only when role ≠ `power_team`.

## 5. Rollout Dashboard (new)

`src/pages/RolloutDashboard.tsx` — same activation filter. Sections A–D as specified. Milestones editable only by `rollout_team`. Verification attachments reuse existing `site_photo_url`, `layout_plan_url`, `approval_letter_url`.

## 6. Admin — User Management

Extend the "Create User" role dropdown with `power_team` (label "Power Team") and `rollout_team` (label "Rollout Team"). No visual redesign. Edge function `manage-users` already validates against `validRoles` — add the two new role strings there.

## 7. Sequential Workflow Links

- Link 1 (existing): Planning `approved` → visible in Procurement (existing).
- Link 2: Procurement handover status → Power/Rollout activation via status filter above.
- Link 3: DB trigger `sync_power_to_rollout` (see §1).
- Link 4: DB trigger `recalc_progress`; Admin dashboard reads `progress_percent`.

## Technical notes

- Site status enum values assumed: `pending`, `approved`, `handed_over_to_vendor`, `in_progress`, `completed`. Will verify from migration file before writing.
- Certificate upload uses existing `site-documents` bucket with owner-or-reviewer RLS; add `power_team`/`rollout_team` to reviewer set.
- No changes to Procurement or Admin visual layout beyond the role dropdown options.

## Out of scope

- Full Excel bulk import UI (not currently in Planning).
- Renaming/removal of legacy DB columns.
- Changing Procurement or Admin table designs.

Reply "go" to implement, or tell me which parts to trim.
