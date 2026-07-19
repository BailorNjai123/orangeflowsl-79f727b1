# Chapter Three — Research Methodology

## 3.1 Introduction

This chapter sets out the methodology by which OrangeFlow SL was designed, implemented and evaluated. It documents the research paradigm and design, the data‑collection methods used to characterise the incumbent workflow, the resulting existing‑system analysis and the specific problems that motivate the proposed system. It then states, in enumerated form, the functional and non‑functional requirements against which the implementation is subsequently verified, and presents the system architecture, database design, use‑case, activity, flowchart and entity‑relationship models that jointly specify the artefact. Finally, it documents the software‑development methodology adopted, the technology stack chosen, and the testing strategy applied.

## 3.2 Research Design

The study adopts a **design‑science research** paradigm. Design‑science research is distinguished from purely descriptive or explanatory research by its central deliverable: an artefact — in this case, a software system — whose creation and evaluation constitute the research contribution. Within this paradigm the study is organised into three interlocking activities: **descriptive** analysis of the incumbent manual workflow; **constructive** engineering of the OrangeFlow SL artefact through iterative‑incremental delivery; and **evaluative** verification of the artefact against explicit functional, non‑functional and security requirements.

## 3.3 Research Methodology

The methodological structure of the study proceeds in five sequential stages.

1. **Situational analysis.** The incumbent BTS rollout coordination workflow is characterised, its participants identified and its failure modes enumerated.
2. **Requirements elicitation.** From the situational analysis, functional and non‑functional requirements are drawn out and stated in a form suitable for verification.
3. **Design.** A three‑tier architecture, a relational data model, an RBAC scheme and a set of RLS policies are designed to satisfy the requirements.
4. **Implementation.** The system is implemented in iterative sprints, each sprint delivering a vertically integrated slice of functionality from user interface through middleware to database.
5. **Evaluation.** The completed system is verified against the stated requirements through functional, security, offline and responsive testing, and is compared against the incumbent workflow.

## 3.4 Data Collection Methods

Data to inform the situational analysis and requirements elicitation were gathered through three complementary methods, each chosen for its appropriateness to the class of information sought.

- **Structured observation of the incumbent workflow.** The stages through which a candidate BTS site currently passes were observed and mapped, including the artefacts produced at each stage, the participants involved and the communication channels between them.
- **Document review.** The printed forms, spreadsheet workbooks and template contracts currently used were inspected in order to identify the specific data fields carried through the pipeline, and thereby to inform the schema of the relational data model.
- **Informal semi‑structured interviews.** Prospective users of each of the three intended roles were consulted regarding their pain points with the incumbent workflow and their usability expectations of a replacement. These interviews were conducted informally and their outputs treated as design input rather than as primary research data; consequently no personally identifying information from those interviews is reproduced in this dissertation.

## 3.5 Existing System Analysis

The incumbent BTS rollout coordination workflow at Orange Sierra Leone comprises three functionally distinct roles operating through three uncoupled tool sets:

- The **Planning Team** records candidate sites on printed forms in the field and later transcribes them into spreadsheet workbooks held on individual workstations.
- The **Procurement Team** works from copies of those workbooks emailed by Planning, and maintains a parallel spreadsheet in which land documentation, ownership verification, lease negotiation and vendor contracting are tracked.
- The **Project Administrator** reconstructs the current state of the pipeline by querying each team individually and by inspecting attachments in email and instant‑messaging threads.

There is no single authoritative record of any given site, no chronological audit trail, no computationally enforced role separation, no accommodation for field workers who cannot assume connectivity and no real‑time supervisory view of the pipeline.

## 3.6 Problems Identified

From the existing‑system analysis, five specific problems are identified, corresponding to those already stated in Section 1.2 of Chapter One and reproduced here for reference:

1. **Version divergence.** Multiple diverging copies of every document.
2. **Audit opacity.** No tamper‑evident chronological record of decisions.
3. **Absent role separation.** No computational enforcement of least privilege.
4. **Absent offline usability.** Field capture requires connectivity that is often absent.
5. **Absent supervisory visibility.** Pipeline state must be manually reconstructed.

## 3.7 Proposed System

