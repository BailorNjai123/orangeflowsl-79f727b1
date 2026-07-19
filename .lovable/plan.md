## Goal
Produce a complete BSc (Electrical & Electronics Engineering) dissertation for the **OrangeFlow SL** project — a role-based, mobile-first PWA that digitises the Base Transceiver Station (BTS) site rollout workflow for Orange SL. Everything saved to `/dissertation/` in the repo, chapter-by-chapter for staged review, plus one consolidated file.

## Grounding (no invented facts)
All content will be drawn strictly from what actually exists in this repo:
- **Stack:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui, PWA (service worker + `idb-keyval` offline queue), TanStack Query.
- **Backend (Lovable Cloud / Supabase):** PostgreSQL with RLS, JWT auth, private storage buckets `site-documents` and `procurement-documents`, Deno Edge Functions (`manage-users`, `seed-users`).
- **Roles:** Planning Team, Procurement Team, Project Team (Admin).
- **Domain workflow:** Site submission → 9-point procurement checklist with document upload → approval/rejection → activity log + notifications.
- **Security posture:** RLS on all public tables, `has_role` / `get_user_role` functions, `prevent_role_self_escalation` trigger, owner-or-team scoped storage policies, private buckets with 1-hr signed URLs.
- **Existing diagrams:** the SVGs already in `/public/dissertation/` (architecture, ERD, use-case, activity, flowchart, DB schema, dashboard mockup) will be referenced, not regenerated.
- Reference PDFs the user uploaded will inform *style and structure only*; no verbatim copying.

The friend's prompt is about a QR attendance system — that project domain is discarded. Only the dissertation **structure** is reused and adapted to OrangeFlow SL, BSc EEE framing (telecom / BTS rollout angle).

## Deliverables in `/dissertation/`
Each chapter is a separate Markdown file so you can review one at a time. A final combined file stitches them all.

1. `abstract.md` — 150–300 word formal academic abstract.
2. `00_front_matter.md` — Title page, Declaration, Certification, Dedication, Acknowledgements, Abstract, Table of Contents.
3. `chapter_01_introduction.md` — Background, Problem Statement, Aim & Objectives, Research Questions, Significance, Scope & Limitations.
4. `chapter_02_literature_review.md` — BTS rollout workflows, digital transformation in telecom operations, PWA & offline-first paradigms, RBAC & RLS in web systems, review of adjacent systems, research gap.
5. `chapter_03_methodology.md` — Refactored from the existing `CHAPTER_THREE_METHODOLOGY.md` + `src/components/dissertation/ChapterThree.tsx`; re-embeds the existing SVGs.
6. `chapter_04_system_implementation.md` — System overview, feature-by-feature implementation (auth, planning form, procurement checklist, admin pipeline, offline sync, notifications, activity log), UI description, high-level code logic, challenges & solutions. Aligned with existing `ChapterFour.tsx` content.
7. `chapter_05_results_and_discussion.md` — Functional test matrix, RLS/security verification, offline replay behaviour, responsive/mobile verification, comparison with the prior manual workflow.
8. `chapter_06_conclusion_and_recommendations.md` — Summary, conclusion, future work (native mobile shell, richer analytics, integration with GIS/NetOps tooling, multi-tenant expansion).
9. `references.md` — Formal reference list (IEEE style) for cited works, including the uploaded PDFs where relevant.
10. `full_dissertation.md` — Single consolidated file concatenating 00 → 06 + references, with a single continuous Table of Contents.

## Review workflow
After the plan is approved, chapters will be created in this order, and I will pause between each so you can review:
1. Front matter + Abstract
2. Chapter 1
3. Chapter 2
4. Chapter 3
5. Chapter 4
6. Chapter 5
7. Chapter 6 + References
8. `full_dissertation.md` (concatenation only — no new prose)

## What will NOT be done
- No changes to `/src` application code, database schema, or SVG diagrams.
- No fabricated features, tables, screenshots, quantitative results, or citations.
- No mention of the build platform or AI tooling in the dissertation text.
- GitHub push happens automatically via the existing Git sync — no manual git commands.

## Open question (optional — I can proceed with sensible defaults)
Do you want me to also generate a printable PDF export of `full_dissertation.md`, or is Markdown in `/dissertation/` sufficient for now?
