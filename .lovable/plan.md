

# Fix: Planning Form to Admin View Field Mapping

## Problem

There are field mapping mismatches between the Planning form and what the Admin sees:

1. **"Site ID" label in form maps to `site_name` column** -- but `SiteDetailsView` shows `site_id_code` as "Site ID" and `site_name` as "Site Name". So the admin sees an empty "Site ID" field and the entered value under "Site Name".
2. **`site_id_code` is never set** -- it's a required column (defaults to empty string) but the form never populates it. The admin's site list also displays `site.site_id_code` which shows blank.
3. **`district` and `town` have no form inputs** -- the form only has a single "Location" field mapped to `region`. District and town always show "-" in admin view.
4. **`SiteDetailsView` shows many extra fields** (latitude, longitude, antenna_type, contractor_name, etc.) that the Planning form doesn't collect -- these show "-" which is fine, but clutters the admin view with irrelevant empty rows.

## Fix

### 1. Update Planning Form (`PlanningDashboard.tsx`)
- Rename "Site ID" field to properly save to `site_id_code`
- Add a separate "Site Name" field that saves to `site_name`
- Split "Location" into three fields: Region, District, Town (matching the DB columns and admin display)
- Update the `handleSubmit` data mapping accordingly

### 2. Update `SiteDetailsView` Display
- Add a "Submitted" date row showing `created_at` so the admin can see when it was submitted
- Add a "Submitted By" display (the form stores `submitted_by` but it's not shown)
- Only show fields that have values OR are part of the core submission, to reduce clutter from unused fields like latitude/longitude/antenna_type that the Planning form doesn't collect

### 3. Update Admin Site List Card
- Show `site_id_code` AND `site_name` in the approval cards so both are visible at a glance
- Show submission date on the card

## Files Changed

| File | Change |
|------|--------|
| `src/pages/PlanningDashboard.tsx` | Fix form fields: separate Site ID Code + Site Name, split Location into Region/District/Town, update data mapping |
| `src/components/SiteDetailsView.tsx` | Add created_at display, show submitted_by, reduce clutter from always-empty fields |
| `src/pages/AdminDashboard.tsx` | Update site cards in approvals to show both site_id_code and site_name |

