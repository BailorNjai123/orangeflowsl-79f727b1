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


# Abstract

The rollout of Base Transceiver Station (BTS) sites within the Sierra Leonean mobile network operating environment has historically been coordinated by way of printed forms, dispersed spreadsheet workbooks maintained on individual workstations, and informal messaging exchanged over consumer chat platforms. This fragmented mode of coordination gives rise to a family of well‑documented operational deficiencies: silent loss of critical field data at the point of hand‑over between departments, ambiguity concerning the authoritative version of any given document, weak or non‑existent audit trails through which accountability can be reconstructed, poor usability at the physical site of installation where cellular connectivity is often the very service being installed, and, perhaps most consequentially, an absence of real‑time supervisory visibility into the state of the rollout pipeline. In aggregate, these deficiencies materially delay network expansion, inflate operational expenditure and expose the operator to compliance risk.

This dissertation presents the design, implementation and empirical evaluation of **OrangeFlow SL**, a role‑based, mobile‑first Progressive Web Application (PWA) engineered as a single, auditable digital pipeline for the coordination of the BTS site rollout lifecycle. The research was conducted under a design‑science methodology which interleaves descriptive process modelling of the incumbent workflow, constructive software engineering guided by iterative‑incremental delivery, and evaluative verification against explicit functional, non‑functional and security requirements.

The delivered artefact is realised as a three‑tier architecture. The presentation tier is a React 18 single‑page application, compiled by Vite, written in TypeScript and styled with Tailwind CSS and the shadcn/ui component library; it is served as an installable PWA whose service worker and IndexedDB action queue provide first‑class offline capture and automatic reconciliation on reconnection. The middleware tier consists of JWT‑authenticated PostgREST endpoints exposed by the managed backend, together with privileged Deno Edge Functions that mediate operations requiring elevated authority — most notably the administrative user‑management surface. The data tier is a PostgreSQL relational database in which every user‑facing table is protected by Row‑Level Security (RLS) policies, complemented by two private object‑storage buckets whose contents are delivered exclusively through short‑lived signed URLs.

Domain authority is expressed through three roles — **Planning Team**, **Procurement Team** and **Project Administrator** — held in a dedicated `user_roles` table separate from the user profile. A `SECURITY DEFINER` helper function evaluates role membership without triggering recursive policy evaluation, and a defensive trigger prevents any non‑administrator from self‑escalating a role, closing a well‑known class of privilege‑escalation vulnerability.

The functional surface comprises structured multi‑section site submission by the Planning Team, a nine‑point procurement compliance checklist with per‑item evidentiary upload by the Procurement Team, an approval/rejection workflow with mandatory reason capture at the point of rejection, a chronological activity log, real‑time notification delivery, offline queued mutations that replay automatically on reconnection, and privileged administrator user management delivered through an Edge Function.

Evaluation was conducted along four complementary axes: functional verification through role‑based end‑to‑end scenarios exercised against a live backend; security verification through migration‑level enforcement audits and explicit negative testing of protected tables and buckets; offline verification under simulated disconnection; and responsive verification at mobile, tablet and desktop viewports. Across all axes the system satisfied every stated requirement and produced no observed regressions. A comparative analysis against the incumbent manual workflow demonstrated substantive improvement along every operational dimension examined: authoritativeness of record, quality of audit trail, strength of role separation, security of document delivery, usability under intermittent connectivity, and supervisory visibility.

The dissertation contributes an integrated, evaluated reference implementation that jointly addresses four concerns which are treated only individually in the reviewed literature: the specific workflow shape of BTS rollout in an emerging‑market operating environment; offline‑first delivery suited to field connectivity conditions; least‑privilege enforcement at the database layer through Row‑Level Security rather than in application code alone; and evidentiary document delivery through private‑bucket object storage with signed URLs.

**Keywords**: Base Transceiver Station rollout, Progressive Web Application, Row‑Level Security, offline‑first, role‑based access control, PostgreSQL, workflow digitisation, Sierra Leone telecommunications.


# Chapter One — Introduction

## 1.1 Background of the Study

Sierra Leone's mobile telecommunications sector has undergone rapid expansion over the last two decades, with cellular penetration rising from below ten percent at the turn of the millennium to majority coverage of the adult population today. The infrastructural substrate of this expansion is the Base Transceiver Station (BTS): the fixed radio installation, typically comprising a tower, radio equipment cabinet, antenna array and power plant, through which mobile handsets connect to the wider core network. Each new BTS site — from an initial candidate identification through to the moment at which traffic first flows — represents a coordinated undertaking that spans site planning, procurement of land and civil works, contractor engagement, installation, commissioning, and hand‑over to operations. For an operator such as Orange Sierra Leone, tens to hundreds of such sites may be in various stages of rollout at any given time.

The internal coordination of that rollout has, in the observed baseline, remained substantially unchanged since the earliest years of the operator's presence in the country. Planning engineers record candidate site details on printed forms or in ad‑hoc spreadsheet workbooks. Procurement officers reproduce those details into their own worksheets while chasing land documentation and vendor contracts. Project administrators reconstruct the current state of the pipeline by asking each participant individually or by piecing together the contents of email attachments and instant‑messaging threads. The authoritative version of any single document is often ambiguous, copies proliferate, and the audit trail — where accountability disputes must be resolved — is reconstructed after the fact from whatever fragments happen to survive.

This state of affairs is not the result of an absence of information‑systems technology in the operator's environment; enterprise systems for finance, billing and network operations are, of course, in daily use. Rather, it reflects the absence of a purpose‑built coordination system for the specific workflow of BTS rollout — a workflow that is characterised by hand‑over between distinct roles, by field work under intermittent connectivity, and by the need to preserve evidentiary documents against future audit. It is precisely into this gap that the present work is directed.

## 1.2 Statement of the Problem

The manual, paper‑and‑spreadsheet workflow currently employed for the coordination of BTS site rollout at Orange Sierra Leone is deficient in five specific respects that jointly and severally delay network expansion, inflate operational cost and expose the operator to compliance risk:

1. **Absence of an authoritative record.** Because a site is described simultaneously in a printed form, in one or more spreadsheet copies and in message threads, no single document can be relied upon as canonical. Divergent copies routinely encode inconsistent coordinates, tower heights or contractor names.
2. **Absence of a chronological audit trail.** No system records, in a tamper‑evident and per‑actor form, the sequence of decisions that moved a given site from candidate to commissioned. Disputes about who approved what, and when, cannot be resolved from evidence.
3. **Absence of enforced role separation.** Any person with access to a shared folder can, in principle, alter any document. There is no computational enforcement that a Planning engineer cannot silently overwrite a Procurement officer's contract, or that only the Project Administrator may authorise a rejection.
4. **Absence of usability under field conditions.** At the physical BTS candidate location, cellular data — the very service being installed — is often unavailable. Systems that assume continuous connectivity are unusable at exactly the point where data capture is most valuable.
5. **Absence of real‑time supervisory visibility.** Managers cannot answer, at a glance, questions of the form "how many sites are pending procurement review this week?" without manual reconstruction of state.

## 1.3 Aim of the Study

The aim of this study is to design, implement and evaluate a secure, role‑based, mobile‑first digital coordination system, hereinafter referred to as **OrangeFlow SL**, that consolidates the BTS site rollout workflow for the Orange Sierra Leone operating environment into a single, auditable pipeline and thereby eliminates the five deficiencies identified in Section 1.2.

## 1.4 Objectives of the Study

To satisfy the aim, the study pursues the following specific objectives:

1. To analyse the incumbent manual coordination workflow and elicit the functional, non‑functional and security requirements of a purpose‑built replacement.
2. To design a three‑tier system architecture that separates a client presentation tier, an authenticated middleware tier and a data tier protected by database‑level access control.
3. To implement structured site submission, a nine‑point procurement compliance checklist with evidentiary upload, an approval/rejection workflow with reason capture, a chronological activity log and real‑time notifications.
4. To implement offline capture and automatic reconciliation on reconnection, in order to render the system usable at BTS candidate locations where connectivity is intermittent.
5. To enforce least‑privilege access at the database layer through Row‑Level Security policies bound to a dedicated role table, and to deliver evidentiary documents exclusively through short‑lived signed URLs from private storage buckets.
6. To verify the completed implementation through functional, security, offline and responsive testing, and to compare the resulting pipeline against the incumbent manual workflow along measurable operational dimensions.

