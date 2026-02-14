

# Major Refactor: Full Parameter Visibility, Data Flow & PWA Fix

## What This Plan Covers

This refactor ensures that **all planning team parameters** are fully visible when the Admin and Procurement teams review sites, that **all procurement form parameters** flow correctly to the Admin team for final approval, and that the **PWA install prompt** works properly.

---

## 1. Show ALL Planning Parameters in Admin Site Approvals & Procurement Site Feedback

**Problem**: Currently, the Admin "Site Approvals" review dialog only shows 6 fields (Site ID, Location, Tower Type, Height, Phase, Vendor). The Procurement "Site Feedback" expanded view also only shows 4 fields. The planning form captures 20+ fields -- all of them should be visible.

**Fix**: Expand the detail views in both dashboards to show every field from the planning submission, organized into the same sections as the submission form:

- **Basic Information**: Site ID, Location, Dimensions, Tower Height, Foundation Depth, Elevation, Distance from Nearest BTS
- **Technical Details**: Tower Type, Tower Material, Transmission Type, Power Backup Type, Battery Bank Type, Number of Battery Banks, Earthing Resistance
- **Project & Vendor Details**: Vendor Assigned, Current Phase, Planned Start Date, Expected Completion Date, Last Inspection Date
- **Attachments**: Site Photo, Layout Plan, Approval Letter (as downloadable signed-URL links)
- **Notes**: Any observations from the planning team

**Files changed**:
- `src/pages/AdminDashboard.tsx` -- rewrite the `selectedSite` review dialog (lines 271-308) to show all fields in organized sections
- `src/pages/ProcurementDashboard.tsx` -- rewrite the feedback expanded view (lines 224-231) to show all planning fields

---

## 2. Show ALL Procurement Parameters on Procurement Dashboard & Admin Review

**Problem**: The procurement "My Submissions" section shows the 9 boolean indicators as tiny badges but does not show the full detail (file links, notes). The Admin "Procurement Review" dialog shows parameters but not the file attachments or section groupings.

**Fix**:
- On the **Procurement Dashboard "My Submissions"**, show expandable cards with the 3 color-coded sections (Land Acquisition/blue, Land Lease/purple, Handover/green), each parameter's Yes/No status, and clickable file links
- On the **Admin Dashboard "Procurement Review"** dialog, show the same 3 color-coded sections with Yes/No status, file download links, submission notes, and the linked site's planning details -- then Approve/Reject

**Files changed**:
- `src/pages/ProcurementDashboard.tsx` -- enhance "My Submissions" cards to show grouped parameters with file links
- `src/pages/AdminDashboard.tsx` -- enhance the procurement review dialog (lines 484-514) to show color-coded sections with file links, plus the original planning site details

---

## 3. Fix the PWA Install Prompt

**Problem**: The `beforeinstallprompt` event only fires on Chromium-based browsers and requires the app to be served over HTTPS from the published URL. In the Lovable preview, it does not fire, so the install prompt never appears.

**Fix**:
- Keep the existing `InstallPrompt.tsx` component (it is correctly implemented)
- Add a **fallback manual install banner** for browsers that don't support `beforeinstallprompt` (especially Safari/iOS). This will show a brief instruction: "Tap the Share button, then 'Add to Home Screen'" with a dismiss option
- Ensure the manifest and service worker config remain correct
- Use the existing `Radio` icon (the antenna/tower icon from the navbar) as the PWA icon in the install prompt -- this is already in place

**Files changed**:
- `src/components/InstallPrompt.tsx` -- add iOS/Safari fallback detection and instruction banner

---

## 4. Fix React `forwardRef` Console Warnings

**Problem**: `StatCard` and `StatusBadge` are function components that receive refs from parent components (e.g., motion.div wrappers, Radix slots) but don't use `forwardRef`, causing console warnings.

**Fix**: Wrap both components with `React.forwardRef`.

**Files changed**:
- `src/components/StatCard.tsx` -- wrap with `forwardRef`
- `src/components/StatusBadge.tsx` -- wrap with `forwardRef`

---

## 5. Create a Reusable Site Details Component

To avoid duplicating the full planning parameters display across Admin and Procurement dashboards, create a shared component.

**New file**: `src/components/SiteDetailsView.tsx`
- Accepts a site object and renders all fields in organized, labeled sections
- Handles signed URL generation for file attachments
- Used by both AdminDashboard (site approval dialog) and ProcurementDashboard (feedback expanded view)

**New file**: `src/components/ProcSubmissionDetails.tsx`
- Accepts a procurement submission object and renders the 3 color-coded sections with Yes/No indicators and file links
- Used by both AdminDashboard (procurement review) and ProcurementDashboard (my submissions)

---

## Summary of All File Changes

| File | Action |
|------|--------|
| `src/components/SiteDetailsView.tsx` | **Create** -- reusable full site details display |
| `src/components/ProcSubmissionDetails.tsx` | **Create** -- reusable procurement parameters display |
| `src/pages/AdminDashboard.tsx` | **Edit** -- use SiteDetailsView in approval dialog, use ProcSubmissionDetails in procurement review dialog |
| `src/pages/ProcurementDashboard.tsx` | **Edit** -- use SiteDetailsView in feedback expanded view, use ProcSubmissionDetails in "My Submissions" |
| `src/components/InstallPrompt.tsx` | **Edit** -- add iOS/Safari fallback install instructions |
| `src/components/StatCard.tsx` | **Edit** -- wrap with forwardRef |
| `src/components/StatusBadge.tsx` | **Edit** -- wrap with forwardRef |

**No database changes required** -- all the data already exists in the `sites` and `procurement_submissions` tables. This is purely a frontend display refactor.

