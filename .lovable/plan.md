

# OrangeFlow SL — Premium BTS Site Approval Platform

## Overview
A production-grade Progressive Web App (PWA) for Orange Sierra Leone to digitize the 3-stage BTS site approval workflow across Planning, Procurement, and Project (Admin) teams. Built on Lovable Cloud (Supabase) for easy migration to standalone Supabase at scale.

---

## Phase 1: Foundation — Brand, Database & Auth
- **Design System**: Orange brand (#f97316), Plus Jakarta Sans font (modern geometric sans-serif), dark mode support, glassmorphism headers, smooth animations (fade-in, slide-up, scale-in, hover lift), consistent rounded corners
- **PWA Setup**: Install prompt banner ("Install OrangeFlow SL") with Accept/Dismiss buttons, service worker for offline support, BTS tower/antenna app icon in orange, manifest configuration
- **Database Schema**: Tables for profiles, user_roles (separate table per security rules), sites (20+ fields), procurement_submissions (9 parameters + file references), procurement_feedback, notifications, activity_log — all with proper RLS policies and foreign keys
- **File Storage**: Supabase Storage buckets for site photos, layout plans, approval letters, and procurement evidence documents (never stored in DB)
- **Authentication**: Email/password auth with role-based access (planning_team, procurement_team, project_team), route protection via AuthGuard, session management
- **Seed Data**: 6 test users across 3 roles + 4 sample BTS sites with varied statuses, pre-loaded via database

## Phase 2: Landing Page & Login
- **Landing Page (/)**: Hero section with orange gradient accents and BTS tower illustration, 3 feature cards (Site Submission, Approval Workflow, Real-time Tracking), animated stats banner (98% faster approvals, 15 days saved, 100% digital tracking, real-time notifications), footer with © Orange Sierra Leone branding
- **Login Page (/login)**: Polished card with email/password form, show/hide password toggle, 3 demo credential quick-fill buttons color-coded by role (🟦 Project Team, 🟩 Planning Team, 🟧 Procurement Team), role-based redirect after login, error handling with toast notifications

## Phase 3: Planning Team Dashboard (/planning)
- **Dashboard Tab**: Welcome banner with gradient, 4 animated stat cards (Total, Pending, Approved, Rejected), recent 5 submissions list with status badges, empty state messaging
- **Submit New Site Tab**: Large multi-section form — Basic Info (11 fields), Technical Details (7 fields with dropdowns), Project & Vendor Details (5 fields with date pickers), File Attachments (3 drag-and-drop upload areas for site photo, layout plan, approval letter stored in Supabase Storage), Notes textarea. Edit mode for rejected/pending sites with pre-filled data, "Update Site" button text
- **My Submissions Tab**: Desktop table → mobile card view of all user's sites, status badges, expandable details, edit button for rejected/pending sites, reviewer notes display

## Phase 4: Admin Dashboard (/admin)
- **Overview Tab**: 4 stat cards (clickable Pending navigates to Approvals), side-by-side panels for Recent Submissions and Recent Activity with relative timestamps ("5m ago", "2h ago")
- **Site Approvals Tab**: Full list of Planning submissions with status filter dropdown, expandable detail modal showing all site specs (Basic Info grid, Technical Details grid, Project Details grid, Notes, attached files), Approve/Reject actions with notes, desktop table → mobile card responsive layout
- **User Management Tab**: Full CRUD — Add/Edit/Delete users with modal forms, role assignment via dropdown, password management (lock icon to change any user's password with confirmation), active/inactive toggle, role badges (Blue=Admin, Green=Planning, Orange=Procurement)
- **Procurement Review Tab**: Stats bar (Total, Pending, Approved), expandable cards showing all 3 color-coded sections (Land Acquisition, Land Lease, Handover) with ✓/✗ indicators, downloadable file links from storage, Approve/Reject with review notes, decision display after review
- **Activity Log Tab**: Chronological timeline with colored circle icons (green=approved, red=rejected, blue=submitted), description text, user name + relative timestamps, vertical connecting lines

## Phase 5: Procurement Dashboard (/procurement)
- **Dashboard Tab**: 4 gradient stat cards (Pending Review, Accepted, Submissions, All Sites), "Sites Awaiting Feedback" section with amber badges, "Recent Submissions" with status badges
- **Site Feedback Tab**: Expandable cards for admin-approved sites showing full technical specs, feedback textarea (required) + Accept/Reject buttons, "Recently Reviewed" section with color-coded left borders
- **Procurement Submissions Tab**:
  - "Sites Awaiting Procurement Action" grid with "Take Action" button per accepted site
  - **The 9-Parameter Form** (key feature): Header card with site info on orange gradient, 3 color-coded sections each with numbered circle and 3 Yes/No toggle items:
    - Section 1 — Land Acquisition (blue): Land Identified, Ownership Verified, Acquisition Approved
    - Section 2 — Land Lease (purple): Lease Negotiation, Lease Signed, Lease Registration
    - Section 3 — Handover to Vendor (green): Road Access, Vendor Contract, Site Handover
    - Yes → green toggle + file upload area; No → red toggle + amber warning
    - Additional notes textarea + "Submit to Project Team" button
  - "My Submissions" history with expandable details showing all 9 parameters, files, and approval status

## Phase 6: Shared Features & Polish
- **Notification System**: Bell icon with unread count badge in all dashboard headers, dropdown panel with notification list (colored icons, 2-line message clamp, timestamps), "Mark all read" button, triggers on: site submitted (→admins), site approved/rejected (→submitter), procurement submitted (→admins)
- **Password Management**: Settings gear icon → modal with account info display + password change form (current + new + confirm, min 6 chars), admin can change any user's password via lock icon in User Management
- **Status Badges**: Consistent color-coded pills — Pending (amber), Approved (green), Rejected (red) — used throughout every dashboard
- **Responsive Design**: Mobile-first — hamburger menu for navigation on all dashboards, table→card view transitions, touch-friendly drag-and-drop file uploads, no distortion/overflow on any screen, sticky headers with backdrop blur
- **PWA Experience**: Install prompt on first visit, offline-capable service worker (with OAuth route excluded from cache), app icon featuring a BTS tower antenna on orange background, splash screen

## Backend Architecture (Lovable Cloud → Supabase-ready)
- **profiles** table linked to auth.users with ON DELETE CASCADE
- **user_roles** table (separate from profiles per security requirements) with `has_role()` security definer function
- **sites** table with 20+ BTS specification columns, review fields, foreign keys to submitter/reviewer
- **procurement_submissions** table with 9 boolean parameters + 9 file reference URLs (pointing to Storage)
- **procurement_feedback** table for accept/reject decisions with notes
- **notifications** table with user_id, type, read status
- **activity_log** table for full audit trail
- **Storage buckets** with RLS policies for site documents and procurement evidence
- **Edge functions** for complex workflow logic (notification creation, status transitions)
- All tables have proper RLS policies using the `has_role()` function pattern — making migration to standalone Supabase seamless