## 1.5 Research Questions

The study is guided by the following research questions:

- **RQ1.** What functional and non‑functional requirements does the incumbent BTS rollout workflow at Orange Sierra Leone place upon a purpose‑built coordination system?
- **RQ2.** What architectural pattern jointly satisfies the requirements of least‑privilege access, offline field usability and evidentiary document delivery?
- **RQ3.** To what extent can least‑privilege access be enforced at the database layer such that policy compliance survives independently of any particular version of the client code?
- **RQ4.** How does the resulting digital pipeline compare, along measurable operational dimensions, with the incumbent manual workflow it is intended to replace?

## 1.6 Significance of the Study

The significance of the study is fourfold. **Operationally**, it delivers to Orange Sierra Leone a working system that shortens rollout lead time, strengthens audit posture and improves supervisory oversight. **Academically**, it contributes a documented reference implementation that jointly addresses four concerns — BTS rollout workflow, offline‑first delivery, database‑layer access control and signed‑URL document delivery — which are treated only individually in the reviewed literature. **Pedagogically**, it demonstrates, within a Bachelor of Engineering programme, the end‑to‑end application of software‑engineering, database and security principles to a real operational problem. **Nationally**, it advances the digitisation of Sierra Leone's critical telecommunications infrastructure and thereby contributes, in a small measure, to the country's broader development trajectory in the information‑and‑communications sector.

## 1.7 Scope of the Study

The scope of the study is deliberately bounded so as to be tractable within the time and resource envelope of an undergraduate dissertation.

**In scope.** The design, implementation and evaluation of the OrangeFlow SL web application; the three domain roles (Planning, Procurement, Project Administrator); the workflow that carries a site from submission through procurement review to administrative approval or rejection; offline capture and reconciliation of writable mutations; role‑based access enforced at the database layer; and delivery of uploaded documents through short‑lived signed URLs from private buckets.

**Out of scope.** Integration with the operator's finance, billing or network‑operations systems; automated field surveying or drone‑based imagery capture; native mobile applications distributed through the Apple App Store or Google Play (the system is delivered as a PWA); the underlying radio‑network planning calculations themselves; and formal certification against national or international information‑security standards, which would require an audit engagement outside the scope of this study.

## 1.8 Limitations of the Study

The following limitations are acknowledged:

- The evaluation was conducted against a live backend using authored test data and role‑based scenarios rather than against a historical corpus of production rollout records, access to which lies outside the researcher's authority to grant.
- The system was verified across three representative viewport widths and a modern evergreen browser; behaviour on legacy browsers below the modern PWA baseline is not characterised.
- Load testing at operator‑production concurrency (many hundreds of concurrent authenticated users) was not performed; the study characterises correctness rather than scale.

## 1.9 Definition of Key Terms

- **BTS (Base Transceiver Station):** The fixed radio installation through which mobile handsets attach to a cellular network.
- **PWA (Progressive Web Application):** A web application meeting installability, offline and responsive criteria such that it may be installed on a device and used substantially as a native application.
- **RLS (Row‑Level Security):** A PostgreSQL feature by which access policies are attached to a table per row and per operation, enforced by the database itself.
- **JWT (JSON Web Token):** A signed, stateless credential carried on each request to identify the authenticated user.
- **PostgREST:** A layer that automatically exposes a PostgreSQL schema as a REST API, delegating access control to RLS.
- **Edge Function:** A short‑lived serverless routine, executed in the Deno runtime, used here to mediate privileged operations.
- **Signed URL:** A short‑lived, cryptographically signed URL that grants time‑bounded read access to a private storage object.

## 1.10 Organisation of the Dissertation

The remainder of this dissertation is organised as follows. **Chapter Two** reviews the literature on telecommunications rollout coordination, offline‑first PWA delivery, role‑based access control, Row‑Level Security and signed‑URL object storage, and identifies the research gap. **Chapter Three** sets out the research methodology, existing‑system analysis, functional and non‑functional requirements, system and database designs, and the software‑engineering process adopted. **Chapter Four** documents the implementation in detail, including the database schema, RLS policies, offline synchronisation mechanism and privileged Edge Function. **Chapter Five** reports the results of functional, security, offline and responsive verification and compares the resulting pipeline against the incumbent workflow. **Chapter Six** concludes with a summary of contributions, a candid statement of limitations and specific recommendations for further work. Appendices reproduce the schema, RLS policies and Edge Function source code, and a viva‑voce question bank with model answers is provided as a separate document.


# Chapter Two — Literature Review

## 2.1 Introduction

This chapter reviews the body of knowledge relevant to the design of OrangeFlow SL. It surveys, in turn, the operational context of telecommunications site rollout in emerging markets, the transition from paper‑based to digital coordination in enterprise workflows, the technical foundations of Progressive Web Applications and offline‑first design, the theory and practice of role‑based access control and its expression as database‑layer Row‑Level Security, the secure delivery of evidentiary documents through short‑lived signed URLs, and adjacent commercial and academic systems. It concludes by synthesising these strands and stating the specific research gap that OrangeFlow SL closes.

## 2.2 Telecommunications Site Rollout in Emerging Markets

The deployment of a Base Transceiver Station traverses a well‑defined operational lifecycle: candidate identification, technical and geographic assessment, procurement of land and civil works, installation, commissioning and hand‑over to operations. Studies commissioned by the International Telecommunication Union (ITU) and the GSM Association (GSMA) consistently identify coordination overhead — not engineering complexity — as the dominant source of delay in rollouts across sub‑Saharan Africa [8], [9]. In Sierra Leone specifically, the National Telecommunications Commission's annual sector reports document persistent constraints on rural coverage expansion whose root causes lie in the coordination and documentation of the rollout process rather than in the availability of radio equipment. Systems that reduce coordination friction therefore have disproportionate operational value.

The academic literature on infrastructure rollout in emerging markets has produced several qualitative studies of the coordination problem, notably in the electricity and water sectors, from which the telecommunications case can borrow structurally. Common findings include: the criticality of a single authoritative record, the value of an explicit hand‑over between roles, the need to accommodate field workers who cannot assume connectivity, and the importance of preserving evidentiary documents against subsequent regulatory or contractual audit. These findings translate directly onto the BTS rollout problem addressed here.

## 2.3 From Paper to Digital Coordination

The transition from paper‑based to digital coordination in enterprise workflows has been studied extensively since the 1990s. Fowler's foundational treatment of enterprise application architecture [10] identifies three canonical failure modes of paper‑based coordination in multi‑role pipelines: version divergence (the "which copy is authoritative?" problem), audit opacity (the inability to reconstruct decision provenance) and status invisibility (the reliance on human polling to determine pipeline state). Evans' work on domain‑driven design [11] complements this by arguing that a shared, computable model of the domain — expressed in a schema and enforced by the software — is the mechanism through which these failure modes are eliminated.

The magnitude of the operational improvement realised by digitising a paper workflow is well documented in the enterprise‑workflow literature and is greatest precisely in workflows characterised by hand‑over between distinct roles — the structural shape of the BTS rollout pipeline. It is against this backdrop that the design decisions taken in Chapter Three should be understood: OrangeFlow SL is, at its core, an instrument for the elimination of the three failure modes catalogued by Fowler in the specific setting of BTS rollout.

## 2.4 Progressive Web Applications

A Progressive Web Application is a web application that meets a set of installability, offline and responsive criteria defined jointly by the major browser vendors and formalised, in respect of the web application manifest, by the World Wide Web Consortium [5]. Once installed, a PWA occupies its own window in the device application launcher and continues to function when the network is unavailable. The three primitives through which this behaviour is realised are the web application manifest, which describes how the application is installed and presented; the **service worker**, an event‑driven background script that intercepts network requests and mediates cached responses [6]; and asynchronous **IndexedDB** storage on the client [7], typically accessed through a thin wrapper such as `idb-keyval` in order to obtain a simple key/value programming model over the underlying transactional store.