The proposed system, OrangeFlow SL, is a role‑based, mobile‑first Progressive Web Application that consolidates the BTS rollout workflow into a single, auditable pipeline. Each site becomes a single row in a `sites` table, submitted by an authenticated Planning user, subjected to a nine‑point compliance checklist by an authenticated Procurement user, and approved or rejected — with mandatory reason capture on rejection — by an authenticated Project Administrator. Every state transition writes to a chronological `activity_log`. Mutations captured offline are queued in the browser's IndexedDB and replayed automatically on reconnection. Access to every table and every storage object is enforced at the database layer.

## 3.8 Functional Requirements

The following functional requirements were elicited and are subsequently used in Chapter Five as the basis of verification:

**FR‑01.** The system shall authenticate users via email and password and shall issue a JWT for use in subsequent requests.
**FR‑02.** The system shall assign each user exactly one of the roles: Planning Team, Procurement Team, Project Administrator.
**FR‑03.** The system shall permit an authenticated Planning user to submit a structured site record capturing identification, location, technical and power‑system fields.
**FR‑04.** The system shall permit an authenticated Procurement user to complete a nine‑point compliance checklist for any site, uploading an evidentiary document per completed item.
**FR‑05.** The system shall permit an authenticated Project Administrator to approve or reject a site, requiring a written reason on rejection.
**FR‑06.** The system shall capture, offline, any writable mutation issued while the network is unavailable, and shall replay those mutations, in insertion order, upon reconnection.
**FR‑07.** The system shall deliver in‑application notifications to the recipient of each significant state transition (submission, checklist completion, approval, rejection).
**FR‑08.** The system shall record, in a chronological activity log, every significant state transition, attributed to the acting user.
**FR‑09.** The system shall permit an authenticated Project Administrator to create, update and deactivate user accounts and to assign roles.
**FR‑10.** The system shall deliver every uploaded document exclusively through a short‑lived signed URL issued at the moment of authorised request.
**FR‑11.** The system shall present, to each role, a dashboard summarising the pipeline items pertinent to that role and refreshed at a periodic cadence.

## 3.9 Non‑Functional Requirements

**NFR‑01. Security.** Access to every user‑facing table and every storage object shall be enforced at the database layer by RLS policies bound to roles held in a dedicated `user_roles` table; no user may self‑assign a role.
**NFR‑02. Availability under intermittent connectivity.** The application shall remain fully usable for capture operations when the network is unavailable and shall reconcile automatically on reconnection.
**NFR‑03. Responsiveness.** The application shall render without horizontal overflow at viewport widths of 390, 820 and 1440 CSS pixels and shall be installable as a PWA on modern evergreen browsers.
**NFR‑04. Auditability.** Every state transition shall be preserved indefinitely in the activity log with the identity of the acting user and a wall‑clock timestamp.
**NFR‑05. Performance.** Dashboard refresh shall complete within an operationally reasonable interval; a target cadence of thirty seconds is adopted.
**NFR‑06. Maintainability.** The application shall be organised into small, focused components and modules; the database schema shall evolve through immutable, forward‑only migrations under version control.
**NFR‑07. Confidentiality of documents.** Uploaded documents shall never be served from a publicly readable URL; access shall be granted exclusively through short‑lived signed URLs.
**NFR‑08. Compliance posture.** The system shall observe the OWASP Top Ten [19] with particular attention to access control, cryptographic storage, and injection.

## 3.10 System Architecture

The system is realised as a three‑tier architecture:

- **Presentation tier.** A React 18 single‑page application, compiled by Vite, written in TypeScript and styled with Tailwind CSS and the shadcn/ui component library. Delivered as an installable PWA with a service worker for network mediation and IndexedDB for offline capture.
- **Middleware tier.** JWT‑authenticated PostgREST endpoints exposed by the managed backend, together with privileged Deno Edge Functions for operations requiring elevated authority (notably administrative user management).
- **Data tier.** A PostgreSQL relational database in which every user‑facing table is protected by RLS, complemented by two private object‑storage buckets — `site-documents` and `procurement-documents` — accessed exclusively through signed URLs.

![System Architecture](../system_architecture.svg)

## 3.11 Database Design

Seven principal relations model the domain: `profiles`, `user_roles`, `sites`, `procurement_submissions`, `procurement_feedback`, `notifications` and `activity_log`. Two enumerations — `app_role` and `site_status` — constrain the closed vocabularies of role membership and workflow state. Two security‑definer helper functions, `has_role` and `get_user_role`, expose role queries to RLS policies without triggering recursive evaluation, and a `prevent_role_self_escalation` trigger defends the `user_roles` table against privilege‑escalation attempts. The complete schema is reproduced in Appendix A.

