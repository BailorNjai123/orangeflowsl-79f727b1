# Chapter Three — Research Methodology

## 3.1 Introduction

This chapter presents the systematic methodology adopted for the design, engineering and evaluation of **OrangeFlow SL**, a role‑based, mobile‑first Progressive Web Application (PWA) developed to centralise the Base Transceiver Station (BTS) site rollout workflow. The chapter articulates the research paradigm, data collection strategy, requirements analysis, architectural blueprint, and validation protocol used to transform an unstructured, paper‑driven telecommunications rollout process into an auditable, offline‑capable digital pipeline.

## 3.2 Research Design

The study adopts an **applied, design‑science research** approach fusing descriptive, constructive and evaluative components. Descriptive analysis was used to model the incumbent manual workflow. Constructive research produced the OrangeFlow SL artefact itself. Evaluative research validated the artefact against the elicited functional and non‑functional requirements. The paradigm is appropriate because the primary contribution is an engineered artefact whose value is judged by fitness for the stated operational purpose rather than by falsification of a hypothesis.

## 3.3 Data Collection Methods

Data was gathered through four complementary techniques:

- **Process observation** of the current BTS site rollout lifecycle, documenting each handover and the artefacts produced at each stage.
- **Document review** of internal handover forms, procurement checklists and correspondence, to extract the fields that participants already treat as authoritative.
- **Structured requirements elicitation** with prospective Planning, Procurement and Project Administration users, capturing both functional expectations and non‑functional constraints such as offline operation.
- **Iterative implementation feedback** taken directly from the running system as it was developed, using observed behaviour rather than speculative reasoning to inform subsequent design decisions.

## 3.4 Analysis of the Existing System

The existing workflow relied on printed forms, disparate spreadsheets and informal messaging channels. The consequences observed were:

- Fragmented handover between Planning, Procurement and Project Administration, with no single authoritative record of a site.
- Silent data loss and duplication as documents were forwarded, edited and re‑forwarded.
- Absence of a chronological audit trail that identified the actor, the action and the timestamp for each state change.
- Insecure handling of evidentiary documents, which circulated as unprotected email attachments.
- No technical enforcement of role separation; any participant with access to a shared folder could alter another team's submissions.
- Poor field usability and no offline support, forcing field engineers to re‑enter data on return to the office.
- No real‑time status visibility for supervisors, who had to reconstruct workflow status by asking each participant.

## 3.5 Proposed System (OrangeFlow SL)

OrangeFlow SL is proposed as a mobile‑first, role‑scoped PWA that consolidates site submission, procurement feedback and approval into one auditable pipeline shared by three roles: **Planning Team**, **Procurement Team** and **Project Administrator**. Access is enforced at the database layer through Row‑Level Security, evidentiary documents are held in private storage buckets and delivered via short‑lived signed URLs, and user actions initiated while offline are captured to an IndexedDB queue and replayed idempotently on reconnection.

## 3.6 Functional Requirements

The elicited functional requirements are:

1. Authenticated login for all users.
2. Deterministic role assignment across Planning, Procurement and Project Administrator.
3. Site proposal submission with structured technical, geographic and power data.
4. A nine‑point procurement compliance checklist with document upload.
5. A final approval or rejection stage with reason capture.
6. Offline capture of user actions with queued replay on reconnection.
7. Real‑time in‑app notifications on state transitions.
8. An immutable, chronological activity log.
9. Administrator user management via a secure server‑side function.
10. Signed, time‑limited URLs for private document retrieval.
11. Auto‑refreshing dashboards for supervisory visibility.

## 3.7 Non‑Functional Requirements

- **Security.** Row‑Level Security on every table containing operational data; private storage buckets; privileged operations behind server‑side functions; least‑privilege GRANTs on public tables.
- **Usability.** Mobile‑first layout with no horizontal scrolling on any supported viewport.
- **Availability.** Service‑worker‑enabled PWA with offline capture and automatic replay.
- **Performance.** Background auto‑refresh at a 30‑second cadence on supervisory dashboards.
- **Maintainability.** TypeScript throughout, modular components, a normalised relational schema and migration‑versioned database changes.
- **Auditability.** Chronological activity log covering every workflow state change.
- **Data integrity.** Referential constraints, non‑null validation and idempotent offline replay.

## 3.8 System Architecture

![System Architecture](../public/dissertation/system_architecture.svg)

*Figure 3.1 — Three‑tier system architecture of OrangeFlow SL.*

OrangeFlow SL uses a three‑tier architecture:

- **Presentation tier.** A React 18 and Vite PWA written in TypeScript, styled with Tailwind CSS and shadcn/ui, and delivered with a service worker that enables installability and offline navigation.
- **Middleware tier.** A backend‑as‑a‑service composed of PostgREST endpoints, JWT authentication, Deno Edge Functions for privileged operations and an IndexedDB offline queue on the client.
- **Data tier.** A PostgreSQL database secured by Row‑Level Security, with two private storage buckets — `site-documents` and `procurement-documents` — for evidentiary artefacts.

## 3.9 Database Design

![Database Schema](../public/dissertation/database_schema.svg)

*Figure 3.2 — Normalised relational schema.*

The schema comprises the following operational tables: `profiles`, `user_roles`, `sites`, `procurement_submissions`, `procurement_feedback`, `activity_log`, `notifications` and `deleted_users_archive`. Each is protected by explicit Row‑Level Security policies and by GRANTs scoped to the roles that the policies permit.

## 3.10 Use Case Diagram

![Use Case Diagram](../public/dissertation/use_case_diagram.svg)

*Figure 3.3 — Actor–use case model.*

The diagram captures the three actors and their permitted operations across authentication, submission, review, approval and administration.

## 3.11 Activity Diagram

![Activity Diagram](../public/dissertation/activity_diagram.svg)

*Figure 3.4 — Swimlane activity flow across Planning, Procurement and Project Administration lanes.*

## 3.12 System Flowchart

![System Flowchart](../public/dissertation/system_flowchart.svg)

*Figure 3.5 — Runtime online/offline flow: session check → role dashboard → action → online/offline branch → direct API mutation or IndexedDB queue replay.*

## 3.13 Entity Relationship Diagram

![Entity Relationship Diagram](../public/dissertation/entity_relationship_diagram.svg)

*Figure 3.6 — Crow's‑foot Entity Relationship Diagram.*

## 3.14 Software Development Methodology

An iterative, agile‑inspired workflow was employed. Each increment was integrated continuously into the managed backend, permitting rapid validation of migrations, RLS policies and user‑interface changes. Successive increments narrowed the gap between the current implementation and the elicited requirements until each requirement was demonstrably satisfied.

## 3.15 Technologies Used

- **Frontend.** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, PWA service worker, `idb-keyval`.
- **Backend.** PostgreSQL, PostgREST, JWT authentication, Deno Edge Functions, private object storage.

## 3.16 Testing Strategy

The system was verified using:

- Static analysis with TypeScript and ESLint.
- Vitest unit tests for isolated logic.
- Manual role‑based end‑to‑end scenarios covering each actor's permitted and forbidden operations.
- Security verification via migration‑level policy enforcement and negative testing of forbidden operations.
- Offline and PWA testing, including queued action replay after network restoration.
- Responsive testing on multiple viewport sizes to enforce the no‑horizontal‑scroll constraint.

## 3.17 Chapter Summary

This chapter documented the methodology, requirements and design that underpin OrangeFlow SL. The next chapter transitions from design to concrete implementation.