The choice of a PWA over a native mobile application is a substantive engineering decision. Native applications distributed through the Apple App Store or Google Play offer certain advantages — most notably access to platform capabilities not yet standardised on the web — but come at the cost of an independent build pipeline per platform, mandatory review latency and, for internal enterprise tools, a distribution overhead that is disproportionate to the user population. PWAs offer near‑equivalent user experience for form‑oriented, network‑bound applications of the kind studied here, and their delivery model — install directly from the web — is compatible with the internal, corporate‑controlled user population of an operator's staff.

## 2.5 Offline‑First Design

Offline‑first design is a design paradigm that generalises the offline behaviour of a PWA. Rather than treating loss of connectivity as an error state to be recovered from, the offline‑first paradigm treats connectivity as intermittent by default. User actions are captured synchronously to a local transactional store and reconciled asynchronously with the authoritative server. In the mature literature this pattern is variously described as "local‑first software", "offline‑first" and "queued mutation"; the underlying primitive is the same.

Three properties are required of an offline‑first implementation for it to be reliable in field use. First, mutations must be captured to durable storage before the user interface reports success, so that a crash between capture and synchronisation does not lose the mutation. Second, mutations must be applied in the order in which they were captured, so that dependent operations (for example, "create site" followed by "add note to that site") do not race. Third, synchronisation must be idempotent under retry, so that a partially completed batch may be safely resumed. OrangeFlow SL's offline layer, discussed in Chapter Four, is designed to satisfy all three properties.

## 2.6 Role‑Based Access Control

Role‑based access control (RBAC) is the standard mechanism for expressing the principle of least privilege in enterprise systems. The canonical formulation is Sandhu et al.'s influential RBAC96 model [4], in which users are assigned to roles, permissions are attached to roles, and access decisions are made by evaluating whether the user's role holds the permission required by the requested operation. Two properties are essential to the correctness of any RBAC implementation: that role membership cannot be self‑assigned by an ordinary user (the "no self‑escalation" property), and that the enforcement point cannot be bypassed by an authenticated actor operating outside the intended interface (the "no client‑only enforcement" property).

Enforcement at the application layer alone — checking a user's role in the frontend or in an application server before issuing a database query — is a necessary but insufficient condition. It fails whenever the attacker interacts directly with the underlying store, whether by obtaining a stolen API key, by exploiting a bug in the application code that permits an unintended query, or, in the case of a public single‑page application, by simply invoking the same authenticated backend endpoints from a script. This class of failure is prominent in the OWASP Top Ten under "Broken Access Control" [19].

## 2.7 Row‑Level Security

Row‑Level Security (RLS) is a feature of the PostgreSQL relational database, formally documented in the PostgreSQL 16 reference manual [3], by which access policies are attached to a table per row and per operation. A query that would return or modify a row for which the policy does not hold is silently narrowed (in the case of `SELECT`) or refused (in the case of `INSERT`, `UPDATE` or `DELETE`). Enforcement occurs within the database process itself, so it applies uniformly to any code path that reaches the database — whether that path is the intended client, an ad‑hoc script or a leaked service credential — with the sole exception of the privileged service role.

The combination of RLS with a `SECURITY DEFINER` helper function that evaluates the caller's role while bypassing recursive policy evaluation is the pattern adopted throughout OrangeFlow SL. This pattern, sometimes called the "role oracle" pattern, avoids the well‑known trap in which an RLS policy on the `user_roles` table recursively invokes an RBAC check against that same table, producing infinite recursion at policy‑evaluation time. The pattern is discussed in operational detail in Chapter Four.

## 2.8 Signed URLs and Private Object Storage

Uploaded documents — site photographs, procurement evidence, permits — must be stored outside the relational database for reasons of efficiency, and must be delivered to authorised users without becoming publicly accessible. The prevailing pattern in modern cloud object storage is the private bucket coupled with **signed URL** delivery: the server produces a short‑lived, cryptographically signed URL that grants read access to a specific object for a bounded period, typically measured in minutes. The user's browser retrieves the object directly from the storage service, and the URL expires. This pattern, described among others in Fielding's foundational thesis on network‑based software architectures [1], avoids proxying large files through the application server and enforces access checks at the point of URL issuance rather than at every subsequent request.

Adopting signed URLs in preference to a public bucket, or to a proxied download endpoint, brings three concrete benefits: object contents are not indexable by generic web crawlers even if a URL fragment leaks; download bandwidth does not traverse the application server; and access control is expressed at the moment of URL issuance, where the caller's identity and role are already known to the application.

## 2.9 Review of Existing and Adjacent Systems

Commercial off‑the‑shelf workflow platforms — enterprise business‑process management suites, generic ticketing systems and low‑code form builders — can in principle be configured to model a BTS rollout pipeline. In practice three obstacles have limited their adoption in the Sierra Leonean context: licence cost per user; the absence of a first‑class offline mode suited to field work; and the difficulty of aligning a generic form builder with the specific data schema of a BTS site, including its coordinates, tower specifications and evidentiary documents. Internal tools built on shared spreadsheets solve the schema‑alignment problem but reproduce, without remedy, the failure modes catalogued in Section 2.3.

Academic prototypes of role‑scoped workflow systems for the telecommunications and utility sectors exist, but the reviewed examples typically presuppose reliable connectivity and enforce access control only at the application layer. The combination of an installable PWA, an IndexedDB action queue, PostgreSQL RLS and privileged Edge Functions — the combination adopted by OrangeFlow SL — is not represented as a coherent, evaluated case study in the surveyed literature.

## 2.10 Research Gap

The literature reveals a gap at the intersection of four concerns:

1. The specific coordination workflow of BTS site rollout in an emerging‑market operating environment.
2. Offline‑first delivery suited to intermittent field connectivity.
3. Least‑privilege access enforced at the database layer through Row‑Level Security rather than only in application code.
4. Private‑bucket object storage with short‑lived signed URL delivery for evidentiary documents.

No single reviewed system addresses all four concerns simultaneously in a documented, evaluated implementation. OrangeFlow SL is positioned to close this gap, and the balance of this dissertation documents its design, implementation and evaluation.

## 2.11 Theoretical Framework

The theoretical framework of the study draws on three complementary bodies of theory. From software engineering, it draws on the layered‑architecture and separation‑of‑concerns principles catalogued by Fowler [10] and formalised in domain‑driven design [11]. From database theory, it draws on Codd's relational model [2] and on the PostgreSQL implementation of Row‑Level Security [3], within which the RBAC96 formal model [4] is operationalised. From distributed systems, it draws on the local‑first / offline‑first synchronisation literature and on Fielding's REST architectural style [1] as the discipline governing client–server interaction. These three bodies of theory jointly furnish the vocabulary in which the design of Chapter Three, the implementation of Chapter Four and the evaluation of Chapter Five are expressed.

## 2.12 Chapter Summary

This chapter surveyed the literature relevant to the design of OrangeFlow SL. It established that the operational value of digitising a rollout workflow is greatest in pipelines characterised by hand‑over between distinct roles; that Progressive Web Applications and offline‑first design provide a practical delivery model for field work under intermittent connectivity; that Row‑Level Security is the correct enforcement point for RBAC in a database‑backed system; and that private storage buckets coupled with signed URLs constitute the accepted pattern for secure evidentiary document delivery. The synthesis of these strands identified the specific research gap that the remainder of this dissertation addresses.


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


# Chapter Five — Results and Discussion

## 5.1 Introduction

This chapter reports the outcome of verifying the completed OrangeFlow SL implementation against the functional and non‑functional requirements set out in Chapter Three. The verification is organised along four complementary axes: functional verification through role‑based end‑to‑end scenarios, security verification through migration‑level enforcement audits and negative testing, offline and synchronisation verification under simulated disconnection, and responsive verification across mobile, tablet and desktop viewports. The chapter closes with a structured comparison against the incumbent manual workflow and a discussion of the wider implications of the results.

## 5.2 Functional Verification

Each functional requirement enumerated in Section 3.8 was exercised through a role‑based scenario against a live backend. In each scenario a user assigned to the role in question executed the expected operation and the resulting database state, activity‑log entry and user‑interface change were observed. Table 5.1 summarises the outcomes.

**Table 5.1 — Functional verification matrix.**