![Database Design](../database_schema.svg)

## 3.12 Use Case Diagram

Three principal actors — Planning Team, Procurement Team, Project Administrator — interact with the system through a bounded set of use cases: submit site, complete checklist, upload document, approve, reject, review dashboard, receive notification, manage users.

![Use Case Diagram](../use_case_diagram.svg)

## 3.13 Activity Diagram

The activity diagram traces the lifecycle of a single site from the moment of its offline or online capture by Planning, through Procurement checklist completion and evidentiary upload, to administrative approval or rejection. Each transition writes an entry to the activity log and dispatches a notification to the downstream recipient.

![Activity Diagram](../activity_diagram.svg)

## 3.14 Flowchart

The system flowchart illustrates the sequence of decisions taken by the application in response to a user action, including the branch on network availability that either issues the mutation to the backend or enqueues it into IndexedDB for later replay.

![System Flowchart](../system_flowchart.svg)

## 3.15 Entity Relationship Diagram

The entity relationship diagram documents the primary‑key and foreign‑key relationships among the seven principal relations. Every child relation carries a cascade‑on‑delete or set‑null foreign key on its parent user account, so that the deletion of a user does not orphan authored records.

![Entity Relationship Diagram](../entity_relationship_diagram.svg)

## 3.16 Software Development Methodology

The system was developed under an **iterative‑incremental** methodology drawn from the agile family. Each iteration delivered a vertically integrated slice of functionality — one user‑facing feature from interface through middleware to database, together with the RLS policies necessary to secure it. Iteration boundaries were marked by verification of the delivered slice against its subset of the functional requirements. This methodology was chosen in preference to a strictly waterfall approach because it exposes integration risk early — most notably the risk of RLS policies being inconsistent between the query patterns of the frontend and the intent of the requirements — and because it accommodates the incremental elicitation of usability requirements that only become visible once a working slice is available for review.

## 3.17 Technologies Used

**Frontend.** React 18, TypeScript 5, Vite 5, Tailwind CSS 3, shadcn/ui, TanStack Query, React Router, `idb-keyval`, `vite-plugin-pwa`.

**Backend.** PostgreSQL 15+ with Row‑Level Security, PostgREST for automatic REST exposure, Deno‑based Edge Functions for privileged operations, private object‑storage buckets with signed URL delivery.

**Tooling.** Git for version control; forward‑only SQL migrations; ESLint and TypeScript's type checker for static analysis; Vitest for unit tests; Playwright, driven from the shell, for end‑to‑end and responsive verification.

The complete list of runtime dependencies is reproduced in `package.json` at the root of the repository, and the migrations that construct the schema are reproduced in Appendix A.

## 3.18 Testing Strategy

Testing was organised into four complementary strands, each addressing a distinct class of correctness concern:

1. **Functional verification.** For each functional requirement, a role‑based end‑to‑end scenario was executed against a live backend, and the resulting database state, activity‑log entry and user‑interface change were observed.
2. **Security verification.** RLS policies were exercised through explicit negative testing: for each protected table, a user in an unauthorised role attempted each of `SELECT`, `INSERT`, `UPDATE` and `DELETE`. The `user_roles` self‑escalation trigger was exercised by attempting, as a non‑administrator, to insert a row granting oneself the administrator role.
3. **Offline verification.** The network was disabled at the browser level; writable operations were exercised; the queued actions were observed to persist in IndexedDB; and the network was subsequently re‑enabled, upon which the queue was observed to drain in insertion order and the corresponding rows to appear in the database.
4. **Responsive verification.** The user interface was verified at three viewport widths — 390, 820 and 1440 CSS pixels — with no horizontal overflow permitted at any width. The PWA install flow was exercised on a modern evergreen browser.

The results of this testing strategy are reported in full in Chapter Five.

## 3.19 Chapter Summary

This chapter set out the design‑science research paradigm within which OrangeFlow SL was developed, the data‑collection methods used to characterise the incumbent workflow, the resulting requirements, the system and database designs, the iterative‑incremental methodology adopted for implementation and the fourfold testing strategy used for evaluation. The implementation itself is documented in the following chapter.
