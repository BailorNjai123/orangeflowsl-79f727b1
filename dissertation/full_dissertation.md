# OrangeFlow SL

## Design and Implementation of a Role‑Based, Offline‑Capable Progressive Web Application for the Orchestration of Base Transceiver Station (BTS) Site Rollout Workflows

---

**A Dissertation Submitted to the Department of Electrical and Electronic Engineering, Fourah Bay College, University of Sierra Leone, in Partial Fulfilment of the Requirements for the Award of the Degree of Bachelor of Engineering (Honours) in Electrical and Electronic Engineering**

By

**[Author Full Name]**
Registration Number: **[Registration Number]**

Supervisor: **[Supervisor's Name and Title]**

**[Month, Year]**

---

## Declaration

I hereby declare that this dissertation, titled *"Design and Implementation of a Role‑Based, Offline‑Capable Progressive Web Application for the Orchestration of Base Transceiver Station (BTS) Site Rollout Workflows"*, is the result of my own original work carried out under the supervision of **[Supervisor's Name]** in the Department of Electrical and Electronic Engineering, Fourah Bay College, University of Sierra Leone. All sources of information consulted have been duly acknowledged by means of references. This work has not been submitted, either in whole or in part, for any other degree or professional qualification at this or any other institution.

Signed: ______________________________     Date: __________________

**[Author Full Name]**

---

## Certification

This is to certify that this dissertation was carried out by **[Author Full Name]** of the Department of Electrical and Electronic Engineering, Fourah Bay College, University of Sierra Leone, under my supervision, and has been approved for submission in partial fulfilment of the requirements for the award of the degree of Bachelor of Engineering (Honours) in Electrical and Electronic Engineering.

Signed: ______________________________     Date: __________________

**[Supervisor's Name and Title]**
Project Supervisor

Signed: ______________________________     Date: __________________

**[Head of Department]**
Head, Department of Electrical and Electronic Engineering

Signed: ______________________________     Date: __________________

**External Examiner**

---

## Dedication

This dissertation is dedicated to my family, whose unwavering support and sacrifice made this journey possible, and to every field engineer whose daily effort keeps Sierra Leone connected.

---

## Acknowledgements

I gratefully acknowledge my supervisor, **[Supervisor's Name]**, for the guidance, patience and academic rigour that shaped this work. I thank the lecturers and technical staff of the Department of Electrical and Electronic Engineering, Fourah Bay College, for the foundation on which this project was built. I extend appreciation to the operational teams whose insight into the BTS rollout workflow informed the requirements captured in this study, and to my classmates, friends and family for their steady encouragement throughout the project.

---

## Abstract

The rollout of Base Transceiver Station (BTS) sites in Sierra Leone has historically been coordinated through printed forms, disparate spreadsheets and informal messaging channels. This fragmented workflow produces silent data loss, weak audit trails, poor field usability and no real‑time visibility for supervisors — deficiencies that directly delay network expansion and inflate operational cost. This dissertation presents the design, implementation and evaluation of **OrangeFlow SL**, a role‑based, mobile‑first Progressive Web Application (PWA) that consolidates the BTS site rollout lifecycle into a single auditable digital pipeline.

The system was engineered using an applied, design‑science methodology combining descriptive process modelling, constructive software engineering and evaluative testing. A three‑tier architecture was adopted: a React 18, Vite and TypeScript client tier delivered as an installable PWA with offline capture through an IndexedDB action queue; a middleware tier of JWT‑authenticated PostgREST endpoints and privileged Deno Edge Functions; and a data tier built on a PostgreSQL database secured by Row‑Level Security and two private object‑storage buckets. Three domain roles — Planning Team, Procurement Team and Project Administrator — are enforced through a dedicated `user_roles` table and security‑definer helpers that prevent privilege escalation.

Verification through role‑based end‑to‑end scenarios, migration‑level security audits and responsive testing demonstrated that OrangeFlow SL enforces least‑privilege access, preserves data integrity under intermittent connectivity, and materially improves auditability, throughput and supervisory oversight relative to the incumbent manual process.

---

## Table of Contents

- Declaration
- Certification
- Dedication
- Acknowledgements
- Abstract
- List of Figures
- List of Tables
- List of Abbreviations

**Chapter One — Introduction**
1.1 Background of the Study
1.2 Statement of the Problem
1.3 Aim and Objectives
1.4 Research Questions
1.5 Significance of the Study
1.6 Scope and Limitations
1.7 Organisation of the Dissertation

**Chapter Two — Literature Review**
2.1 Introduction
2.2 Overview of Telecommunications Site Rollout Workflows
2.3 Traditional Versus Digital Coordination Systems
2.4 Progressive Web Applications and Offline‑First Design
2.5 Role‑Based Access Control and Row‑Level Security
2.6 Secure Object Storage and Signed URL Delivery
2.7 Review of Existing and Adjacent Systems
2.8 Research Gap
2.9 Chapter Summary

**Chapter Three — Research Methodology**
3.1 Introduction
3.2 Research Design
3.3 Data Collection Methods
3.4 Analysis of the Existing System
3.5 Proposed System (OrangeFlow SL)
3.6 Functional Requirements
3.7 Non‑Functional Requirements
3.8 System Architecture
3.9 Database Design
3.10 Use Case Diagram
3.11 Activity Diagram
3.12 System Flowchart
3.13 Entity Relationship Diagram
3.14 Software Development Methodology
3.15 Technologies Used
3.16 Testing Strategy
3.17 Chapter Summary

**Chapter Four — System Implementation**
4.1 Introduction
4.2 System Overview
4.3 Authentication and Session Management
4.4 Role Assignment and Access Control
4.5 Planning Module — Site Submission
4.6 Procurement Module — Nine‑Point Checklist
4.7 Administrative Pipeline Control
4.8 Notifications and Activity Log
4.9 Offline Capture and Synchronisation
4.10 User Interface and Responsive Design
4.11 Administrative User Management via Edge Function
4.12 Challenges Encountered and Solutions Adopted
4.13 Chapter Summary

**Chapter Five — Results and Discussion**
5.1 Introduction
5.2 Functional Verification
5.3 Security Verification
5.4 Offline and Synchronisation Behaviour
5.5 Responsive and Cross‑Device Behaviour
5.6 Comparison with the Prior Manual Workflow
5.7 Discussion
5.8 Chapter Summary

**Chapter Six — Conclusion and Recommendations**
6.1 Summary of the Study
6.2 Conclusion
6.3 Contribution to Knowledge
6.4 Recommendations for Future Work

**References**

---

# Chapter One — Introduction

## 1.1 Background of the Study

Mobile telecommunications infrastructure in Sierra Leone, and across much of West Africa, depends on the continual planning, procurement and deployment of Base Transceiver Station (BTS) sites. Each new site progresses through a sequence of clearly separable stages: identification and technical proposal by a planning team, procurement and compliance verification of materials and civil works, and final approval or rejection by a project administration function. In practice, however, this pipeline has for many years been coordinated using printed proposal forms, ad hoc spreadsheets, private messaging groups and manually forwarded electronic mail attachments. Documents move faster than the systems intended to track them, and the record of *what was decided, by whom, and when* is reconstructed after the fact rather than captured at source.

The last decade has produced two technological developments that make this state of affairs unnecessary. The first is the maturation of the Progressive Web Application (PWA) delivery model, in which a browser‑based application installs to the device home screen, operates offline through a service worker and IndexedDB, and updates automatically without traversing a mobile application store. The second is the emergence of managed backend platforms that expose an authenticated PostgreSQL database, object storage and server‑side functions through a single JavaScript client. Together these enable a small engineering effort to deliver an installable, mobile‑first, security‑hardened line‑of‑business system that would previously have required a dedicated infrastructure team.

**OrangeFlow SL** is the engineering artefact produced by this study. It applies those two developments to the specific problem of BTS site rollout coordination, translating a fragmented paper workflow into a single, role‑scoped, auditable digital pipeline.

## 1.2 Statement of the Problem

The prevailing manual coordination workflow for BTS site rollout exhibits four persistent failure modes:

1. **Fragmented handover.** Site data captured by the planning team is transferred to procurement, and thereafter to administration, through documents whose format, completeness and location vary between submissions. There is no canonical record of a site.
2. **Absence of an audit trail.** When a submission is approved, rejected, edited or lost, no chronological, tamper‑evident record identifies the actor, the action and the timestamp. Accountability disputes cannot be resolved from evidence.
3. **No enforced role separation.** Any participant with access to a shared folder can, in principle, alter or delete another team's submissions. There is no technical mechanism enforcing least‑privilege access.
4. **No field usability or offline support.** Field engineers frequently operate at candidate sites with intermittent or absent cellular data. Existing tools assume continuous connectivity and either fail silently or require the user to re‑enter data on return to the office.

Taken together, these deficiencies delay network rollout, corrode trust between operational teams and expose the organisation to compliance and security risk. A purpose‑built system is required.

## 1.3 Aim and Objectives

### 1.3.1 Aim

The aim of this study is to **design, implement and evaluate a role‑based, offline‑capable Progressive Web Application that consolidates the BTS site rollout workflow into a single auditable digital pipeline enforcing least‑privilege access, structured data capture and reliable operation over intermittent connectivity.**

### 1.3.2 Specific Objectives

To realise the stated aim, the study pursues the following specific objectives:

1. To analyse the existing manual BTS site rollout workflow and derive a set of functional and non‑functional requirements grounded in real operational practice.
2. To design a three‑tier system architecture separating presentation, application and data concerns, and to model the underlying data schema, entity relationships and use cases.
3. To implement the resulting design as an installable mobile‑first PWA backed by an authenticated PostgreSQL database secured by Row‑Level Security (RLS) and privileged server‑side functions.
4. To implement domain features covering authentication, role assignment, structured site submission, a nine‑point procurement compliance checklist with document upload, an approval and rejection workflow, notifications and a chronological activity log.
5. To engineer an offline capture and synchronisation mechanism that queues user actions locally when the network is unavailable and replays them idempotently on reconnection.
6. To verify the completed system against the elicited requirements through role‑based end‑to‑end scenarios, security verification and responsive testing on multiple viewport sizes.

## 1.4 Research Questions

The study is guided by the following research questions:

- **RQ1.** What structural and operational deficiencies characterise the incumbent manual BTS site rollout workflow, and which of these are amenable to correction by a software system?
- **RQ2.** What architecture, data model and security posture best support a role‑scoped, offline‑capable digital pipeline for the identified workflow?
- **RQ3.** How can least‑privilege access — specifically the separation of Planning, Procurement and Project Administration duties — be enforced at the database layer rather than relying solely on client‑side checks?
- **RQ4.** How can user actions initiated during periods of network unavailability be preserved and applied to the authoritative data store without loss, duplication or corruption?
- **RQ5.** To what extent does the implemented system satisfy the elicited functional and non‑functional requirements when verified through structured role‑based scenarios?

## 1.5 Significance of the Study

The study is significant on three levels:

- **Operational significance.** For a mobile network operator working in a market where infrastructure rollout is a direct determinant of competitiveness, replacing a manual pipeline with an auditable digital one shortens cycle time, reduces rework and provides supervisory visibility that was previously unattainable.
- **Engineering significance.** The system demonstrates that a small, well‑scoped engineering effort — a browser‑based PWA on top of a managed PostgreSQL backend — can deliver a security‑hardened, offline‑capable line‑of‑business tool without provisioning bespoke infrastructure, and can do so in a manner appropriate to the connectivity profile of a Sierra Leonean field environment.
- **Academic significance.** The study contributes a documented case of applying design‑science principles, Row‑Level Security and offline‑first PWA techniques to a domain — telecommunications site rollout — that is under‑represented in the West African software engineering literature.

## 1.6 Scope and Limitations

### 1.6.1 Scope

The scope of the work is bounded to:

- The three internal roles of Planning Team, Procurement Team and Project Administrator.
- The site rollout lifecycle from initial planning submission through procurement compliance verification to final administrative approval or rejection.
- Web delivery via a Progressive Web Application installable on desktop and modern mobile browsers.
- Data persistence in a managed PostgreSQL instance with private object storage for uploaded documents.

### 1.6.2 Limitations

The following are outside the scope of this study and are therefore not addressed by the implementation:

- Integration with external Network Operations Centre (NOC), Geographic Information System (GIS) or Enterprise Resource Planning (ERP) systems.
- Automated financial reconciliation of procurement expenditure.
- Native iOS or Android application packaging beyond what the PWA install prompt already provides.
- Radio‑frequency planning, drive‑test data ingestion and any form of RF analytics.
- Field measurement instrumentation, IoT sensor integration and hardware provisioning.

These limitations are declared here to bound the evaluation and are revisited in Chapter Six as recommendations for future work.

## 1.7 Organisation of the Dissertation

The remainder of this dissertation is organised as follows. **Chapter Two** reviews relevant literature covering telecommunications site rollout coordination, PWA and offline‑first architectures, and role‑based access control with Row‑Level Security, culminating in the identification of the research gap. **Chapter Three** presents the research methodology, requirements, system architecture, database design and testing strategy, supported by the accompanying diagrams. **Chapter Four** documents the concrete implementation of each module of the system. **Chapter Five** presents the results of functional, security, offline and responsive verification, and discusses their implications relative to the prior manual workflow. **Chapter Six** concludes the dissertation, summarises the contribution and articulates recommendations for future work.

---

# Chapter Two — Literature Review

## 2.1 Introduction

This chapter reviews the body of knowledge relevant to the design of OrangeFlow SL. It surveys the coordination of telecommunications site rollout, the transition from paper‑based to digital workflow systems, the technical foundations of Progressive Web Applications and offline‑first design, role‑based access control enforced at the database layer through Row‑Level Security, and the secure delivery of private documents via signed URLs. Existing and adjacent systems are examined, and the chapter concludes by identifying the research gap that motivates the present work.

## 2.2 Overview of Telecommunications Site Rollout Workflows

The deployment of a Base Transceiver Station traverses a well‑defined operational lifecycle: candidate site identification, technical and geographic assessment, procurement of civil works and equipment, installation, commissioning and hand‑over to operations. Each stage produces artefacts — coordinates, technical specifications, procurement dockets, compliance evidence — that must be preserved and transmitted downstream. The academic and industry literature on telecommunications rollout consistently identifies coordination overhead, not engineering complexity, as the dominant source of delay in emerging markets. Systems that reduce coordination friction therefore have disproportionate operational value.

## 2.3 Traditional Versus Digital Coordination Systems

Traditional coordination in Sierra Leonean telecommunications operations, as in many peer markets, depends on printed forms, spreadsheets held on individual workstations, and communication over consumer messaging platforms. This approach has three well‑documented weaknesses. First, the authoritative version of any document is ambiguous — copies proliferate and diverge. Second, no chronological, tamper‑evident record of decisions is produced, so accountability disputes cannot be resolved from evidence. Third, the workflow is invisible to supervisors in real time; status must be reconstructed by asking each participant.

Digital coordination systems address these weaknesses by centralising the authoritative record in a single database, associating every state change with an authenticated actor and timestamp, and exposing status through dashboards. The literature on enterprise workflow systems establishes that the marginal benefit of digitisation is greatest precisely in workflows characterised by handover between distinct roles — the shape of the BTS rollout pipeline.

## 2.4 Progressive Web Applications and Offline‑First Design

A Progressive Web Application is a web application that satisfies a set of criteria defined jointly by browser vendors, including installability, service‑worker‑mediated background execution, and responsive design. Once installed, a PWA behaves substantially like a native application: it appears in the device application launcher, occupies its own window, and continues to function when the network is unavailable.

Offline‑first design generalises this capability. Rather than treating loss of connectivity as an error state, the offline‑first paradigm treats connectivity as intermittent by default. User actions are captured to a local, transactional store — typically IndexedDB — and reconciled with the authoritative server when connectivity is restored. This paradigm is directly relevant to field work at BTS candidate sites, where cellular data is often the very service being installed and cannot be assumed.

Two libraries and one primitive are central to a practical offline‑first implementation. The service worker intercepts network requests and serves cached responses when the network is unreachable. IndexedDB, accessed through a thin wrapper such as `idb-keyval`, provides an asynchronous, transactional key‑value store on the client. A synchronisation routine, invoked when the browser reports the network as online, iterates the queued actions in insertion order and applies each one to the authoritative store, deleting it from the queue on success.

## 2.5 Role‑Based Access Control and Row‑Level Security

Role‑based access control (RBAC) is the standard mechanism for expressing the principle of least privilege in enterprise systems. Users are assigned roles, and permissions are attached to roles rather than to individual users. The correctness of an RBAC implementation depends on two properties: that role membership cannot be self‑assigned, and that the enforcement point cannot be bypassed.

Enforcement at the application layer — checking the user's role in the frontend or in an application server before issuing a database query — is a necessary but insufficient condition. It fails whenever an attacker interacts directly with the database, whether by stealing an API key or by exploiting a bug in the application code. Row‑Level Security (RLS), a feature of the PostgreSQL database, moves enforcement into the database itself: a policy attached to a table specifies, per row and per operation, the predicate under which the row may be seen or modified. A query that would violate the policy returns no rows or an error, regardless of the code path that issued it.

RLS is particularly effective when combined with a `SECURITY DEFINER` helper function that evaluates the caller's role while bypassing recursive policy checks. This is the pattern adopted throughout OrangeFlow SL and is discussed in detail in Chapter Four.

## 2.6 Secure Object Storage and Signed URL Delivery

Uploaded documents — site photographs, procurement evidence, permits — must be stored outside the relational database for efficiency and delivered to authorised users without becoming publicly accessible. The prevailing pattern is a private object‑storage bucket coupled with **signed URL** delivery: the server produces a short‑lived, cryptographically signed URL that grants read access to a specific object for a bounded period, typically minutes to hours. Users receive the URL, retrieve the object directly from the storage service, and the URL expires. This pattern avoids proxying large files through the application server and enforces access checks at the point of URL issuance.

## 2.7 Review of Existing and Adjacent Systems

Commercial workflow platforms such as generic business‑process management suites and off‑the‑shelf ticketing systems can, in principle, be configured to model a BTS rollout pipeline. In practice, however, three obstacles have limited their adoption in the Sierra Leonean context: licence cost, absence of an offline mode suited to field work, and the difficulty of aligning a generic form‑builder with the specific data captured for a BTS site. Custom internal tools built on spreadsheets or on shared network drives address the alignment problem but reproduce the fragmentation problem described in Section 2.3.

Academic prototypes of role‑scoped workflow systems for the telecommunications and utilities sectors exist in the literature, but they typically presuppose reliable connectivity and do not enforce access control at the database layer. The combination of an installable PWA, an IndexedDB action queue, PostgreSQL RLS and privileged Edge Functions — the combination adopted by OrangeFlow SL — is not represented as a coherent case study in the reviewed literature.

## 2.8 Research Gap

The literature therefore reveals a gap at the intersection of four concerns:

1. The specific coordination workflow of BTS site rollout in an emerging‑market operating environment.
2. Offline‑first delivery suited to intermittent field connectivity.
3. Least‑privilege access enforced at the database layer through Row‑Level Security rather than only in application code.
4. Private‑bucket object storage with signed URL delivery for evidentiary documents.

No single reviewed system addresses all four concerns simultaneously in a documented, evaluated implementation. OrangeFlow SL is positioned to close this gap.

## 2.9 Chapter Summary

This chapter surveyed the literature relevant to the design of OrangeFlow SL. It established that the operational value of digitising a rollout workflow is greatest in pipelines characterised by handover between distinct roles; that Progressive Web Applications and offline‑first design provide a practical delivery model for field work under intermittent connectivity; that Row‑Level Security is the appropriate enforcement point for RBAC in a database‑backed system; and that private storage buckets with signed URLs constitute the accepted pattern for secure document delivery. The synthesis of these strands identifies the research gap that the remainder of this dissertation addresses.

---

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

---

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

---

# Chapter Five — Results and Discussion

## 5.1 Introduction

This chapter reports the outcome of verifying the completed OrangeFlow SL implementation against the functional and non‑functional requirements set out in Chapter Three. The verification comprises four strands: functional verification through role‑based end‑to‑end scenarios, security verification through migration‑level policy enforcement and negative testing, offline and synchronisation behaviour under simulated disconnection, and responsive verification across mobile, tablet and desktop viewports. The chapter concludes with a comparison against the prior manual workflow and a discussion of the wider implications of the results.

## 5.2 Functional Verification

Each functional requirement enumerated in Section 3.6 was exercised through a role‑based scenario. In each scenario a user assigned to the role in question executed the expected operation and the resulting database state, activity‑log entry and user interface change were observed.

| Requirement | Verification Scenario | Outcome |
|---|---|---|
| Authenticated login | Valid and invalid credentials issued at the login route. | Valid credentials issue a JWT and route to the role dashboard; invalid credentials remain on the login route with a clear error message. |
| Role assignment | New user provisioned via the administrative interface with each of the three roles in turn. | Route guards direct the user to the corresponding dashboard on subsequent login. |
| Site submission | Planning user completes and submits a site proposal. | Row appears in `sites`, activity log records the submission, notification delivered to Procurement. |
| Nine‑point checklist | Procurement user completes the checklist and uploads evidentiary documents. | Rows appear in `procurement_submissions`; files land in the `procurement-documents` bucket under the user's path prefix; notification delivered to Project Administrator. |
| Approval / rejection | Project Administrator approves one submission and rejects another with a reason. | Site state updated; rejection reason persisted; notifications delivered upstream. |
| Offline capture | Network disabled; planning submission attempted. | Action queued in IndexedDB; user informed of pending sync; on reconnection the action is replayed and the row appears in `sites`. |
| Notifications | State transitions triggered as above. | Notifications appear on the recipient's dashboard in real time. |
| Activity log | Every scenario above executed. | Chronological entries appear in `activity_log`, each attributed to the correct actor and timestamp. |
| Administrative user management | Administrator creates, updates and deletes user accounts. | Operations succeed through the `manage-users` Edge Function; non‑administrators are refused. |
| Signed URL retrieval | Authorised and unauthorised users request signed URLs for the same object. | Authorised users receive a short‑lived URL that resolves; unauthorised requests are refused. |
| Dashboard refresh | Supervisory dashboards observed over time. | Data refreshes at the configured 30‑second cadence without manual reload. |

Every functional requirement was satisfied in this verification pass.

## 5.3 Security Verification

Security was verified in two complementary ways. First, Row‑Level Security policies were exercised through **negative testing**: for each protected table, an authenticated user in an unauthorised role attempted each of `SELECT`, `INSERT`, `UPDATE` and `DELETE`. In every case the database refused the operation, either by returning no rows or by raising an error, without any change to the underlying data. Second, the enforced restrictions were confirmed at the migration level, so that they persist independently of any particular version of the client code:

- The `sites` table's `DELETE` policy admits only the Project Administrator role. A Planning user's attempt to issue a delete — whether through the interface or by direct API call — is refused.
- The `user_roles` table's insert and update policies, combined with the `prevent_role_self_escalation` trigger, refuse any attempt by a non‑administrator to grant themselves a role.
- The `activity_log` table's `SELECT` policy admits only administrators, so ordinary users cannot enumerate the audit trail.
- The `site-documents` and `procurement-documents` buckets are private; read and write operations require both a matching path prefix and the appropriate workflow role.
- The `has_role`, `get_user_role` and `handle_new_user` functions have `EXECUTE` revoked from `anon` and `PUBLIC`, restricting their invocation to authenticated code paths.

Additionally, console error output was gated behind development builds, and the seed function was refactored to generate strong random passwords rather than embed them in source. Leaked‑password protection was enabled at the authentication layer.

## 5.4 Offline and Synchronisation Behaviour

Offline behaviour was verified by disabling the network at the browser level and exercising each writable interface. In every case the interface remained responsive, the queued action was persisted to IndexedDB under the `offline_queue_` prefix, and a subsequent re‑enabling of the network caused the synchronisation hook to iterate the queue in insertion order and apply each action to the authoritative store. Successfully applied entries were removed from the queue and the corresponding rows appeared in the database; entries that failed were preserved for a subsequent retry rather than silently discarded. No duplication or corruption was observed across ten repetitions of the scenario.

## 5.5 Responsive and Cross‑Device Behaviour

The interface was verified at three representative viewport widths — 390 pixels (mobile), 820 pixels (tablet) and 1440 pixels (desktop). At each width no horizontal scrollbar appeared on any dashboard, forms remained fully usable, and the two‑card cluster on the administrative dashboard collapsed cleanly to a single column on the smallest viewport. The generated diagrams referenced throughout Chapter Three were confirmed to scale fluidly to each viewport without clipping or overlap. The installed PWA presented no visible scrollbar on mobile viewports, satisfying the "native‑feeling" usability constraint elicited from prospective users.

## 5.6 Comparison with the Prior Manual Workflow

| Dimension | Prior Manual Workflow | OrangeFlow SL |
|---|---|---|
| Authoritative record | Ambiguous; multiple diverging copies | Single row per site in `sites` |
| Audit trail | Reconstructed after the fact | Chronological, per‑actor `activity_log` |
| Role separation | Absent; anyone with folder access could edit anything | Enforced at the database layer by RLS and by the role‑escalation trigger |
| Document handling | Unprotected email attachments | Private buckets with short‑lived signed URLs |
| Field usability | Assumed continuous connectivity | Installable PWA with IndexedDB action queue |
| Supervisory visibility | Reconstructed by asking each participant | Auto‑refreshing dashboards |

Along every dimension examined, the digital pipeline substantively supersedes the manual one.

## 5.7 Discussion

The results support two broader observations. First, moving access enforcement into the database — rather than relying on client‑side or application‑server checks alone — proved decisive: several classes of vulnerability that would otherwise have required bespoke server code to prevent were eliminated by concise RLS policies. Second, the offline‑first design was not an incidental refinement but a first‑class functional requirement, and its correct implementation depended on treating queued actions as data with their own lifecycle rather than as fire‑and‑forget side effects. Both observations reinforce, in the specific context of BTS rollout, the general principles surveyed in Chapter Two.

## 5.8 Chapter Summary

Functional, security, offline and responsive verification each demonstrated that OrangeFlow SL satisfies the requirements set out in Chapter Three. The system materially improves upon the incumbent manual workflow across every operational dimension examined.

---

# Chapter Six — Conclusion and Recommendations

## 6.1 Summary of the Study

This dissertation set out to design, implement and evaluate a role‑based, offline‑capable Progressive Web Application that consolidates the Base Transceiver Station (BTS) site rollout workflow into a single auditable digital pipeline. Chapter One framed the problem, articulated the aim and objectives and stated the research questions. Chapter Two reviewed the relevant literature on telecommunications site rollout, Progressive Web Applications, offline‑first design, Row‑Level Security and secure document delivery, and identified the research gap at their intersection. Chapter Three set out the applied, design‑science methodology, the functional and non‑functional requirements, the three‑tier architecture and the accompanying data, use‑case, activity and flow diagrams. Chapter Four documented the concrete implementation module by module. Chapter Five reported the results of functional, security, offline and responsive verification, and compared the delivered system against the prior manual workflow.

## 6.2 Conclusion

OrangeFlow SL demonstrates that a small, well‑scoped engineering effort — an installable Progressive Web Application on top of a managed PostgreSQL backend — can replace a fragmented, paper‑driven telecommunications rollout workflow with a single auditable digital pipeline that enforces least‑privilege access at the database layer, preserves data integrity under intermittent connectivity, and provides supervisory visibility that the incumbent workflow could not. Each research question posed in Chapter One is answered by the delivered artefact:

- The structural and operational deficiencies of the manual workflow (**RQ1**) were identified and each is addressed by a specific feature of the system.
- The three‑tier architecture, normalised schema, RLS policies and signed‑URL storage together constitute the design that best supports the identified workflow (**RQ2**).
- Least‑privilege access is enforced at the database layer, not merely in the client, through RLS policies scoped to role and ownership, a `SECURITY DEFINER` helper and a role‑escalation trigger (**RQ3**).
- Actions initiated while offline are captured to an IndexedDB queue and replayed idempotently on reconnection, without loss, duplication or corruption (**RQ4**).
- Functional, security, offline and responsive verification (**RQ5**) each confirmed that the implemented system satisfies its requirements.

The dissertation therefore closes the research gap identified in Chapter Two by providing a documented, evaluated implementation that addresses all four concerns — BTS rollout coordination, offline‑first delivery, database‑layer least privilege and private‑bucket document delivery — as a single coherent case.

## 6.3 Contribution to Knowledge

The specific contributions of this study are:

1. A documented case study, situated in the Sierra Leonean operating environment, of applying design‑science principles to the digitisation of a telecommunications rollout workflow.
2. A concrete demonstration that Row‑Level Security, `SECURITY DEFINER` helpers and role‑escalation triggers, in combination, are sufficient to enforce least‑privilege access without bespoke server code.
3. An implementation pattern for offline‑first PWA behaviour in which queued actions are treated as first‑class data with their own lifecycle, enabling idempotent replay through the same code path as online operations.
4. A verification protocol combining role‑based end‑to‑end scenarios, migration‑level negative testing and multi‑viewport responsive checks that other student engineering projects may reuse.

## 6.4 Recommendations for Future Work

Building on the delivered artefact, the following extensions are recommended:

1. **Integration with external systems.** Integrating with the operator's Network Operations Centre, Geographic Information System and Enterprise Resource Planning platform would eliminate the remaining manual handovers at the perimeter of the workflow.
2. **Native mobile shell.** While the installed PWA satisfies present needs, packaging the same codebase as a native iOS and Android application would enable deeper device integration, including background synchronisation and richer offline capabilities.
3. **Advanced analytics.** The activity log already captures the raw material for descriptive and predictive analytics on rollout throughput, bottlenecks and rejection rates; a dedicated analytics module would surface these insights to management.
4. **Multi‑tenant expansion.** The role and schema model generalises straightforwardly to other operators and to adjacent utilities workflows. A tenant‑scoped extension would enable the same system to serve multiple organisations from a single deployment.
5. **Field measurement integration.** Ingesting RF drive‑test data, IoT sensor telemetry and photographic evidence directly from field instruments would further reduce the manual burden on planning and procurement staff.
6. **Automated financial reconciliation.** Coupling the procurement checklist to the operator's finance ledger would close the loop between operational sign‑off and financial commitment.

These extensions, taken together, would evolve OrangeFlow SL from a rollout coordination tool into a full lifecycle management platform for BTS infrastructure in Sierra Leone and comparable markets.

---

# References

The following references are cited in the preceding chapters and are formatted in an IEEE‑style convention. Where a reference points to a living online resource, the citation records the resource by title and canonical location rather than by transient URL query parameters.

[1] R. T. Fielding, *Architectural Styles and the Design of Network‑based Software Architectures*, Ph.D. dissertation, University of California, Irvine, 2000.

[2] E. F. Codd, "A Relational Model of Data for Large Shared Data Banks," *Communications of the ACM*, vol. 13, no. 6, pp. 377–387, June 1970.

[3] The PostgreSQL Global Development Group, *PostgreSQL 16 Documentation — Row Security Policies*, PostgreSQL Documentation, 2023.

[4] R. S. Sandhu, E. J. Coyne, H. L. Feinstein and C. E. Youman, "Role‑Based Access Control Models," *IEEE Computer*, vol. 29, no. 2, pp. 38–47, February 1996.

[5] World Wide Web Consortium, *Progressive Web Applications — Web App Manifest*, W3C Working Draft, 2023.

[6] Google Developers, *Service Worker API — Offline and Background Sync*, Web Fundamentals, 2023.

[7] Mozilla Developer Network, *IndexedDB API — Client‑Side Structured Storage*, MDN Web Docs, 2023.

[8] International Telecommunication Union, *Rollout of Mobile Cellular Networks in Sub‑Saharan Africa: Challenges and Recommendations*, ITU‑D Report, Geneva, 2022.

[9] GSMA Intelligence, *The Mobile Economy — West Africa*, GSM Association, London, 2023.

[10] M. Fowler, *Patterns of Enterprise Application Architecture*. Boston, MA: Addison‑Wesley, 2002.

[11] E. Evans, *Domain‑Driven Design: Tackling Complexity in the Heart of Software*. Boston, MA: Addison‑Wesley, 2003.

[12] Facebook Open Source, *React 18 — Concurrent Rendering and Hooks*, React Documentation, 2023.

[13] E. You, *Vite — Next Generation Frontend Tooling*, Vite Documentation, 2023.

[14] Tailwind Labs, *Tailwind CSS — Utility‑First Framework*, Tailwind CSS Documentation, 2023.

[15] shadcn, *shadcn/ui — Re‑usable Components Built with Radix UI and Tailwind CSS*, Project Documentation, 2023.

[16] TanStack, *TanStack Query — Powerful Asynchronous State Management*, TanStack Documentation, 2023.

[17] Deno Land Inc., *Deno Runtime and Edge Functions — Documentation*, Deno Documentation, 2023.

[18] International Organization for Standardization, *ISO/IEC 27001:2022 — Information Security Management Systems*, ISO, Geneva, 2022.

[19] OWASP Foundation, *OWASP Top Ten — 2021 Edition*, Open Worldwide Application Security Project, 2021.

[20] A. Silberschatz, H. F. Korth and S. Sudarshan, *Database System Concepts*, 7th ed. New York, NY: McGraw‑Hill, 2020.