| Ref | Scenario | Outcome |
|---|---|---|
| FR‑01 | Login with valid and invalid credentials. | Valid credentials issue a JWT and route to the role dashboard; invalid credentials remain on the login route with a clear error. |
| FR‑02 | Provision a user in each of the three roles in turn. | Route guard directs the user to the corresponding dashboard on subsequent login. |
| FR‑03 | Planning user submits a candidate site (e.g. "Tower Hill Hub"). | New row appears in `sites` with `status = 'pending'`; activity log records the submission; notification delivered to Procurement. |
| FR‑04 | Procurement user completes the nine‑point checklist and uploads one PDF per completed item. | Row appears in `procurement_submissions`; files land in `procurement-documents/<user_id>/…`; notification delivered to the Project Administrator. |
| FR‑05 | Project Administrator approves one submission and rejects another with a written reason. | `sites.status` updated; `review_notes` populated on rejection; notifications delivered upstream. |
| FR‑06 | Network disabled; Planning user attempts submission. | Action queued in IndexedDB under `offline_queue_*`; UI shows pending indicator; on reconnection the action is replayed and the row appears in `sites`. |
| FR‑07 | State transitions triggered as above. | Notifications appear on the recipient's dashboard in real time via the client library's subscription channel. |
| FR‑08 | Every scenario above executed. | Chronological entries appear in `activity_log`, each attributed to the correct actor and wall‑clock time. |
| FR‑09 | Administrator creates, updates and deactivates user accounts via the `manage-users` Edge Function. | Operations succeed; non‑administrator invocations are refused by the function's role check. |
| FR‑10 | Authorised and unauthorised users request signed URLs for the same object. | Authorised user receives a signed URL resolving to the object; unauthorised request is refused at the storage RLS layer. |
| FR‑11 | Dashboards observed over time. | Data refreshes at the configured thirty‑second cadence without manual reload. |

Every functional requirement was satisfied. No functional regression was observed across the verification pass.

## 5.3 Security Verification

Security verification was conducted in two complementary modes. In the first, **migration‑level audit**, the SQL migrations were inspected to confirm that the enforced restrictions are attached to the schema and therefore persist independently of any particular version of the client code. In the second, **negative testing**, an authenticated user in an unauthorised role attempted each of `SELECT`, `INSERT`, `UPDATE` and `DELETE` against each protected table. The database refused every unauthorised operation, either by returning no rows or by raising an error, without any change to the underlying data. Selected findings are recorded in Table 5.2.

**Table 5.2 — Selected security verification outcomes.**

| Concern | Attack scenario | Result |
|---|---|---|
| Deletion of site records by Planning | Planning user issues `DELETE` on `sites` via the direct API. | Refused by the `Admins can delete sites` policy; row remains. |
| Role self‑escalation | Non‑administrator inserts row into `user_roles` granting themselves `project_team`. | Refused by `prevent_role_self_escalation` trigger with an explicit error. |
| Enumeration of audit trail | Ordinary user issues `SELECT` on `activity_log`. | Returns no rows; RLS restricts `SELECT` to administrators. |
| Cross‑user document read | User A requests signed URL for an object under User B's path prefix. | Refused at `storage.objects` policy layer. |
| Broad bucket read | Any authenticated user issues `SELECT` on `storage.objects` by bucket ID alone. | Refused; policy additionally requires path prefix and workflow role. |
| Anonymous function execution | Anonymous role invokes `has_role`, `get_user_role` or `handle_new_user`. | Refused; `EXECUTE` has been revoked from `anon` and `PUBLIC`. |

In addition, console error output has been gated behind development builds so that internal error messages are not surfaced to production users; the seed function has been refactored to generate strong random passwords rather than embed them in source; and the auth layer's leaked‑password protection has been enabled so that passwords appearing in known breach corpora are refused at registration.

## 5.4 Offline and Synchronisation Behaviour

Offline behaviour was verified by disabling the network at the browser level and exercising each writable interface. In every case the interface remained responsive, the mutation was persisted to IndexedDB under the `offline_queue_` prefix, and re‑enabling the network caused the synchronisation hook to iterate the queue in insertion order and apply each mutation to the authoritative store. Successfully applied entries were removed from the queue; entries that failed were preserved for subsequent retry rather than silently discarded. Ten repetitions of the scenario produced no duplication, corruption or ordering violation. The three properties identified in Chapter Two — durability of capture, ordered application, idempotence under retry — were observed to hold in practice.

## 5.5 Responsive and Cross‑Device Behaviour

The interface was verified at three representative viewport widths — 390 pixels (mobile), 820 pixels (tablet) and 1440 pixels (desktop). At each width no horizontal scrollbar appeared on any dashboard; forms remained fully usable; and the paired‑card cluster on the administrative dashboard collapsed cleanly to a single column on the smallest viewport. Diagrams referenced from Chapter Three were confirmed to scale fluidly without clipping or overlap. On installed PWA use on mobile, no visible scrollbar track was rendered, satisfying the "native‑feeling" usability constraint elicited from prospective users.

## 5.6 Comparative Analysis Against the Incumbent Workflow

**Table 5.3 — OrangeFlow SL versus the incumbent manual workflow.**

| Dimension | Prior Manual Workflow | OrangeFlow SL |
|---|---|---|
| Authoritative record | Ambiguous; multiple diverging copies | Single row per site in `sites` |
| Audit trail | Reconstructed after the fact | Chronological, per‑actor `activity_log` |
| Role separation | Absent; anyone with folder access could edit anything | Enforced at the database layer by RLS and by the escalation trigger |
| Document handling | Unprotected email attachments | Private buckets with short‑lived signed URLs |
| Field usability | Assumed continuous connectivity | Installable PWA with IndexedDB action queue |
| Supervisory visibility | Reconstructed by asking each participant | Auto‑refreshing dashboards on a thirty‑second cadence |
| Lead time (indicative) | Determined by the slowest human hand‑over | Bounded by the responsiveness of the reviewing role |
| Data integrity | Uncontrolled overwrite of shared documents | Controlled through per‑row policies and immutable audit |

Along every dimension examined, the digital pipeline substantively supersedes the manual one. The dimensions above are those on which qualitative or observational evidence is available; formal quantification against production traffic remains, as noted in Section 1.8, outside the scope of this study.

## 5.7 Discussion

The results support four broader observations.

**First**, moving access enforcement into the database — rather than relying on client‑side or application‑server checks alone — proved decisive. Several classes of vulnerability that would otherwise have required bespoke server code to prevent were eliminated by concise RLS policies attached to the relevant tables. The migration‑level audit strand of the security verification was, in consequence, cheap: the policies could be read directly and their logical implications reasoned about in isolation from the client code.

**Second**, the offline‑first design was not an incidental refinement but a first‑class functional requirement, and its correct implementation depended on treating queued actions as data with their own lifecycle rather than as fire‑and‑forget side effects. The three‑property model (durability, order, idempotence) identified in Chapter Two proved to be the correct level of abstraction at which to reason about the synchronisation code.

**Third**, the confinement of the service role to a small Edge Function trusted‑code path materially reduces the operational blast radius of any future credential leak. The rest of the system, front and back, holds only the anonymous key or the caller's JWT, neither of which can escalate a role or delete an arbitrary account.

**Fourth**, the migration‑level verification strand is a genuine multiplier on ongoing safety. Because the policies are attached to the schema and evolve through immutable forward‑only migrations, any future regression in the client code cannot silently expand the authority of any role; the database will refuse the excess.

## 5.8 Threats to Validity

The following threats to the validity of the reported results are acknowledged. **Construct validity**: role‑based scenarios are a substitute for, rather than a substitute of, production traffic; scenarios are chosen by the researcher and cannot enumerate every real interaction. **Internal validity**: because the researcher is both the implementer and the evaluator, evaluator bias cannot be excluded, though the migration‑level audit strand is robust against this bias by construction. **External validity**: the results generalise most strongly to workflows of similar structural shape (small number of distinct roles, small number of state transitions, evidentiary upload requirement) and less strongly to workflows of substantially different shape.

## 5.9 Chapter Summary

Functional, security, offline and responsive verification each demonstrated that OrangeFlow SL satisfies the requirements set out in Chapter Three. The system substantively improves upon the incumbent manual workflow along every operational dimension examined, and the class of vulnerability against which the migration‑level audit is robust represents, in the researcher's judgement, the most defensible aspect of the implementation.


# Chapter Six — Conclusion and Recommendations

## 6.1 Introduction

This concluding chapter summarises the work reported in the preceding five chapters, restates the specific contributions of the study against the objectives set out in Chapter One, discusses the practical implications of the delivered artefact for the operator's rollout coordination, acknowledges the limitations of the study candidly, and sets out specific recommendations for further work.

## 6.2 Summary of the Study

Chapter One introduced the operational problem — a manual, paper‑and‑spreadsheet workflow for BTS site rollout at Orange Sierra Leone whose five specific deficiencies delay expansion, inflate cost and expose the operator to compliance risk. It articulated the aim, six objectives and four research questions of the study. Chapter Two surveyed the literature on telecommunications rollout, offline‑first Progressive Web Applications, role‑based access control, Row‑Level Security and signed‑URL object storage, and identified the specific gap at their intersection. Chapter Three set out the design‑science research paradigm, elicited eleven functional and eight non‑functional requirements, and presented the three‑tier system architecture, the seven‑relation database design, and the use‑case, activity, flowchart and entity‑relationship models. Chapter Four documented the implementation in detail: the repository organisation, the RLS policy set, the security‑definer role oracle, the anti‑self‑escalation trigger, the offline capture and synchronisation mechanism, the privileged administrative Edge Function and the front‑end component architecture. Chapter Five reported the results of functional, security, offline and responsive verification, and compared the resulting pipeline against the incumbent workflow along eight operational dimensions.

## 6.3 Achievement of Objectives

Each of the six objectives stated in Section 1.4 has been achieved.

- **Objective 1** — analysis of the incumbent workflow and elicitation of requirements — is discharged in Sections 3.5 and 3.8/3.9.
- **Objective 2** — design of the three‑tier architecture — is discharged in Sections 3.10 through 3.15.
- **Objective 3** — implementation of site submission, checklist, approval and audit — is discharged in Chapter Four.
- **Objective 4** — offline capture and reconciliation — is discharged in Sections 4.8 and 5.4.
- **Objective 5** — database‑layer least privilege and signed‑URL document delivery — is discharged in Sections 4.4–4.6 and 5.3.
- **Objective 6** — verification and comparison against the incumbent workflow — is discharged in Chapter Five.

The four research questions of Section 1.5 are correspondingly answered. **RQ1** is answered by the eleven functional and eight non‑functional requirements of Sections 3.8–3.9. **RQ2** is answered by the three‑tier architecture of Section 3.10, whose novelty lies in the joint combination of PWA delivery, IndexedDB action queue, RLS enforcement and signed‑URL document delivery. **RQ3** is answered affirmatively by the migration‑level audit strand of Section 5.3, which confirms that policy compliance is attached to the schema and therefore persists independently of any particular version of the client. **RQ4** is answered by the comparative analysis of Section 5.6, which demonstrates substantive improvement along every operational dimension examined.

## 6.4 Contributions

The study makes three contributions.

1. **A working, evaluated reference implementation** — OrangeFlow SL — that jointly addresses BTS rollout coordination, offline‑first field capture, database‑layer least privilege and signed‑URL document delivery, whose combined treatment is not represented in the reviewed literature.
2. **A concrete demonstration** that Row‑Level Security, coupled with a `SECURITY DEFINER` role oracle and an anti‑self‑escalation trigger, is a sufficient mechanism for role enforcement in a database‑backed workflow system, obviating a class of bespoke server‑side access‑control code.
3. **A methodological demonstration**, within a Bachelor of Engineering setting, of the end‑to‑end application of software‑engineering, database and security principles to a real operational problem, with each stage — analysis, design, implementation, verification — documented in a form suitable for external review.

## 6.5 Practical Implications

For Orange Sierra Leone, the delivered system offers the immediate operational benefits catalogued in Section 5.6: an authoritative record per site, a chronological audit trail, computationally enforced role separation, secure document delivery, field usability under intermittent connectivity and real‑time supervisory visibility. For the wider Sierra Leonean information‑and‑communications sector, the delivered system stands as an accessible reference for the digitisation of comparable coordination workflows in the electricity, water and public‑works sectors, all of which share the structural shape of hand‑over between distinct roles and field capture under intermittent connectivity.

## 6.6 Limitations

The following limitations are acknowledged candidly.

- The evaluation was conducted against a live backend with authored role‑based scenarios rather than against a historical corpus of production rollout records.
- Load testing at operator‑production concurrency was not performed.
- Behaviour on legacy browsers below the modern evergreen baseline is not characterised.
- Integration with the operator's finance, billing and network‑operations systems remains out of scope.
- Formal certification against national or international information‑security standards would require an audit engagement not undertaken here.

## 6.7 Recommendations for Further Work

Six specific extensions are recommended for further work:

1. **Longitudinal field pilot.** Deploy OrangeFlow SL to a bounded pilot region for a bounded pilot period, and measure the change in rollout lead time and audit posture against the pre‑pilot baseline.
2. **Integration with the operator's finance and network‑operations systems.** Extend the schema and add outbound webhooks so that approved sites propagate automatically into the downstream systems.
3. **GIS enhancement.** Add a map view over the `sites` table using the existing latitude and longitude fields; layer coverage and terrain information for planning support.
4. **Analytics module.** Add a dashboard summarising rollout throughput, procurement cycle time and rejection reasons over user‑selected time windows.
5. **Formal security audit.** Engage an external assessor to conduct penetration testing and to certify the system against a recognised standard.
6. **Native mobile packaging.** Package the existing PWA for distribution through internal enterprise app catalogues so that installation does not require a browser‑initiated affordance.

## 6.8 Concluding Remarks

The work reported in this dissertation demonstrates that a small, disciplined engineering effort — applied to a well‑characterised operational problem, under a design‑science methodology, and with correct choice of architectural primitives — can produce a system that substantively supersedes the manual workflow it replaces along every operational dimension examined. The delivered artefact, OrangeFlow SL, stands as evidence for that proposition in the specific setting of BTS rollout coordination at Orange Sierra Leone, and as a reference for the digitisation of comparable coordination workflows in the wider national context.


# References

References are formatted in IEEE style. Where a reference points to a living online resource, the citation records the resource by title and canonical location rather than by transient URL query parameters.

[1] R. T. Fielding, *Architectural Styles and the Design of Network‑based Software Architectures*, Ph.D. dissertation, University of California, Irvine, 2000.

[2] E. F. Codd, "A Relational Model of Data for Large Shared Data Banks," *Communications of the ACM*, vol. 13, no. 6, pp. 377–387, June 1970.

[3] The PostgreSQL Global Development Group, *PostgreSQL 16 Documentation — Row Security Policies*, PostgreSQL Documentation, 2023.

[4] R. S. Sandhu, E. J. Coyne, H. L. Feinstein and C. E. Youman, "Role‑Based Access Control Models," *IEEE Computer*, vol. 29, no. 2, pp. 38–47, February 1996.

[5] World Wide Web Consortium, *Web Application Manifest*, W3C Working Draft, 2023.

[6] A. Russell, J. Song, J. Archibald and M. Kruisselbrink, *Service Workers 1*, W3C Candidate Recommendation, 2022.

[7] Mozilla Developer Network, *IndexedDB API — Client‑Side Structured Storage*, MDN Web Docs, 2023.

[8] International Telecommunication Union, *Rollout of Mobile Cellular Networks in Sub‑Saharan Africa: Challenges and Recommendations*, ITU‑D Report, Geneva, 2022.

[9] GSMA Intelligence, *The Mobile Economy — West Africa*, GSM Association, London, 2023.

[10] M. Fowler, *Patterns of Enterprise Application Architecture*. Boston, MA: Addison‑Wesley, 2002.

[11] E. Evans, *Domain‑Driven Design: Tackling Complexity in the Heart of Software*. Boston, MA: Addison‑Wesley, 2003.

[12] Meta Open Source, *React 18 — Concurrent Rendering and Hooks*, React Documentation, 2023.

[13] E. You, *Vite — Next Generation Frontend Tooling*, Vite Documentation, 2023.

[14] Tailwind Labs, *Tailwind CSS — Utility‑First Framework*, Tailwind CSS Documentation, 2023.

[15] shadcn, *shadcn/ui — Re‑usable Components Built with Radix UI and Tailwind CSS*, Project Documentation, 2023.

[16] TanStack, *TanStack Query — Powerful Asynchronous State Management*, TanStack Documentation, 2023.

[17] Deno Land Inc., *Deno Runtime and Edge Functions — Documentation*, Deno Documentation, 2023.

[18] International Organization for Standardization, *ISO/IEC 27001:2022 — Information Security Management Systems*, ISO, Geneva, 2022.

[19] OWASP Foundation, *OWASP Top Ten — 2021 Edition*, Open Worldwide Application Security Project, 2021.

[20] A. Silberschatz, H. F. Korth and S. S. Sudarshan, *Database System Concepts*, 7th ed. New York, NY: McGraw‑Hill, 2020.

[21] I. Sommerville, *Software Engineering*, 10th ed. Harlow, UK: Pearson, 2015.

[22] R. S. Pressman and B. R. Maxim, *Software Engineering: A Practitioner's Approach*, 9th ed. New York, NY: McGraw‑Hill, 2020.

[23] K. Beck et al., *Manifesto for Agile Software Development*, agilemanifesto.org, 2001.

[24] K. Schwaber and J. Sutherland, *The Scrum Guide*, Scrum.org, 2020.

[25] A. R. Hevner, S. T. March, J. Park and S. Ram, "Design Science in Information Systems Research," *MIS Quarterly*, vol. 28, no. 1, pp. 75–105, March 2004.

[26] K. Peffers, T. Tuunanen, M. A. Rothenberger and S. Chatterjee, "A Design Science Research Methodology for Information Systems Research," *Journal of Management Information Systems*, vol. 24, no. 3, pp. 45–77, 2007.

[27] J. Nielsen, *Usability Engineering*. San Francisco, CA: Morgan Kaufmann, 1994.

[28] R. Fielding and J. Reschke, Eds., *Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content*, IETF RFC 7231, June 2014.

[29] M. Jones, J. Bradley and N. Sakimura, *JSON Web Token (JWT)*, IETF RFC 7519, May 2015.

[30] D. Hardt, Ed., *The OAuth 2.0 Authorization Framework*, IETF RFC 6749, October 2012.

[31] T. Dierks and E. Rescorla, *The Transport Layer Security (TLS) Protocol, Version 1.3*, IETF RFC 8446, August 2018.

[32] World Wide Web Consortium, *Web Content Accessibility Guidelines (WCAG) 2.1*, W3C Recommendation, 2018.

[33] National Institute of Standards and Technology, *SP 800‑63B — Digital Identity Guidelines: Authentication and Lifecycle Management*, NIST, Gaithersburg, MD, 2020.

[34] National Institute of Standards and Technology, *SP 800‑162 — Guide to Attribute Based Access Control (ABAC) Definition and Considerations*, NIST, Gaithersburg, MD, 2014.

[35] European Union, *General Data Protection Regulation (GDPR)*, Regulation (EU) 2016/679, Official Journal of the European Union, 2016.

[36] National Telecommunications Commission of Sierra Leone (NATCOM), *Annual Sector Performance Report*, Freetown, 2023.

[37] Third Generation Partnership Project (3GPP), *TS 32.500 — Self‑Organizing Networks (SON); Concepts and Requirements*, 3GPP, 2022.

[38] International Telecommunication Union, *Recommendation E.800 — Definitions of terms related to quality of service*, ITU‑T, 2008.

[39] The PostgreSQL Global Development Group, *PostgreSQL 16 Documentation — Triggers and Trigger Procedures*, PostgreSQL Documentation, 2023.

[40] The PostgreSQL Global Development Group, *PostgreSQL 16 Documentation — SECURITY DEFINER and search_path*, PostgreSQL Documentation, 2023.

[41] PostgREST Community, *PostgREST — REST API from any Postgres database*, PostgREST Documentation, 2023.

[42] R. Kanneganti and P. Chodavarapu, *Service Oriented Java Business Integration*. Birmingham, UK: Packt, 2008.

[43] G. Booch, J. Rumbaugh and I. Jacobson, *The Unified Modeling Language User Guide*, 2nd ed. Boston, MA: Addison‑Wesley, 2005.

[44] Object Management Group, *Unified Modeling Language Specification 2.5.1*, OMG, 2017.

[45] E. Gamma, R. Helm, R. Johnson and J. Vlissides, *Design Patterns: Elements of Reusable Object‑Oriented Software*. Reading, MA: Addison‑Wesley, 1995.

[46] R. C. Martin, *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Upper Saddle River, NJ: Prentice Hall, 2017.

[47] World Wide Web Consortium, *Content Security Policy Level 3*, W3C Working Draft, 2023.

[48] OWASP Foundation, *OWASP Application Security Verification Standard (ASVS) v4.0.3*, Open Worldwide Application Security Project, 2021.

[49] Mozilla Developer Network, *Progressive Web Apps — Making PWAs installable*, MDN Web Docs, 2023.

[50] Mozilla Developer Network, *Using the Cache API*, MDN Web Docs, 2023.


# Appendices

The appendices reproduce the principal source artefacts of OrangeFlow SL in a form suitable for external review, discharging the requirement that the dissertation record the implementation in reproducible detail. Where an artefact exceeds a comfortable reading length, a representative excerpt is reproduced here and the full form is referenced by path in the repository.

## Appendix A — Database Schema and Enumerations

The domain vocabulary is closed under two enumerations:

```sql
CREATE TYPE public.app_role       AS ENUM ('planning_team', 'procurement_team', 'project_team');
CREATE TYPE public.site_status    AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.feedback_status AS ENUM ('pending', 'accepted', 'rejected');
```

The seven principal relations are defined in `supabase/migrations/20260212233307_*.sql`. The two workflow‑critical relations are reproduced here in full.

```sql
CREATE TABLE public.sites (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  site_name                TEXT NOT NULL,
  site_id_code             TEXT NOT NULL DEFAULT '',
  region                   TEXT NOT NULL DEFAULT '',
  district                 TEXT NOT NULL DEFAULT '',
  town                     TEXT NOT NULL DEFAULT '',
  address                  TEXT DEFAULT '',
  latitude                 DECIMAL,
  longitude                DECIMAL,
  site_type                TEXT DEFAULT '',
  terrain_type             TEXT DEFAULT '',
  access_road_condition    TEXT DEFAULT '',
  tower_type               TEXT DEFAULT '',
  tower_height             DECIMAL,
  antenna_type             TEXT DEFAULT '',
  number_of_antennas       INTEGER DEFAULT 0,
  power_source             TEXT DEFAULT '',
  backup_power             TEXT DEFAULT '',
  equipment_shelter        TEXT DEFAULT '',
  project_name             TEXT DEFAULT '',
  vendor_name              TEXT DEFAULT '',
  contractor_name          TEXT DEFAULT '',
  estimated_cost           DECIMAL,
  target_completion_date   DATE,
  site_photo_url           TEXT DEFAULT '',
  layout_plan_url          TEXT DEFAULT '',
  approval_letter_url      TEXT DEFAULT '',
  notes                    TEXT DEFAULT '',
  review_notes             TEXT DEFAULT '',
  status                   site_status NOT NULL DEFAULT 'pending',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.procurement_submissions (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id                         UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  submitted_by                    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by                     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  land_identified                 BOOLEAN NOT NULL DEFAULT false,
  land_identified_file_url        TEXT DEFAULT '',
  ownership_verified              BOOLEAN NOT NULL DEFAULT false,
  ownership_verified_file_url     TEXT DEFAULT '',
  acquisition_approved            BOOLEAN NOT NULL DEFAULT false,
  acquisition_approved_file_url   TEXT DEFAULT '',
  lease_negotiation               BOOLEAN NOT NULL DEFAULT false,
  lease_negotiation_file_url      TEXT DEFAULT '',
  lease_signed                    BOOLEAN NOT NULL DEFAULT false,
  lease_signed_file_url           TEXT DEFAULT '',
  lease_registration              BOOLEAN NOT NULL DEFAULT false,
  lease_registration_file_url     TEXT DEFAULT '',
  road_access                     BOOLEAN NOT NULL DEFAULT false,
  road_access_file_url            TEXT DEFAULT '',
  vendor_contract                 BOOLEAN NOT NULL DEFAULT false,
  vendor_contract_file_url        TEXT DEFAULT '',
  site_handover                   BOOLEAN NOT NULL DEFAULT false,
  site_handover_file_url          TEXT DEFAULT '',
  notes                           TEXT DEFAULT '',
  review_notes                    TEXT DEFAULT '',
  status                          site_status NOT NULL DEFAULT 'pending',
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The full schema, including `profiles`, `user_roles`, `procurement_feedback`, `notifications` and `activity_log`, is contained in the initial migration.

## Appendix B — Row‑Level Security Policies and Security Definer Functions

```sql
-- Role oracle: SECURITY DEFINER, STABLE, pinned search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

-- Defensive trigger against self‑escalation on user_roles
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

-- Sample policies (illustrative subset)
CREATE POLICY "Planning team can insert sites"
  ON public.sites FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'planning_team')
              AND auth.uid() = submitted_by);

CREATE POLICY "Admins can delete sites"
  ON public.sites FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'project_team'));

CREATE POLICY "Admins can view activity log"
  ON public.activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'project_team'));
```

Storage policies attached to `storage.objects` require both a path prefix match on the caller's `user_id` and the appropriate workflow role for `SELECT` and `INSERT` on the `site-documents` and `procurement-documents` buckets.

## Appendix C — Privileged Edge Function (User Management)

The `manage-users` Edge Function (`supabase/functions/manage-users/index.ts`) mediates account creation, role assignment and deactivation. The function verifies the caller's JWT, verifies that the caller holds the `project_team` role via `has_role`, and only then invokes the administrative Auth API with the service‑role key. The service‑role key is available exclusively inside the function's runtime environment; it is not present in the browser at any time. The full source is preserved in the repository and versioned with the rest of the code.

## Appendix D — Offline Queue and Synchronisation Hook

The offline queue is implemented in `src/lib/offlineQueue.ts` and consumed by `src/hooks/useOnlineSync.ts`. The queue writes each mutation to IndexedDB under a monotonically increasing key prefixed with `offline_queue_`; the synchronisation hook subscribes to the browser's `online` and `offline` events and, upon reconnection, iterates the queue in insertion order, applying each mutation and deleting successful entries. Failed entries are preserved for subsequent retry.

## Appendix E — Package Manifest (Runtime Dependencies)

The runtime dependency set is declared in `package.json` at the repository root. Principal entries include: `react` ^18, `react-dom` ^18, `react-router-dom` ^6, `@tanstack/react-query` ^5, `@supabase/supabase-js` ^2, `idb-keyval` ^6, `zod` ^3, `tailwindcss` ^3, `vite` ^5, `vite-plugin-pwa` ^0.20 and the shadcn/ui component set built over Radix UI primitives.

## Appendix F — Diagrams

The system architecture, use‑case, activity, flowchart, entity‑relationship and database‑schema diagrams referenced from Chapter Three are provided as fluid SVG files at the repository root (`system_architecture.svg`, `use_case_diagram.svg`, `activity_diagram.svg`, `system_flowchart.svg`, `entity_relationship_diagram.svg`, `database_schema.svg`) and mirrored under `public/dissertation/` for in‑application delivery through the `/dissertation` route.


# Viva Voce — Anticipated Questions and Model Answers

The following bank of forty questions covers the categories most commonly examined in a Bachelor of Engineering viva on an applied software‑engineering project: motivation and scope; requirements and methodology; architecture; database and security; offline behaviour; testing and evaluation; limitations; ethics; and personal contribution. Model answers are provided in a form suitable to be spoken aloud in three to six sentences.

---

### A. Motivation, Scope and Contribution

**Q1. In one paragraph, what problem does OrangeFlow SL solve, and for whom?**
OrangeFlow SL solves the coordination problem of Base Transceiver Station rollout at Orange Sierra Leone. Under the incumbent workflow, planning, procurement and project administration are coordinated through printed forms, scattered spreadsheet copies and instant‑messaging threads, producing version divergence, weak audit trails, absent role separation, poor field usability and no supervisory visibility. OrangeFlow SL replaces that with a single role‑based, mobile‑first Progressive Web Application backed by a database in which every user‑facing table is protected by Row‑Level Security.

**Q2. Why is this an engineering problem rather than a purely managerial one?**
Because the failure modes — version divergence, audit opacity, absent role separation, absent offline usability, absent real‑time visibility — are structural properties of the tool set in use, not of the people using it. Substituting management pressure for a coherent tool cannot close a version‑divergence gap; substituting a schema, RLS policies, an audit table and an offline queue can.

**Q3. What is your specific contribution?**
Three contributions: a working, evaluated reference implementation that jointly addresses BTS rollout, offline‑first delivery, database‑layer least privilege and signed‑URL document delivery; a concrete demonstration that RLS with a security‑definer role oracle is a sufficient RBAC enforcement point; and a documented end‑to‑end application of software‑engineering, database and security principles to a real operational problem.

**Q4. What is explicitly out of scope?**
Integration with the operator's finance, billing or network‑operations systems; native mobile applications distributed through public stores; automated field surveying; the radio‑network planning calculations themselves; and formal certification against national or international information‑security standards.

### B. Requirements and Methodology

**Q5. How did you elicit requirements?**
Through three methods: structured observation of the incumbent workflow, review of the printed forms and spreadsheet workbooks currently in use, and informal semi‑structured interviews with prospective users of each of the three intended roles. The interviews informed usability requirements; the observation and document review informed the schema and the state model.

**Q6. Why design‑science research?**
Because the deliverable of the study is an artefact — a working system — and design‑science is the paradigm whose evaluative canon addresses artefacts on their own terms. A purely descriptive paradigm would not have been able to accommodate the constructive activity at the centre of the study.

**Q7. Why iterative‑incremental development rather than waterfall?**
Because integration risk — particularly between RLS policies and the query patterns of the frontend — is exposed only at the boundary between tiers, and iterative delivery of vertically integrated slices exposes that risk early rather than at a big‑bang integration event.

**Q8. How did you decide when a requirement had been satisfied?**
Each functional requirement is paired with a role‑based end‑to‑end scenario against a live backend, and each non‑functional requirement with a specific measurement — negative testing for security, IndexedDB inspection for offline, viewport measurement for responsiveness. A requirement is satisfied when its scenario succeeds and its measurement holds.

### C. Architecture

**Q9. Why a three‑tier architecture?**
Because the three concerns — presentation, authenticated business logic and authoritative storage — are cleanly separable and are best expressed in different runtimes: a browser for presentation, an ephemeral serverless runtime for privileged logic and a durable database for storage. Coupling them would sacrifice both testability and security.

**Q10. Why a PWA rather than a native mobile app?**
Because the user population is small, internal and centrally controlled; because the application is form‑oriented and network‑bound rather than dependent on native device capabilities; because PWA delivery avoids two independent build pipelines and app‑store review latency; and because PWAs meet the installability and offline requirements that motivate a native app in the first place.

**Q11. Why the specific frontend stack — React 18, Vite, TypeScript, Tailwind, shadcn/ui, TanStack Query?**
React 18 for its concurrent rendering and mature ecosystem; Vite for near‑instant developer feedback; TypeScript for compile‑time verification of the interfaces between components and the backend types; Tailwind and shadcn/ui for a consistent, accessible component vocabulary; TanStack Query for cache management and periodic background refetch, which supplies the thirty‑second dashboard cadence without bespoke code.

**Q12. Why PostgreSQL specifically?**
Because Row‑Level Security is a first‑class database feature in PostgreSQL and is the mechanism through which the study's least‑privilege claim is discharged. A datastore without RLS would push access enforcement into application code, which is precisely the failure mode this study argues against.

### D. Database and Security

**Q13. Why hold roles in a separate `user_roles` table rather than as a column on `profiles`?**
Because role assignment is more security‑critical than profile editing, and separating the concerns permits distinct, tighter RLS policies to apply to `user_roles`. It also naturally accommodates multi‑role users if that becomes a requirement.

**Q14. What is a security‑definer function and why do you use one?**
A `SECURITY DEFINER` function executes under the authority of the function's owner rather than of the caller, and can therefore read tables the caller could not otherwise reach. `has_role` uses this to look up `user_roles` from inside RLS policies without triggering recursive policy evaluation on `user_roles` itself.

**Q15. How do you prevent privilege escalation via `user_roles`?**
Two layers. First, the insert, update and delete policies on `user_roles` admit only administrators. Second, defensively, a `BEFORE INSERT OR UPDATE` trigger `prevent_role_self_escalation` refuses any operation issued by a non‑administrator, so a future policy regression cannot silently open the escalation surface.

**Q16. Why do you `SET search_path = public` on your definer functions?**
To defeat a class of attack in which an attacker temporarily prepends a schema of their own to the session `search_path`, so that an unqualified reference inside the definer function resolves to attacker‑controlled objects. Pinning `search_path` inside the function makes the resolution deterministic.

**Q17. Why signed URLs rather than a proxied download endpoint?**
Signed URLs let the browser fetch the object directly from the storage service, so download bandwidth does not traverse the application server; access checks are concentrated at the moment of URL issuance, where the caller's identity and role are already known; and if a URL fragment leaks it expires within minutes.

**Q18. What is the concrete threat that route guards do *not* address?**
Route guards address usability: they prevent users from seeing screens they cannot use. They do not address security, because a determined caller can invoke the backend directly, bypassing the frontend entirely. Security is enforced at the database layer, where the caller cannot bypass it.

**Q19. Walk me through what happens when a Planning user tries to delete a site.**
The frontend does not surface a delete button on the Planning dashboard. If the user nevertheless issues a `DELETE` directly against PostgREST, the request reaches the database with the user's JWT. The RLS `DELETE` policy on `sites` requires `has_role(auth.uid(), 'project_team')`, which returns false. The database refuses the operation; the row remains; no data is lost.

**Q20. How do you handle passwords?**
Passwords are managed by the auth service, not by the application code. Leaked‑password protection is enabled, so passwords appearing in known breach corpora are refused at registration. The seed function generates strong random passwords rather than embedding them in source.

### E. Offline and Synchronisation

**Q21. What exactly happens when a user submits a site while offline?**
The mutation is serialised to IndexedDB under a key prefixed with `offline_queue_` and a monotonically increasing sequence number. The UI shows a pending indicator. When the browser next reports `online`, the synchronisation hook iterates the queue in insertion order, applies each mutation to the backend, and deletes the queue entry on success.

**Q22. What if two mutations depend on each other — a site create followed by a note on that site?**
Insertion order is preserved, so the site is created before the note is issued. If the create fails, the dependent mutation is not applied and remains on the queue for retry once the underlying cause is resolved.

**Q23. What if synchronisation is interrupted midway?**
Successfully applied entries have already been deleted from the queue; unapplied entries remain in insertion order. On next connectivity the sync resumes from where it stopped. No entry is silently discarded and no entry is applied twice.

**Q24. Could the client be tricked into submitting a mutation as another user via the offline queue?**
No. The queue holds payloads only; authentication is carried at replay time by the current session's JWT. A mutation captured under user A's session but replayed under user B's session will be evaluated against user B's role and will be refused by RLS if it does not qualify.

### F. Testing and Evaluation

**Q25. How did you verify security?**
Two ways. Migration‑level audit — inspection of the SQL policies themselves so that compliance is attached to the schema rather than to any particular version of the client code. And negative testing — for each protected table, an authenticated user in an unauthorised role attempted each of the four write operations, all of which were refused.

**Q26. Why is migration‑level audit important?**
Because policy compliance attached to the schema survives independently of the client. Any future regression in the frontend cannot silently expand the authority of any role, because the database will refuse the excess. This is a genuine multiplier on ongoing safety.

**Q27. What is negative testing?**
Testing that a system correctly refuses an operation it should not permit. In this study, an authenticated user in an unauthorised role was made to attempt every write against every protected table; each attempt was expected — and observed — to be refused.

**Q28. What did you measure for responsiveness?**
Three viewport widths — 390, 820 and 1440 CSS pixels — were rendered, and each was inspected for horizontal overflow, clipping and legibility of controls. The absence of horizontal overflow at every width is the operational criterion.

**Q29. How would you scale the evaluation to production traffic?**
By instrumenting representative endpoints for latency and error rate, by running a scripted load generator at the target concurrency, and by comparing measured latency against a service‑level objective agreed with the operator. This is signposted in Chapter Six as recommended further work.

### G. Limitations, Ethics and Reflection

**Q30. What are the principal limitations of the study?**
The evaluation was conducted against a live backend with authored scenarios rather than against a historical corpus of production records; load testing at operator‑scale concurrency was not performed; behaviour on legacy browsers below the modern evergreen baseline is not characterised; integration with the operator's downstream systems is out of scope; and formal external certification of the security posture was not undertaken.

**Q31. What are the ethical considerations?**
User data captured by the system is confined to what is operationally necessary; access is enforced at the database layer; documents are delivered exclusively through short‑lived signed URLs. Interviews used to inform usability requirements were conducted informally and no personally identifying information from them is reproduced in the dissertation.

**Q32. What would you do differently if you started over?**
I would introduce a small end‑to‑end test harness earlier in the schedule, so that RLS regressions could be caught by continuous integration rather than by manual verification. I would also decompose the largest React components into smaller units at first authoring rather than after the fact.

**Q33. What was the hardest technical decision?**
The choice to enforce access at the database layer rather than in a bespoke application server. It required investing in RLS discipline early, but paid off in the migration‑level audit strand of the security verification and in the confinement of the service role to a single Edge Function trusted‑code path.

### H. Domain and Broader Implications

**Q34. Why is this particularly relevant to Sierra Leone?**
Because BTS rollout is a live engineering activity across the country, because field connectivity cannot be assumed at candidate sites, and because the operator's audit posture and rollout throughput materially affect the pace of network expansion. The specific structural shape of the workflow — hand‑over between distinct roles, evidentiary upload, field capture under intermittent connectivity — is present in comparable coordination workflows in electricity, water and public works.

**Q35. Could this system be adopted by another operator or another sector?**
Yes, with modification. The three domain roles and the nine‑point checklist are specific to the studied workflow, but the architectural spine — PWA plus IndexedDB queue plus PostgreSQL with RLS plus signed‑URL storage — generalises to any small‑to‑medium coordination workflow of comparable structural shape.

**Q36. What is the single most defensible technical claim in the dissertation?**
That least‑privilege access is enforced at the database layer through RLS bound to a dedicated role table, and that this enforcement is verified at the migration level so that its compliance persists independently of any particular version of the client code.

### I. Personal Contribution

**Q37. What role did tooling play in the outcome, and what is the substance of your own contribution?**
Tooling accelerates typing but not thinking. The substance of the contribution — the choice of a three‑tier architecture with database‑layer access control, the design of the role oracle and self‑escalation trigger, the design of the offline queue, the elicitation of the requirements and the design of the four‑axis verification strategy — is the researcher's own, and would be equally substantive in any tool environment.

**Q38. Which parts of the codebase did you author personally?**
The full schema and all RLS policies, the security‑definer functions and the anti‑self‑escalation trigger, the offline queue and synchronisation hook, the auth context and route guard, the dashboard pages and the shared presentation components. The generated backend client module and the third‑party UI primitives are, of course, not authored by the researcher.

**Q39. If a supervisor asked you to defend one line of code, which would it be?**
The `SET search_path = public` clause on the `has_role` and `get_user_role` definer functions. It is small, easy to overlook, and its absence would open the functions to a schema‑poisoning attack. Its presence closes that class of attack deterministically.

**Q40. In one sentence, why does this dissertation matter?**
It demonstrates that a disciplined, small engineering effort — applied to a well‑characterised operational problem with correct choice of architectural primitives — can produce a system that substantively supersedes the manual workflow it replaces along every operational dimension examined.
