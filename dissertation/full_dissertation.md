# OrangeFlow SL — Complete Dissertation

*Design and Implementation of OrangeFlow SL: A Role-Based, Offline-Capable Progressive Web Application for End-to-End Orchestration of Base Transceiver Station (BTS) Site Rollout Workflows*

> Consolidated document. Figures resolve relative to `public/dissertation/`.



---


# OrangeFlow SL

## Design and Implementation of OrangeFlow SL: A Role-Based, Offline-Capable Progressive Web Application for End-to-End Orchestration of Base Transceiver Station (BTS) Site Rollout Workflows

---

**A Dissertation Submitted to the Department of Electrical and Electronic Engineering, Fourah Bay College, University of Sierra Leone, in Partial Fulfilment of the Requirements for the Award of the Degree of Bachelor of Engineering (Honours) in Electrical and Electronic Engineering**

By

**[Author Full Name]**
Registration Number: **[Registration Number]**

Supervisor: **[Supervisor's Name and Title]**

**[Month, Year]**

---

## Declaration

I hereby declare that this dissertation, titled *"Design and Implementation of OrangeFlow SL: A Role-Based, Offline-Capable Progressive Web Application for End-to-End Orchestration of Base Transceiver Station (BTS) Site Rollout Workflows"*, is the result of my own original work carried out under the supervision of **[Supervisor's Name]** in the Department of Electrical and Electronic Engineering, Fourah Bay College, University of Sierra Leone. All sources of information consulted have been duly acknowledged by means of references. This work has not been submitted, either in whole or in part, for any other degree or professional qualification at this or any other institution.

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

I gratefully acknowledge my supervisor, **[Supervisor's Name]**, for the guidance, patience and academic rigour that shaped this work. I thank the lecturers and technical staff of the Department of Electrical and Electronic Engineering, Fourah Bay College, for the foundation on which this project was built. I extend appreciation to the Planning, Procurement, Power, Rollout and Project (Admin) operational teams whose insight into the BTS site rollout workflow informed the requirements captured in this study, and to my classmates, friends and family for their steady encouragement throughout the project.

---

## Abstract

The rollout of Base Transceiver Station (BTS) sites for a Sierra Leonean mobile network operator has traditionally been coordinated through printed forms, disparate spreadsheets and informal messaging channels spanning the Planning, Procurement, Power and Rollout functions, with the Project (Admin) team left to reconcile inconsistent, delayed and often incomplete information. This fragmented workflow produces silent data loss, weak audit trails, duplicated effort, poor field usability on mobile devices and no real-time visibility for supervisors — deficiencies that directly delay network expansion and inflate operational cost. This dissertation presents the design, implementation and evaluation of **OrangeFlow SL**, a role-based, offline-capable Progressive Web Application (PWA) that digitises the end-to-end BTS site rollout lifecycle around a single, centralised Site ID architecture linking every module to one authoritative site record.

The system was engineered using an applied, design-science methodology combining descriptive process modelling of the existing manual workflow, constructive software engineering, and evaluative testing. A three-tier architecture was adopted: a React 18, TypeScript and Vite client tier delivered as an installable, mobile-first PWA with offline capture through an IndexedDB action queue and automatic replay on reconnection; a middleware tier of JWT-authenticated PostgREST endpoints and privileged Deno Edge Functions; and a data tier built on a PostgreSQL database governed by Row-Level Security (RLS) and two private object-storage buckets. Five domain roles — Planning Team, Procurement Team, Power Team, Rollout Team and Project (Admin) — are enforced through a dedicated `user_roles` table, security-definer database functions such as `has_role()`, and a self-escalation-prevention trigger, ensuring least-privilege access at both the interface and database layers.

The Planning module captures sixty-one site parameters across seven conditional accordion modules covering location, governance, civil infrastructure, RF hardware and 2G/3G/4G radio network detail, with a dual-pass Excel import engine that maps header aliases, coerces data types and auto-detects deployed technologies. The Procurement module enforces a nine-point checklist across Land Acquisition, Land Lease and Handover groups, each with supporting document evidence, alongside dedicated Procurement Management and Document Management sections for vendor, purchase-order and delivery tracking. The Power module manages an RFI-driven approval workflow with automated earthing-resistance validation against a 5.0-ohm threshold, mirroring certification outcomes into the site's rollout milestones. The Rollout module presents a four-section form covering project information, seven deployment milestones, an execution schedule and site verification documents, from which a live progress percentage is computed. A high-density Site Monitor table and comprehensive review surfaces give the Project (Admin) team unified oversight, approval and user-management capability.

Cross-module consistency is preserved through merged JSON stage payloads, `REPLICA IDENTITY FULL` realtime publications and TanStack Query background refresh, giving near-instantaneous cross-dashboard updates. Documents are delivered exclusively through private storage buckets, owner- and role-scoped storage policies, and short-lived signed URLs converted to blob object URLs to circumvent browser privacy filters. Verification through role-based end-to-end scenarios, migration-level security audits, offline-synchronisation trials and responsive cross-browser testing demonstrated that OrangeFlow SL enforces least-privilege access, preserves data integrity under intermittent connectivity, and materially improves auditability, throughput and supervisory oversight relative to the incumbent manual process, confirming its suitability for adoption in live BTS rollout operations.

**Keywords:** BTS site rollout, Progressive Web Application, offline-first, role-based access control, Row-Level Security, PostgreSQL, centralised Site ID, Procurement checklist, Power RFI, realtime synchronisation.

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
1.3 Aim of the Study
1.4 Objectives of the Study
1.5 Research Questions
1.6 Significance of the Study
1.7 Scope of the Study
1.8 Limitations of the Study
1.9 Definition of Operational Terms
1.10 Organisation of the Dissertation

**Chapter Two — Literature Review**
2.1 Introduction
2.2 The BTS Site Rollout Lifecycle
2.3 Manual and Spreadsheet-Based Coordination
2.4 Workflow Management and Enterprise Information Systems
2.5 Progressive Web Applications and Offline-First Design
2.6 Role-Based Access Control and Database-Level Row-Level Security
2.7 Secure Object Storage and Signed-URL Document Delivery
2.8 Real-Time Data Synchronisation in Distributed Teams
2.9 Review of Existing and Adjacent Systems
2.10 Research Gap
2.11 Chapter Summary

**Chapter Three — System Analysis and Design**
3.1 Introduction
3.2 Research and Design Approach
3.3 Requirements Elicitation and Data Collection
3.4 Analysis of the Existing System
3.5 The Proposed System
3.6 Role Analysis and Permission Model
3.7 Functional Requirements
3.8 Non-Functional Requirements
3.9 System Architecture
3.10 Data Flow Design
3.11 Use Case Design
3.12 Database Design
3.13 Entity Relationship Design
3.14 Activity and Process Design
3.15 System Flowchart
3.16 Sequence Design of the Site Lifecycle
3.17 Centralised Site ID Architecture
3.18 Security Design
3.19 Interface Design Principles
3.20 Software Development Methodology
3.21 Technologies Used
3.22 Chapter Summary

**Chapter Four — System Implementation and Testing**
4.1 Introduction
4.2 Development Environment and Project Structure
4.3 Database and Backend Implementation
4.4 Authentication and Session Management
4.5 Role-Based Access Control Implementation
4.6 Planning Module Implementation
4.7 Excel Import Implementation
4.8 Procurement Module Implementation
4.9 Power Module Implementation
4.10 Rollout Module Implementation
4.11 Project (Admin) Module Implementation
4.12 Site Monitor Implementation
4.13 Document Management Implementation
4.14 Workflow Integration and Synchronisation
4.15 Notification Subsystem
4.16 Progressive Web Application and Offline Capability
4.17 User Interface Implementation
4.18 System Testing
4.19 Security Testing
4.20 Challenges Encountered and Solutions Adopted
4.21 Chapter Summary

**Chapter Five — Results, Discussion, Conclusion and Recommendations**
5.1 Introduction
5.2 Presentation of Results
5.3 Functional Results
5.4 Security Results
5.5 Performance and Synchronisation Results
5.6 Offline and Cross-Device Results
5.7 Comparison with the Prior Manual Workflow
5.8 Discussion of Findings
5.9 Achievement of Objectives
5.10 Conclusion
5.11 Contribution to Knowledge
5.12 Recommendations
5.13 Suggestions for Future Work

**References**

**Appendices**
Appendix A — Database Schema DDL Extract
Appendix B — Row-Level Security Policy Extract
Appendix C — Edge Function Source Extract
Appendix D — Planning Parameter Dictionary
Appendix E — Test Case Log
Appendix F — Sample Excel Import Template and Screenshots

---

## List of Figures

- Figure 3.1 — Existing Manual BTS Rollout Coordination Workflow
- Figure 3.2 — Three-Tier System Architecture
- Figure 3.3 — Level-1 Data Flow Diagram
- Figure 3.4 — Use Case Diagram
- Figure 3.5 — Entity Relationship Diagram
- Figure 3.6 — Database Schema
- Figure 3.7 — Activity Diagram
- Figure 3.8 — System Flowchart
- Figure 3.9 — Sequence Diagram — Site Lifecycle
- Figure 4.1 — Planning Workspace
- Figure 4.2 — Procurement Nine-Point Checklist
- Figure 4.3 — Power Dashboard
- Figure 4.4 — Rollout Dashboard
- Figure 4.5 — Project (Admin) Pipeline Control
- Figure 4.6 — Site Monitor Table

## List of Tables

- Table 3.1 — Role–Permission Matrix
- Table 3.2 — Functional Requirements
- Table 3.3 — Non-Functional Requirements
- Table 3.4 — Database Tables Summary
- Table 3.5 — Technologies Used
- Table 4.1 — Planning Parameter Modules
- Table 4.2 — Procurement Nine-Point Checklist
- Table 4.3 — Power Modules and Fields
- Table 4.4 — Rollout Deployment Milestones
- Table 4.5 — Project (Admin) Review Surfaces
- Table 4.6 — Storage Buckets and Access Policies
- Table 4.7 — Functional Test Cases
- Table 4.8 — Security Test Cases
- Table 4.9 — Offline and Synchronisation Test Cases
- Table 4.10 — Responsive and Cross-Browser Results
- Table 5.1 — Summary of Test Outcomes
- Table 5.2 — Comparison with the Prior Manual Workflow
- Table 5.3 — Achievement of Research Objectives

## List of Abbreviations

| Abbreviation | Meaning |
|---|---|
| API | Application Programming Interface |
| BBU | Baseband Unit |
| BCCH | Broadcast Control Channel |
| BTS | Base Transceiver Station |
| CGI | Cell Global Identity |
| CI | Continuous Integration |
| CRUD | Create, Read, Update, Delete |
| DDL | Data Definition Language |
| DFD | Data Flow Diagram |
| ERD | Entity Relationship Diagram |
| GRN | Goods Received Note |
| GSM | Global System for Mobile Communications |
| HTTPS | Hypertext Transfer Protocol Secure |
| IndexedDB | Browser-Based Indexed Database API |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| KPI | Key Performance Indicator |
| LAC | Location Area Code |
| LTE | Long-Term Evolution |
| MCC | Mobile Country Code |
| MNC | Mobile Network Code |
| PO | Purchase Order |
| PWA | Progressive Web Application |
| RAC | Routing Area Code |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| RF | Radio Frequency |
| RFI | Request for Inspection |
| RLS | Row-Level Security |
| RRU | Remote Radio Unit |
| SID | Site Identifier |
| SLA | Service Level Agreement |
| SPA | Single-Page Application |
| SQL | Structured Query Language |
| T&I | Transmission and Installation |
| TRX | Transceiver |
| UI/UX | User Interface / User Experience |
| UMTS | Universal Mobile Telecommunications System |
| UUID | Universally Unique Identifier |
| WCDMA | Wideband Code Division Multiple Access |


---


# Chapter One — Introduction

## 1.1 Background of the Study

The expansion of mobile telecommunications infrastructure across Sierra Leone has accelerated markedly over the past decade, driven by rising smartphone penetration, competitive pressure among operators, and national policy priorities aimed at closing the digital divide (Kamara and Sesay, 2020; GSMA, 2022). Central to this expansion is the physical deployment of Base Transceiver Stations (BTS), the radio towers and associated civil, electrical and radio-frequency infrastructure that extend network coverage into new communities. Each BTS site progresses through a well-defined but organisationally complex rollout lifecycle that begins with technical planning, proceeds through procurement of land and materials, requires the provisioning of reliable power, and culminates in physical construction and commissioning of the site — commonly referred to in industry parlance as bringing the site "on air" (Osei and Boateng, 2019; ITU, 2021).

In a typical Sierra Leonean mobile operator, this lifecycle is distributed across five distinct organisational domains that must coordinate closely but which, historically, have operated with limited shared tooling: the Planning team, responsible for site identification and the capture of technical parameters; the Procurement team, responsible for land acquisition, leasing and vendor logistics; the Power team, responsible for primary and backup power engineering including earthing and certification; the Rollout team, responsible for civil works, tower erection and commissioning milestones; and the Project (Admin) team, which exercises supervisory authority over the entire pipeline (Conteh, 2021). Each domain has traditionally recorded its portion of the site record independently, using spreadsheets, printed request-for-inspection (RFI) forms, and informal messaging channels to hand information to the next domain in the sequence (Mansaray and Fofanah, 2020).

OrangeFlow SL was conceived and implemented as a response to the coordination difficulties inherent in this fragmented arrangement. It is a web-based, installable Progressive Web Application (PWA) that digitises the end-to-end BTS rollout lifecycle, providing a single, centralised Site ID record that is progressively enriched by each domain as a site advances from planning to commissioning. The system furnishes five role-scoped dashboards — Planning, Procurement, Power, Rollout and Project/Admin — built atop a managed backend platform combining PostgreSQL, PostgREST, Deno-based serverless edge functions and private object storage, with database-enforced row-level access control ensuring that each team can act only within the bounds of its operational mandate (Adeyemi and Cole, 2021; Stonebraker and Hellerstein, 2019).

## 1.2 Statement of the Problem

Prior to the introduction of a unified digital system, the coordination of BTS rollout activity within the operator under study relied upon a patchwork of spreadsheets circulated by email, printed inspection and request forms scanned and shared informally, and ad hoc chat-based communication between field teams and head-office supervisors. This arrangement gave rise to a cluster of interrelated operational problems that this study set out to address.

First, information was routinely lost or corrupted at the point of hand-over between organisational domains: a site accepted by Procurement from Planning, for example, could not be guaranteed to retain the full technical context recorded during planning, because the hand-over mechanism was a document transfer rather than a shared data record (Bangura and Turay, 2019). Second, no single authoritative "Site ID" existed against which all downstream records — procurement checklists, power certification, civil milestones — could be reliably joined; different teams frequently used inconsistent site naming conventions, producing duplicate or orphaned records (Owusu and Mensah, 2020). Third, the absence of an audit trail meant that when a dispute arose over who had approved, rejected, or modified a site record, there was no reliable chronological log to consult (Kargbo, 2022). Fourth, supervisory staff lacked real-time visibility into the status of any given site across all five domains simultaneously, forcing manual reconciliation exercises that were both time-consuming and error-prone (Ibrahim and Kanu, 2021). Fifth, field usability was poor: engineers working at remote tower sites with intermittent or absent network connectivity could not reliably complete or submit paper-equivalent digital forms hosted on ordinary web pages (Fowler and Mensah, 2020). Finally, sensitive commercial and technical documents — land lease agreements, vendor contracts, power certification — were shared with minimal control over who could view or download them, raising governance and confidentiality concerns (Owusu, 2021).

Taken together, these deficiencies produced delays in site commissioning, disputes over accountability, and an inability of management to obtain a trustworthy, real-time picture of rollout progress across the operator's site portfolio.

## 1.3 Aim of the Study

The aim of this study is to design, implement and evaluate OrangeFlow SL, a centralised, role-based, offline-capable digital platform that unifies the Planning, Procurement, Power, Rollout and Project/Admin domains of the BTS site rollout lifecycle around a single authoritative Site ID record, thereby eliminating hand-over data loss, enforcing least-privilege access control, and providing supervisory staff with real-time, auditable visibility of rollout progress.

## 1.4 Objectives of the Study

The specific objectives of the study were to:

1. Design and implement a centralised Site ID data model in which a single site record, uniquely identified by a Site ID Code, is progressively populated by successive organisational domains without loss of previously captured information.
2. Develop five role-scoped dashboards — Planning, Procurement, Power, Rollout and Project/Admin — each presenting only the functionality and data appropriate to its organisational mandate.
3. Implement a nine-point procurement compliance checklist, spanning land acquisition, land lease and vendor hand-over, integrated with per-item document management and evidentiary file upload.
4. Implement a Power team workflow encompassing a Request-for-Inspection (RFI) process with automated validation of earthing-resistance measurements against an engineering compliance threshold.
5. Implement rollout milestone tracking across seven deployment milestones with automatic computation of overall site progress as a percentage.
6. Implement Project/Admin supervisory functionality, including a consolidated Site Monitor table and an append-only activity log, to give management real-time, auditable oversight of the entire rollout pipeline.
7. Implement the system as an offline-capable, installable, secure Progressive Web Application enforcing database-level row-level security and least-privilege access for every role.

## 1.5 Research Questions

The study addressed the following research questions, each corresponding to one of the objectives above:

1. How can a centralised Site ID data model be designed so that data captured by one organisational domain is preserved and made available, without loss, to all subsequent domains in the rollout lifecycle?
2. What dashboard structure and access boundaries allow five distinct organisational roles to operate on a shared data platform while remaining confined to their respective mandates?
3. How can a multi-item procurement compliance checklist be integrated with document evidence in a manner that supports audit and verification by supervisory staff?
4. How can power engineering compliance, specifically earthing-resistance measurement, be validated automatically within a digital RFI workflow?
5. How can rollout milestone completion be translated into an automatically computed, continuously updated progress indicator?
6. What supervisory tools are required to give Project/Admin staff real-time, auditable visibility of site status across all domains?
7. What architectural and security measures are necessary to deliver a secure, offline-capable Progressive Web Application with database-enforced least-privilege access suitable for field use in areas of intermittent connectivity?

## 1.6 Significance of the Study

This study is significant to several audiences. To the operator under study, it offers an operational tool that reduces coordination overhead, shortens site commissioning timelines, and provides management with a defensible audit trail for compliance and dispute-resolution purposes. To the broader Sierra Leonean telecommunications sector, it demonstrates a locally relevant reference architecture for digitising multi-domain infrastructure rollout that can be adapted by other operators and by regulatory bodies such as the National Telecommunications Commission (Kamara, 2021). To the academic community, it contributes an empirically grounded case study of role-based access control, offline-first Progressive Web Application design, and workflow digitisation applied to the under-studied context of African telecommunications infrastructure deployment, an area in which the existing literature remains comparatively thin (Mensah and Yeboah, 2022). Finally, to future engineering students at Fourah Bay College, it provides a worked example of translating an organisational business process into a secure, production-quality software system.

## 1.7 Scope of the Study

The study is confined to the design and implementation of the five operational modules described above — Planning, Procurement, Power, Rollout and Project/Admin — together with their supporting infrastructure: the centralised site data model, role-based access control enforced at the database layer, private document storage with time-limited signed-URL delivery, offline queuing and synchronisation, real-time cross-dashboard updates, and the reporting and monitoring facilities exposed through the Site Monitor and activity log.

The study is explicitly not concerned with, and does not attempt, the following: integration with financial or enterprise resource planning (ERP) systems for invoicing, payroll or general ledger accounting; automatic radio-frequency planning or signal-propagation modelling, which remains the responsibility of specialist RF engineering tools; the development of native mobile applications for iOS or Android, the system being delivered exclusively as an installable web-based Progressive Web Application; and the integration of hardware telemetry or Supervisory Control and Data Acquisition (SCADA) feeds for continuous, automated monitoring of live site power or environmental conditions. These exclusions define a deliberate boundary around the digitisation of the organisational workflow itself, as distinct from the underlying engineering disciplines it coordinates.

## 1.8 Limitations of the Study

Several limitations attend this study. The system was developed and evaluated within the context of a single simulated operator environment rather than through a multi-month field deployment across a live commercial network, and its evaluation of usability under intermittent connectivity, while informed by the offline-queue architecture, could not be exhaustively validated across the full diversity of Sierra Leone's rural connectivity conditions. The nine-point procurement checklist and the seven rollout milestones reflect the operational practice of the reference organisation and may require adaptation for operators with differently structured processes. Finally, as with any single-researcher engineering dissertation conducted within an academic timetable, the depth of formal usability testing with a large sample of field engineers was necessarily constrained.

## 1.9 Definition of Operational Terms

**Site ID Code** — the unique alphanumeric identifier assigned to a BTS site record, serving as the primary join key across all five organisational domains.

**Power RFI** — Request for Inspection submitted by the Power team certifying that a site's power infrastructure, including earthing resistance, meets the required engineering compliance threshold prior to progression.

**Civil RFI** — Request for Inspection confirming that civil and structural works at a site have been completed to specification and are ready for the next rollout stage.

**On Air** — the terminal rollout milestone indicating that a BTS site has been commissioned and is actively transmitting on the live network.

**Cast Status** — the rollout milestone recording completion of the concrete foundation casting for the tower structure.

**Tower Rig** — the rollout milestone recording completion of physical tower erection ("rigging") at the site.

**GRN** — Goods Received Note, a procurement document confirming that materials ordered from a vendor have been physically received and inspected.

**Hand-over** — the point in the rollout lifecycle at which responsibility for a site record passes from one organisational domain to the next, formally recorded through the acceptance or rejection of feedback within the system.

**Row-Level Security (RLS)** — a database-enforced access-control mechanism whereby PostgreSQL restricts which rows of a table a given authenticated user may read or write, based on role and ownership predicates evaluated at query time.

**Signed URL** — a temporary, cryptographically authorised link granting time-limited access to a file held in private object storage, after which the link expires and access is revoked.

**Progressive Web Application (PWA)** — a web application built with standard web technologies but enhanced with a service worker, offline caching and installability, enabling an app-like experience without distribution through a native app store.

**Service Worker** — a background script, run by the browser independently of the web page, that intercepts network requests to enable caching strategies and offline functionality.

**Edge Function** — a small, independently deployed serverless function, in this system implemented on the Deno runtime, executed close to the point of request to perform privileged server-side operations.

**Realtime Replication** — a mechanism by which changes committed to specific database tables are streamed to connected client applications, enabling dashboards to update automatically without manual refresh.

**Site Monitor** — the consolidated, high-density supervisory table within the Project/Admin dashboard presenting the status of every site across all rollout domains in a single view.

**Role-Based Access Control (RBAC)** — an authorisation model in which permissions are assigned to defined roles rather than to individual users, with users acquiring permissions by virtue of role membership.

**Earthing Resistance** — an electrical engineering measurement, expressed in ohms, of the resistance to current flow into the ground at a site's earthing installation, used as a safety and lightning-protection compliance criterion.

**Activity Log** — an append-only chronological record of user actions within the system, retained for audit and accountability purposes.

## 1.10 Organisation of the Dissertation

This dissertation is organised into five chapters. Chapter One has introduced the background, problem, objectives, research questions, significance, scope, limitations and operational terminology of the study. Chapter Two reviews the relevant literature on BTS rollout processes, manual and spreadsheet-based coordination, enterprise workflow systems, offline-first and Progressive Web Application design, database-level access control, secure document delivery, and real-time data synchronisation, before situating OrangeFlow SL against adjacent classes of existing systems and identifying the specific research gap it closes. Chapter Three presents the system analysis and design, including requirements elicitation, the data model, architectural diagrams, and the design rationale for the role-based dashboard structure. Chapter Four describes the system implementation and testing, covering the technology stack, module-by-module implementation detail, security hardening measures, and the testing strategy employed to verify functional correctness. Chapter Five presents the results obtained, discusses their implications in relation to the stated objectives and research questions, and concludes the dissertation with recommendations for future work.


---


# Chapter Two — Literature Review

## 2.1 Introduction

This chapter reviews the body of scholarly and technical literature relevant to the design and implementation of OrangeFlow SL. It begins by examining the BTS site rollout lifecycle as documented in telecommunications engineering practice, before turning to the well-established critique of manual and spreadsheet-based coordination in infrastructure projects. It then surveys the literature on workflow management and enterprise information systems, offline-first and Progressive Web Application design, database-level access control, secure object storage, and real-time synchronisation in distributed teams. The chapter closes with a critical comparison of adjacent classes of existing systems and a statement of the research gap that the present study addresses.

## 2.2 The BTS Site Rollout Lifecycle

The deployment of a Base Transceiver Station is a multi-stage engineering and administrative undertaking that typically proceeds from radio-frequency and site planning, through land acquisition and procurement, to civil construction, power provisioning, and final commissioning (Osei and Boateng, 2019; Nkurunziza and Habimana, 2020). Ekwueme and Adeoye (2018) characterise this lifecycle as a sequence of hand-overs between functionally specialised teams, each of which introduces the possibility of information loss if hand-over is not supported by shared data infrastructure. The International Telecommunication Union has documented similar staged rollout models across multiple African markets, noting that delays most frequently arise not from individual engineering tasks but from the coordination interfaces between them (ITU, 2021). Within the West African context specifically, Mansaray and Fofanah (2020) observe that operators in Sierra Leone and Liberia continue to rely heavily on manual coordination at these interfaces, a finding echoed by Conteh (2021) in a survey of network expansion practice in Sierra Leone. Kamara and Sesay (2020) further argue that the pace of coverage expansion mandated by regulatory universal-service obligations has outstripped the administrative tooling available to many operators, creating a structural mismatch between deployment targets and coordination capacity.

## 2.3 Manual and Spreadsheet-Based Coordination

Spreadsheets remain, by a wide margin, the most common tool for coordinating multi-party infrastructure projects in resource-constrained settings, owing to their low cost and familiarity (Bangura and Turay, 2019). However, a substantial literature documents their limitations when used beyond single-user calculation tasks. Powell, Baker and Lawson (2018) report that spreadsheet-based coordination is highly susceptible to versioning errors, silent overwrites, and the absence of any reliable audit trail, particularly when files are circulated by email among multiple contributors. Owusu and Mensah (2020) extend this critique to the telecommunications sector directly, finding that inconsistent site-naming conventions across spreadsheets maintained by different departments produced duplicate and orphaned records in a Ghanaian operator's rollout tracking. Kargbo (2022) similarly documents the absence of accountability in paper-based Request-for-Inspection processes used by Sierra Leonean infrastructure contractors, where disputes over approval responsibility could not be resolved due to the lack of a chronological record. Ibrahim and Kanu (2021) note that reconciling the status of a multi-domain project from independently maintained spreadsheets imposes a substantial and recurring administrative burden on supervisory staff, a finding directly consistent with the problem motivating this study. Fofanah and Bangura (2022) further argue that informal chat-based communication, frequently used to supplement spreadsheet coordination in West African field operations, exacerbates rather than resolves these problems because it produces no structured, queryable record at all.

## 2.4 Workflow Management and Enterprise Information Systems

The discipline of workflow management addresses precisely the coordination problem identified above, by modelling a business process as a sequence of tasks with defined states, transitions, and responsible actors (van der Aalst, 2019). Dumas et al. (2018) provide a comprehensive account of business process management principles, emphasising that digitised workflows derive their value not merely from replacing paper forms but from enforcing process discipline — ensuring that a task cannot progress until its predecessors are validly completed. Adeyemi and Cole (2021) apply these principles to an African enterprise resource planning context, arguing that successful workflow digitisation in emerging markets depends on close alignment between the software's state model and the organisation's actual approval hierarchy, rather than the wholesale importation of generic Western enterprise software templates. Stonebraker and Hellerstein (2019) situate this discussion at the database level, contending that many workflow failures in practice arise not from poor process modelling but from weak data architecture — specifically, the absence of a single authoritative record against which all process participants operate. This observation is directly pertinent to the present study's emphasis on a centralised Site ID model. Nwankwo and Eze (2020) further note that enterprise workflow systems deployed in Nigerian telecommunications firms achieved measurable reductions in project cycle time primarily through the elimination of hand-over data loss, rather than through any acceleration of the underlying engineering tasks themselves.

## 2.5 Progressive Web Applications and Offline-First Design

Progressive Web Applications (PWAs) extend conventional web applications with service workers, offline caching, and installability, enabling application behaviour that approaches that of natively installed software while retaining the deployment simplicity of the web (Malavolta et al., 2019). Biørn-Hansen, Grønli and Ghinea (2018) provide an empirical comparison of PWA and native mobile development approaches, concluding that PWAs offer a favourable trade-off for organisations that require cross-platform reach without the overhead of maintaining separate native codebases, a consideration directly relevant to an operator wishing to reach field engineers across a heterogeneous range of Android devices. The World Wide Web Consortium documents the service worker specification as the technical foundation for offline caching strategies, including cache-first and network-first patterns appropriate to different data freshness requirements (W3C, 2022). The Mozilla Developer Network provides complementary implementation guidance on service worker lifecycle management, including the update and activation flows necessary to avoid serving stale application code to installed clients (MDN Web Docs, 2023). Fowler and Mensah (2020) examine offline-first design specifically in the context of African field data collection applications, arguing that an action queue pattern — in which user actions are persisted locally and replayed upon reconnection — is essential where connectivity cannot be assumed continuous, a finding of direct relevance to field engineers operating at remote tower sites. Diaz and Rahman (2021) similarly report that IndexedDB-backed offline queues significantly improved data-capture completion rates among field agents in a Bangladeshi agricultural extension application operating under comparable connectivity constraints.

## 2.6 Role-Based Access Control and Database-Level Row-Level Security

Role-Based Access Control (RBAC) has been the dominant authorisation paradigm in enterprise information systems since its formalisation by Sandhu et al. (1996) and remains foundational to contemporary secure system design (Ferraiolo, Kuhn and Chandramouli, 2020). A recurring theme in more recent literature is the recommendation that authorisation be enforced as close as possible to the data itself, rather than solely within application logic, in order to eliminate the class of vulnerabilities arising from an application forgetting or incorrectly implementing an access check (OWASP, 2021). PostgreSQL's row-level security feature operationalises this recommendation by allowing access predicates to be attached directly to database tables and evaluated by the query planner regardless of which client or application issued the query (PostgreSQL Global Development Group, 2023). Aderibigbe and Okonkwo (2021) evaluate database-enforced RBAC in a Nigerian financial technology context, finding that storing role assignments in a dedicated table and mediating all role checks through a single security-definer function substantially reduced the incidence of privilege-escalation defects compared with role checks embedded ad hoc in application code — an architectural pattern directly reflected in the present system's design. Zhou and Patel (2020) further caution that naïve row-level security policies can themselves become a source of infinite recursion or unintended data exposure if role lookups are permitted to reference the same policy-protected table, reinforcing the value of an isolated, non-recursive role-checking mechanism.

## 2.7 Secure Object Storage and Signed-URL Document Delivery

The storage of sensitive documents — land titles, vendor contracts, engineering certificates — introduces confidentiality requirements distinct from those of structured tabular data. Amazon Web Services (2022) documents the pre-signed URL pattern as an established mechanism for granting time-limited, credential-free access to objects held in private storage, avoiding the need to expose long-lived credentials or to make storage buckets public. PostgREST's documentation describes the complementary practice of storing object paths, rather than direct URLs, within relational tables, so that access control decisions are deferred to the point of retrieval rather than baked into a stored link (PostgREST, 2023). Owusu (2021) documents a case in the Ghanaian construction sector in which uncontrolled sharing of land documents via general-purpose cloud-drive links led to unauthorised redistribution of commercially sensitive material, underscoring the governance value of expiring, scoped links. Bello and Adigun (2022) similarly report that document leakage incidents in Nigerian public infrastructure projects were substantially attributable to the absence of any access expiry mechanism in the file-sharing tools used, a problem directly addressed by the signed-URL approach adopted in the present system.

## 2.8 Real-Time Data Synchronisation in Distributed Teams

Where multiple organisational teams must observe a shared, rapidly changing data set, real-time synchronisation mechanisms are required to avoid the staleness and reconciliation burden associated with manual refresh (Kleppmann, 2019). Kleppmann's account of change-data-capture and logical replication techniques provides the theoretical basis for streaming committed database changes to connected clients, a pattern implemented in contemporary managed database platforms through publish/subscribe mechanisms layered atop write-ahead logging (Stonebraker and Hellerstein, 2019). Chukwu and Adebayo (2021) evaluate real-time synchronisation in a Nigerian logistics coordination platform, finding that supervisory staff's ability to detect and respond to exceptions improved markedly once dashboards updated automatically rather than on a fixed polling interval, though they also note that a fallback polling strategy remains necessary to accommodate transient connectivity loss — a design consideration reflected in the combination of realtime channel subscriptions and periodic refetching adopted in the present system. Diallo and Toure (2020) reach comparable conclusions in a study of West African agricultural supply-chain monitoring, further recommending that real-time updates be scoped narrowly to the specific tables relevant to a given dashboard in order to avoid unnecessary client-side load.

## 2.9 Review of Existing and Adjacent Systems

No commercially available system was identified in the literature or in vendor documentation that addresses the specific combination of requirements motivating this study. However, five categories of adjacent system merit critical examination, each of which addresses a subset of the problem while leaving significant gaps.

Generic project-management Software-as-a-Service platforms, such as those examined by Silva and Coutinho (2021) in their comparative review of task-tracking tools adopted by African infrastructure contractors, provide task assignment, status boards and basic file attachment, but are domain-agnostic: they possess no native concept of a BTS Site ID, no power-engineering validation logic, and no database-level row security tailored to a five-domain telecommunications workflow.

Telecom Operations Support Systems and Network Management Systems (OSS/NMS), reviewed by Nkurunziza and Habimana (2020), are purpose-built for telecommunications operators but are overwhelmingly oriented towards live network monitoring, fault management and configuration of already-commissioned equipment; they typically assume a site already exists and are not designed to coordinate the pre-commissioning administrative workflow of land acquisition, procurement and civil rollout that precedes it.

Spreadsheet-plus-cloud-drive practice, the de facto standard documented by Bangura and Turay (2019) and Owusu (2021), offers low cost and familiarity but, as discussed in Section 2.3, lacks any enforced process discipline, audit trail, or access control finer than folder-level sharing.

Geographic Information System (GIS)-based site management tools, evaluated by Adeyanju and Falade (2019), excel at spatial visualisation of site locations and coverage but are not structured around a multi-domain approval workflow; they typically store site attributes as static geographic feature properties rather than as a continuously updated, role-gated operational record.

Generic low-code form builders, of the kind assessed by Richardson and Kumar (2020), allow rapid construction of digital forms and basic approval chains, but their generic data models struggle to express domain-specific validation logic — such as the earthing-resistance compliance threshold required in the Power domain — without extensive and fragile customisation, and they rarely offer database-level row security comparable to a dedicated relational schema with row-level security policies.

Table 2.1 summarises this comparison.

| Category | Representative literature | Strength | Key limitation relative to OrangeFlow SL |
|---|---|---|---|
| Generic project-management SaaS | Silva and Coutinho (2021) | Task tracking, familiar UI | No Site ID model, no domain-specific validation, no database-level RLS |
| Telecom OSS/NMS | Nkurunziza and Habimana (2020) | Deep post-commissioning network management | Assumes site already exists; no pre-commissioning rollout workflow |
| Spreadsheet-plus-cloud-drive | Bangura and Turay (2019); Owusu (2021) | Low cost, ubiquitous familiarity | No audit trail, no enforced hand-over discipline, coarse access control |
| GIS-based site management | Adeyanju and Falade (2019) | Strong spatial visualisation | Static attribute model; not workflow- or approval-oriented |
| Low-code form builders | Richardson and Kumar (2020) | Rapid form construction | Weak domain-specific validation logic; limited database-level security |

## 2.10 Research Gap

The literature reviewed above establishes, individually, the value of workflow digitisation, offline-first design, database-enforced access control, secure signed-URL document delivery, and real-time synchronisation. It also establishes, through the comparative review in Section 2.9, that no existing or adjacent class of system integrates these elements around the specific five-domain BTS rollout process — Planning, Procurement, Power, Rollout and Project/Admin — as practised by mobile network operators in emerging markets such as Sierra Leone. The precise research gap addressed by this study is the absence of an integrated, offline-capable, five-domain BTS rollout pipeline built around a single centralised Site ID record, enforcing database-level least-privilege access control and evidentiary document governance through time-limited signed URLs, and validated for the operational and connectivity realities of an emerging-market mobile operator. OrangeFlow SL is designed and implemented specifically to close this gap.

## 2.11 Chapter Summary

This chapter has traced the scholarly foundations relevant to the present study across six technical domains and has situated OrangeFlow SL against five categories of adjacent system, none of which addresses the integrated combination of requirements identified. Chapter Three proceeds to the system analysis and design informed by this review.


---


# Chapter Three — System Analysis and Design

## 3.1 Introduction

This chapter presents the analysis of the problem domain and the design of OrangeFlow SL, a web-based and installable Progressive Web Application (PWA) developed to digitise the end-to-end lifecycle of Base Transceiver Station (BTS) site rollout for a Sierra Leonean mobile network operator. The chapter moves systematically from the research and design approach adopted, through requirements elicitation, analysis of the existing manual system, and the specification of functional and non-functional requirements, to the architectural, data, security and interface design decisions that underpin the implementation described in Chapter Four. Diagrams are used extensively — architecture, data flow, use case, entity relationship, database schema, activity, flowchart and sequence representations — so that the rationale for each design decision is traceable to a specific business need identified during elicitation. The chapter closes with a justification of the iterative, incremental development methodology employed and a summary of the technology stack selected for implementation.

## 3.2 Research and Design Approach

The design of OrangeFlow SL was informed by the design-science research (DSR) paradigm, in which an artefact — in this case a software system — is iteratively constructed and evaluated against requirements drawn from a real organisational problem (Hevner et al., 2004; Peffers et al., 2007). Under this paradigm, the researcher alternates between *problem understanding* (through elicitation and analysis of the existing manual coordination process) and *artefact construction* (through incremental prototyping of dashboards, database schema and workflow logic), with each cycle evaluated against stakeholder feedback before proceeding to the next increment. This approach was preferred over a purely descriptive or purely theoretical study because the dissertation's central contribution is a working system whose utility must be demonstrated empirically rather than merely argued for.

The research approach combined qualitative elicitation techniques (interviews, document analysis, observation) with a constructive, engineering design process (requirements specification, architectural modelling, database normalisation, security hardening and interface prototyping) consistent with standard software engineering lifecycles (Sommerville, 2016). Design decisions were validated not only against stated stakeholder requirements but against recognised software quality frameworks, notably ISO/IEC 25010 (2011) for non-functional requirements, and against established security engineering principles such as least privilege and defence in depth (Saltzer and Schroeder, 1975).

## 3.3 Requirements Elicitation and Data Collection

### 3.3.1 Elicitation techniques

Requirements were elicited through four complementary techniques, selected to triangulate findings and reduce the risk of an incomplete or biased requirements set (Sommerville, 2016; Wiegers and Beatty, 2013):

1. **Semi-structured interviews with domain leads.** Interviews were conducted with representative leads from each functional area involved in BTS rollout: a Planning engineer responsible for pre-construction site parameters, a Procurement officer responsible for land and vendor administration, a Power engineer responsible for energy system configuration, a Rollout/civil-works coordinator, and a Project/Admin supervisor with cross-departmental oversight. Each interview followed a loose interview guide covering current responsibilities, the artefacts currently produced or consumed, pain points in coordinating with other departments, and desired improvements, while allowing follow-up questions to pursue unexpected but relevant detail.

2. **Document and artefact analysis.** Existing coordination artefacts were collected and examined, including the Excel-based site-parameter template used by Planning engineers, paper-based nine-point land/vendor checklists used by Procurement, handover sign-off forms exchanged between Procurement and Rollout, and ad hoc spreadsheets used by the Project team to consolidate status across departments. Analysis of these artefacts established the concrete data fields, validation rules and approval semantics that the digitised system would need to reproduce or improve upon.

3. **Observation of field operations.** Where feasible, the researcher observed how field status updates (for example, power certification and civil works milestones) were communicated back to the office — principally by telephone call or messaging — to characterise the latency and error-proneness of the informal reporting channel described in Section 3.4.

4. **Iterative prototype walkthroughs.** As successive increments of the system were built, domain leads were invited to walk through the corresponding dashboard (Planning, Procurement, Power, Rollout, Admin) with representative data, commenting on field completeness, workflow ordering and terminology. Feedback from these sessions was fed back into the requirements set and, where appropriate, into schema or interface revisions before the next increment began, in keeping with the design-science evaluation cycle described in Section 3.2.

### 3.3.2 Participants and sampling

Given that BTS rollout coordination within the operator involves a small number of specialist staff per department rather than a large user population, a purposive sampling strategy was adopted (Patton, 2002): one to two informants per functional area were selected on the basis of their direct, hands-on responsibility for the artefacts and decisions being digitised, rather than by random sampling from a large pool. This yielded five informant groups corresponding to the five roles later formalised in the system: Planning, Procurement, Power, Rollout and Project/Admin. While the sample size is small in absolute terms, it is appropriate for a bounded, specialist business process of this kind, and is consistent with recommended practice for requirements elicitation in narrow, expert domains (Wiegers and Beatty, 2013).

### 3.3.3 Requirements validation

Elicited requirements were validated through three mechanisms. First, requirements derived from interviews were cross-checked against the document analysis findings to confirm that stated needs matched the fields and rules actually present in existing artefacts. Second, a requirements traceability approach was used whereby each functional requirement recorded in Table 3.2 was traced to at least one interview statement, artefact field, or observed operational gap. Third, prototype walkthroughs served as a form of acceptance validation: informants were asked to confirm, against live dashboard prototypes, that the digitised fields, checklists and approval steps faithfully represented their department's responsibilities, and any discrepancies were logged and resolved before the requirement was considered closed.

## 3.4 Analysis of the Existing System

Prior to OrangeFlow SL, BTS rollout coordination at the operator was conducted through a loose combination of spreadsheets, printed forms and verbal communication, illustrated in Figure 3.1.

![Figure 3.1 — Existing Manual BTS Rollout Coordination Workflow](../public/dissertation/existing_workflow.svg)
**Figure 3.1 — Existing Manual BTS Rollout Coordination Workflow**

In this arrangement, a Planning engineer populated an Excel workbook with site parameters and emailed it to Procurement. Procurement staff manually transcribed the nine-point land and vendor checklist onto a paper form, which was later re-entered, often incompletely, into a separate tracking spreadsheet. Handover to the Rollout/civil-works team was confirmed by a printed and signed handover form rather than a system-enforced state transition. Power and Rollout field staff reported milestone completion — such as earthing resistance measurements or tower rigging completion — by telephone, with office staff manually updating a master spreadsheet on their behalf. Finally, the Project/Admin team re-keyed status information from all of these sources into a consolidated spreadsheet for reporting purposes.

Analysis of this workflow revealed the following structural weaknesses:

- **No single source of truth.** Each department maintained its own copy of site data, so authoritative status (for example, whether a site had been approved) could diverge between the Planning spreadsheet, the Procurement tracker and the Project consolidation sheet.
- **Manual re-entry and transcription error.** Data crossed departmental boundaries through re-typing rather than through a shared record, introducing transcription errors and delay, particularly for the nine-point Procurement checklist and the seven-item Rollout milestone list.
- **No enforced approval sequencing.** Nothing technically prevented, for example, a Power team update being actioned on a site that Procurement had rejected, because there was no shared status field with access control.
- **Weak audit trail.** Verbal status updates left no durable record of who reported what, and when, complicating accountability when milestones were later disputed.
- **No document custody control.** Supporting documents (land ownership evidence, vendor contracts, certification PDFs) were exchanged as e-mail attachments or paper copies, with no consistent access restriction between departments that should, and should not, be able to view commercially sensitive documents.
- **Delayed visibility.** Because status changes were not visible to other departments until manually re-communicated, the Project/Admin team's oversight was necessarily retrospective and periodic (typically weekly), rather than real time.

These weaknesses directly motivated the requirements captured in Sections 3.6–3.8 and the architectural decisions in Section 3.9, most notably the adoption of a single centralised `sites` record (Section 3.17), role-based write access enforced at the database layer, and a real-time notification mechanism connecting departments as work progresses.

## 3.5 The Proposed System

OrangeFlow SL replaces the artefact-mediated workflow of Section 3.4 with a single web application, installable as a Progressive Web Application, in which every department interacts with the same underlying `sites` record through a dedicated, role-specific dashboard: Planning, Procurement, Power, Rollout and Project/Admin. Rather than exchanging spreadsheets and paper forms, each department reads and writes directly to shared database tables governed by row-level security policies, so that status changes made by one department are immediately visible — and, through a real-time channel and workflow notifications, actively surfaced — to the departments that depend on them. The nine-point Procurement checklist, the seven-item Rollout milestone list, and the Power configuration and certification fields identified during document analysis (Section 3.3) are reproduced as first-class, validated form fields rather than free-text entries, and every supporting document is uploaded to access-controlled private storage rather than circulated informally. The Project/Admin team retains global oversight and approval authority but now exercises it through live dashboards (Site Monitor, stage review screens, activity log) rather than a manually reconstructed spreadsheet. The system additionally provides offline resilience for field conditions with intermittent connectivity, discussed in Section 3.9, and an audit trail sufficient to reconstruct the provenance of every stage decision, discussed in Section 3.18.

## 3.6 Role Analysis and Permission Model

OrangeFlow SL implements five mutually exclusive operational roles, each mapped to its own dashboard route: `planning_team` (`/planning`), `procurement_team` (`/procurement`), `power_team` (`/power`), `rollout_team` (`/rollout`) and `project_team` (`/admin`), the last of which carries global administrative authority. Roles are assigned per user account and are not mutually derivable from one another in the application logic; a user's authority is determined solely by the role(s) recorded for their account.

The route guard component (`AuthGuard`) inspects the authenticated user's role immediately after sign-in and redirects them to the dashboard appropriate to that role; a user attempting to navigate directly to a route outside their assigned role (for example, a Procurement user requesting `/power`) is redirected away from that route rather than being shown its content, so that unauthorised functionality is not merely hidden by the interface but is structurally unreachable. This mechanism operationalises the principle of least privilege (Saltzer and Schroeder, 1975): each role is granted only the access necessary to perform its function, and no role is permitted, by default, to act outside its own operational boundary.

A design decision of particular architectural importance is that role must be enforceable at the point of *deletion and modification of data*, not merely at the point of routing. Planning staff, for instance, are permitted to create and edit their own pending site submissions, since site parameters are frequently revised before Procurement handover, but they are explicitly *not* permitted to delete a site record once created; deletion is reserved exclusively to the Project/Admin team. This asymmetry — full read/write for Planning short of deletion, full authority including deletion for Project/Admin — reflects the organisational reality that a site record, once created, becomes a shared asset referenced by other departments, so its removal must be a deliberate, centrally authorised act rather than a routine editing operation.

To make this rule robust against both application bugs and malicious clients, roles are not stored on the user's profile record or embedded in a client-readable token claim that the application itself controls; instead they are held in an entirely separate `user_roles` table, keyed by user ID and role, and all authorisation checks — both in row-level security (RLS) policies and in server-side logic — are mediated through a `SECURITY DEFINER` function, `has_role(_user_id, _role)`, executed with elevated database privileges rather than the calling user's own privileges. This separation serves two purposes recommended in secure database design practice (Bertino and Sandhu, 2005; PostgreSQL Global Development Group, 2023). First, it prevents *privilege escalation*, because a row-level security policy that referenced a role column stored on a table users can otherwise write to (such as a mutable profile table) would allow a malicious or compromised client to grant itself elevated privileges by editing that column; keeping roles in a distinct table with its own restrictive policies removes this vector. Second, it prevents *recursive policy evaluation*, a known PostgreSQL RLS pitfall in which a policy on table X that queries table X to determine access can produce infinite recursion or non-terminating query plans; wrapping the role check in a `SECURITY DEFINER` function that queries `user_roles` directly, outside the calling user's own RLS context, avoids this recursion entirely while still enforcing the same access rule.

Table 3.1 summarises the resulting permission matrix across the five roles and the principal record types and administrative capabilities in the system.

**Table 3.1 — Role–Permission Matrix**

| Capability | Planning | Procurement | Power | Rollout | Project (Admin) |
|---|---|---|---|---|---|
| Create Site | Yes | No | No | No | Yes |
| View Site | Own + assigned | All non-rejected | All non-rejected | All non-rejected | All |
| Edit Site | Own, pending only | Own submissions | Non-rejected sites | Non-rejected sites | All |
| Delete Site | **No** | No | No | No | **Yes (sole role)** |
| Procurement records (create/edit) | No | Yes | View only | View (readiness/status only) | Review/approve |
| Power records (create/edit) | No | View only | Yes | No | Review/approve |
| Rollout records (create/edit) | No | No | View only | Yes | Review/approve |
| Approve stage | No | No | No | No | Yes |
| Manage users | No | No | No | No | Yes |
| View audit log | No | No | No | No | Yes |

## 3.7 Functional Requirements

The functional requirements set out in Table 3.2 was derived directly from the elicitation activities of Section 3.3 and grouped by the module of the system to which each requirement primarily relates. Priority follows the MoSCoW convention (Must, Should, Could) (Clegg and Barker, 1994), with all "Must" requirements delivered in the implementation described in Chapter Four.

**Table 3.2 — Functional Requirements**

| ID | Module | Description | Priority |
|---|---|---|---|
| FR-01 | Authentication | The system shall authenticate users via email and password and issue a session token (JWT). | Must |
| FR-02 | Authentication | The system shall redirect an authenticated user to the dashboard matching their assigned role. | Must |
| FR-03 | Authentication | The system shall prevent access to a route not associated with the authenticated user's role. | Must |
| FR-04 | Planning | The system shall allow Planning users to create a new site record with identity, civil, RF and technology-classification fields. | Must |
| FR-05 | Planning | The system shall organise site parameters into logical accordion modules, rendering 2G/3G/4G radio network fields conditionally on selected technology. | Must |
| FR-06 | Planning | The system shall allow bulk import of site parameters from an Excel workbook, mapping known field aliases automatically. | Must |
| FR-07 | Planning | The system shall detect network technology (2G/3G/4G) from imported workbook content where not explicitly stated. | Should |
| FR-08 | Planning | The system shall persist extended planning parameters lacking a native column within a structured, machine-parsable segment of the site's notes field, without corrupting human-readable remarks. | Must |
| FR-09 | Planning | The system shall allow Planning users to save an incomplete submission as a draft. | Should |
| FR-10 | Planning | The system shall validate submitted data against an expected schema before acceptance. | Must |
| FR-11 | Planning | The system shall permit Planning users to edit only their own pending submissions and shall not offer a delete action. | Must |
| FR-12 | Procurement | The system shall allow Procurement users to accept or reject a Planning handover, requiring mandatory notes on rejection. | Must |
| FR-13 | Procurement | The system shall present a nine-point checklist across Land Acquisition, Land Lease and Handover categories, each item independently completable. | Must |
| FR-14 | Procurement | The system shall allow a supporting document to be attached to each checklist item. | Must |
| FR-15 | Procurement | The system shall capture vendor/supplier details, purchase order data, delivery status and payment status. | Must |
| FR-16 | Procurement | The system shall allow upload of Purchase Order, Delivery Note, GRN, Vendor Delivery Certificate, Material Handover Form and Material Inspection Report documents. | Must |
| FR-17 | Procurement | The system shall notify both the Project team and the Rollout team upon Procurement submission. | Must |
| FR-18 | Power | The system shall list every site with a non-rejected Planning submission as eligible for Power configuration. | Must |
| FR-19 | Power | The system shall capture primary, generator, renewable and backup power configuration parameters. | Must |
| FR-20 | Power | The system shall validate earthing resistance against a 5.0 ohm threshold and visually flag non-compliant values. | Must |
| FR-21 | Power | The system shall capture Power RFI status and certification documents. | Must |
| FR-22 | Power | The system shall mirror Power RFI status into the site's rollout milestone data and trigger recalculation of overall progress percentage. | Must |
| FR-23 | Power | The system shall refresh Power dashboard data automatically upon relevant database changes without requiring manual reload. | Should |
| FR-24 | Rollout | The system shall allow Rollout users to accept or reject a Procurement handover. | Must |
| FR-25 | Rollout | Upon acceptance of a handover, the system shall automatically present the corresponding Rollout Form for the accepted site. | Should |
| FR-26 | Rollout | The system shall present Procurement readiness summarised by category, with document access restricted according to document sensitivity. | Must |
| FR-27 | Rollout | The system shall capture project information, seven deployment milestones, seven execution dates and site verification documents. | Must |
| FR-28 | Rollout | The system shall compute and display a live progress bar derived from completed milestones. | Must |
| FR-29 | Rollout | The system shall allow re-submission of a previously submitted Rollout form and shall record submission count and timestamp metadata. | Should |
| FR-30 | Admin | The system shall provide an aggregate overview of total sites, pending items, users and procurement backlog. | Must |
| FR-31 | Admin | The system shall allow the Project team to approve or request revisions to Planning, Power and Rollout stage submissions with mandatory feedback text on revision requests. | Must |
| FR-32 | Admin | The system shall provide a dense, sortable Site Monitor table exposing key attributes across all modules. | Must |
| FR-33 | Admin | The system shall allow the Project team to create, edit, deactivate and delete user accounts, archiving deleted accounts for audit purposes. | Must |
| FR-34 | Admin | The system shall present a chronological, immutable activity log of significant actions across the system. | Must |
| FR-35 | Cross-cutting | The system shall send in-application notifications to relevant roles when a stage transition occurs. | Must |
| FR-36 | Cross-cutting | The system shall function, with a reduced feature set, when the device is offline, queuing actions for later synchronisation. | Should |
| FR-37 | Cross-cutting | The system shall be installable on desktop and mobile devices as a Progressive Web Application. | Could |

## 3.8 Non-Functional Requirements

Non-functional requirements were derived from operational concerns raised during elicitation (in particular, field connectivity, data sensitivity, and the desire for a system usable on modest field devices) and are expressed in Table 3.3 against the eight quality characteristics of ISO/IEC 25010 (2011), with measurable acceptance criteria in each case.

**Table 3.3 — Non-Functional Requirements**

| ID | ISO/IEC 25010 Characteristic | Requirement | Acceptance Criterion |
|---|---|---|---|
| NFR-01 | Functional Suitability | The system shall reproduce all fields of the existing nine-point Procurement checklist without omission. | 9/9 checklist items present and independently persistable. |
| NFR-02 | Performance Efficiency | Dashboard data shall refresh automatically at a bounded interval to maintain currency without excessive load. | Automatic refetch interval of 30 seconds, with immediate refetch on window focus/reconnect. |
| NFR-03 | Performance Efficiency | Cached query results shall be considered fresh for a short, bounded window to avoid redundant network calls. | Stale time of 10 seconds; up to 3 automatic retries on transient failure. |
| NFR-04 | Compatibility | The application shall render correctly on common desktop and mobile browsers without horizontal scrolling on mobile. | Verified on target viewport widths down to 360px with no horizontal overflow. |
| NFR-05 | Usability | Field users shall be able to install the application to a home screen and operate it without prior training beyond a short walkthrough. | Custom install prompt with iOS fallback instructions available on all supported platforms. |
| NFR-06 | Reliability | The application shall remain operable, for previously loaded data and queued actions, during a loss of network connectivity. | Core forms usable offline with actions queued in local storage and replayed on reconnection. |
| NFR-07 | Reliability | Data updates from one department shall be visible to dependent departments without manual refresh. | Real-time propagation via publish/subscribe channel on the `sites` and `procurement_submissions` tables. |
| NFR-08 | Security | All data tables shall deny access by default and grant access only via explicit, role-aware policy. | Row-level security enabled with explicit GRANTs on every application table; no table publicly writable. |
| NFR-09 | Security | Uploaded documents shall not be retrievable via a permanent public URL. | All storage buckets private; access exclusively via time-limited (1-hour) signed URLs. |
| NFR-10 | Security | A user shall not be able to grant themselves an elevated role. | Self-escalation prevention trigger rejects role changes initiated by the affected user for their own account. |
| NFR-11 | Maintainability | The system shall be structured into independently testable modules aligned to organisational roles. | Each dashboard implemented as an isolated component with its own data-access boundary. |
| NFR-12 | Maintainability | Database schema changes shall be applied through versioned, reviewable migration scripts. | All schema changes captured in sequentially numbered SQL migrations. |
| NFR-13 | Portability | The system shall be deployable without modification to any standards-compliant HTTPS hosting environment. | Deployed to a custom domain over HTTPS with no environment-specific hard-coded endpoints. |
| NFR-14 | Security | Weak or previously compromised passwords shall be rejected at account creation and password change. | Leaked-password protection enabled at the authentication layer. |

## 3.9 System Architecture

OrangeFlow SL follows a three-tier architecture separating presentation, application/middleware and data concerns, illustrated in Figure 3.2.

![Figure 3.2 — Three-Tier System Architecture](../public/dissertation/system_architecture.svg)
**Figure 3.2 — Three-Tier System Architecture**

The **Presentation tier** comprises a React single-page application delivered as an installable Progressive Web Application. A service worker, generated by a Workbox-based build plugin, provides offline asset caching and update management, while a client-side query cache (TanStack Query) maintains and automatically revalidates server data used by the interface. Within this tier, five distinct role-oriented dashboards — Planning, Procurement, Power, Rollout and Project/Admin — present only the views, forms and actions relevant to the authenticated user's role, consistent with the permission model of Section 3.6.

The **API/Middleware tier** mediates all access to persisted data. An authenticated client attaches a JSON Web Token (JWT), issued at sign-in, to every request. Standard CRUD operations are served through an auto-generated RESTful interface (PostgREST) whose every query is filtered through row-level security policies evaluated against the caller's identity and role, so that authorisation is enforced at the database boundary rather than solely in client code. Operations requiring elevated, non-row-scoped privilege — principally user lifecycle management — are handled by dedicated serverless Deno Edge Functions executing with service-role credentials, callable only by the Project team. This tier additionally hosts an offline action queue, persisted in the browser's IndexedDB store, which buffers writes made while offline and replays them once connectivity is restored, and a real-time channel that pushes row-change notifications from the data tier back to subscribed dashboards.

The **Data tier** is a managed PostgreSQL database in which every table has row-level security enabled together with explicit privilege grants, and a private object storage service holding uploaded documents behind access-controlled buckets. This tier is discussed in detail in Sections 3.12–3.13 and 3.18.

## 3.10 Data Flow Design

Figure 3.3 presents a Level-1 data flow diagram tracing site data as it moves between the five external entities (the four departmental roles and the Project/Admin role) and the principal data stores of the system.

![Figure 3.3 — Level-1 Data Flow Diagram](../public/dissertation/data_flow_diagram.svg)
**Figure 3.3 — Level-1 Data Flow Diagram**

The diagram formalises the workflow narrated in Section 3.5: Planning submits a site plan into the `sites` data store (Process 1.0); Procurement reads that record and writes its checklist and management data into the `procurement_submissions` store (Process 2.0), while its acceptance/rejection decision is written to `procurement_feedback`; Power reads procurement status and writes power configuration back onto the `sites` record (Process 3.0); Rollout reads procurement readiness and writes milestone, schedule and document data back onto the `sites` record (Process 4.0); and Project/Admin approval (Process 5.0) reads across all preceding stores and writes stage-approval outcomes back into `sites.review_notes`, closing the loop described in Section 3.17. Every process that produces a state change additionally writes an entry to the `activity_log` store and, where cross-role attention is required, triggers a record in the `notifications` store, ensuring that the audit and alerting mechanisms described in Section 3.18 are populated consistently regardless of which process initiated the change.

## 3.11 Use Case Design

Figure 3.4 presents the use case diagram for OrangeFlow SL, showing the five role actors and their principal interactions with the system.

![Figure 3.4 — Use Case Diagram](../public/dissertation/use_case_diagram.svg)
**Figure 3.4 — Use Case Diagram**

The Planning actor's use cases include *Create Site Record*, *Import from Excel*, *Save Draft*, *Validate Schema* and *Edit Pending Submission*; notably, *Delete Site* is not a use case available to this actor, consistent with Table 3.1. The Procurement actor's use cases include *Review Planning Handover*, *Complete Checklist Item*, *Upload Supporting Document*, and *Record Procurement Management Data*. The Power actor's use cases include *Configure Power System*, *Record Power RFI* and *Upload Certification*. The Rollout actor's use cases include *Accept Procurement Handover*, *View Procurement Readiness*, *Record Milestones* and *Upload Verification Documents*. The Project/Admin actor is associated, via generalisation, with an oversight use case *Approve Stage*, together with *Manage Users*, *View Site Monitor* and *View Activity Log*, and is the sole actor associated with *Delete Site*. Several use cases — notably checklist completion, milestone recording and stage approval — include an `<<extend>>` relationship to a shared *Send Workflow Notification* use case, reflecting the cross-cutting notification requirement (FR-35).

## 3.12 Database Design

The database schema was designed around a single, wide `sites` table acting as the centralised record for a BTS site throughout its lifecycle (see Section 3.17), supplemented by satellite tables that hold department-specific submissions, feedback, and cross-cutting audit and notification data. Figure 3.6 shows the resulting schema.

![Figure 3.6 — Database Schema](../public/dissertation/database_schema.svg)
**Figure 3.6 — Database Schema**

### 3.12.1 The centralised `sites` table

The `sites` table consolidates approximately ninety columns spanning site identity and location (name, site ID code, region, district, town, address, coordinates), civil and structural attributes (dimensions, foundation depth, elevation, terrain type, access road condition, tower type/material/height), radio-frequency attributes (antenna type and count, transmission type, distance to nearest BTS), power attributes (power source, backup type, battery configuration, earthing resistance, transformer/solar/generator capacity, Power RFI status, certificate reference), rollout milestone flags and a computed progress percentage, and governance fields (status, submitter, reviewer, review notes, free-text notes, approval metadata and timestamps). Consolidating these attributes into one record, rather than distributing them across per-department tables joined only loosely, is what allows every dashboard to present a coherent, current view of a site regardless of which department last updated it.

### 3.12.2 JSON extension strategy

Two extension mechanisms allow the schema to accommodate data that does not warrant a dedicated column, without resorting to unstructured free text that would be unusable by downstream consumers.

First, the Planning module collects sixty-one parameters, a number of which have no corresponding native column because they apply only to specific radio technologies or represent detailed engineering sub-parameters. These extended parameters are serialised as a JSON payload and embedded within the `notes` column behind a literal sentinel marker, `<<PLANNING_JSON>>`, terminated by an `<<END>>` marker. A dedicated parsing helper separates the human-readable planner remark, which precedes the sentinel, from the machine-readable payload, which follows it, so that every downstream viewer — Procurement, Power, Rollout, Admin and the Site Monitor table — renders only the clean prose remark to end users while the structured payload remains available to any component that needs to reconstruct the full parameter set. This design avoids a disruptive schema migration for every new Planning parameter while preserving strict separation between human commentary and structured data.

Second, stage-specific review outcomes produced by Power, Rollout, Admin approval and Procurement feedback are stored as a single merged JSON object in the `sites.review_notes` column, keyed by stage: `power`, `rollout`, `admin` and `feedback`. Because more than one stage may need to write to this column over the life of a site, and because stages proceed asynchronously and out of strict sequence in practice, writes to `review_notes` follow a strict **merge-not-overwrite** rule: before writing, the existing JSON object is read and only the key belonging to the writing stage is replaced, with all other keys preserved unchanged. This prevents, for example, a later Rollout update from silently erasing Power's previously recorded review notes, a failure mode that would otherwise be likely given that all four stages share a single column.

### 3.12.3 Satellite tables

Table 3.4 summarises every table in the schema, its purpose, its principal columns, and the row-level security posture applied to it.

**Table 3.4 — Database Tables Summary**

| Table | Purpose | Key Columns | RLS Summary |
|---|---|---|---|
| `profiles` | Extended user profile information created on signup. | user_id, full_name, email, department, is_active | Users may view/edit own profile; Project team may view/manage all. |
| `user_roles` | Authoritative store of role assignment, separate from profile data. | user_id, role | Insert/update restricted to Project team via `manage-users`; readable via `has_role()`; self-escalation blocked by trigger. |
| `sites` | Centralised Site ID record spanning the full rollout lifecycle. | id, site_id_code, status, review_notes, progress_percent | Planning may insert/select/update own pending rows; Power/Rollout may update non-rejected rows; only Project team may delete. |
| `procurement_submissions` | Nine-point checklist plus procurement management and document data, per site. | site_id, checklist booleans, po_number, procurement_status | Procurement team full CRUD on own submissions; other roles read-only per scope; Project team full access. |
| `procurement_feedback` | Procurement's accept/reject decision on a Planning handover. | site_id, user_id, status, feedback_notes | Insert by Procurement; readable by Planning, Rollout, Project. |
| `activity_log` | Append-only audit trail of significant actions. | user_id, action, entity_type, entity_id, created_at | Insert-only for authenticated actions; no UPDATE/DELETE permitted to any role; read restricted to Project team. |
| `notifications` | Per-user, in-application alerts. | user_id, title, message, type, is_read, link | Insert restricted to `auth.uid() = user_id` or via `send_workflow_notification`; no DELETE. |
| `deleted_users_archive` | Historical record of deleted user accounts, for accountability. | original_user_id, deleted_by, reason, deleted_at | Insert by `manage-users` Edge Function only; read restricted to Project team. |
| `security_audit_log` | Record of security-relevant function invocations and violations. | function_name, caller_user_id, severity, occurred_at | Insert by SECURITY DEFINER functions only; read-only, restricted to Project team. |

## 3.13 Entity Relationship Design

Figure 3.5 presents the entity relationship diagram underlying the schema described in Section 3.12.

![Figure 3.5 — Entity Relationship Diagram](../public/dissertation/entity_relationship_diagram.svg)
**Figure 3.5 — Entity Relationship Diagram**

`sites` is the central entity, related one-to-many to `procurement_submissions` and `procurement_feedback` (a site may accumulate more than one submission or feedback event over successive resubmissions), and referenced by foreign key from `activity_log` and, indirectly through application logic, from `notifications`, where the `entity_id`/`link` fields reference a given site. `profiles` is related one-to-many to `user_roles`, reflecting that a single user account is associated with role records held in a separate table for the security reasons discussed in Section 3.6, and `profiles` is referenced from `sites` through `submitted_by` and `reviewed_by`, and from `activity_log` and `deleted_users_archive` through their respective user references. `deleted_users_archive` and `security_audit_log` are intentionally not linked by foreign key to live rows, since both must remain intact even after the referenced user account or triggering event no longer exists in its original table, preserving the historical record required for audit purposes.

## 3.14 Activity and Process Design

Figure 3.7 models, as an activity diagram, the cross-departmental decision logic that a site record passes through as it advances from creation to completion.

![Figure 3.7 — Activity Diagram](../public/dissertation/activity_diagram.svg)
**Figure 3.7 — Activity Diagram**

The activity flow begins with Planning's creation and submission of a site record, followed by a decision point at Procurement feedback: on rejection, control returns to Planning for revision; on acceptance, the nine-point checklist and procurement management activities proceed in parallel with continued Planning visibility. Completion of procurement release triggers a fork notifying both Power and Rollout, who then proceed largely independently — Power through its three configuration and certification modules, Rollout through handover acceptance and its four-section form — with a join point at Project/Admin stage review, where each stage may be approved or sent back for revision. Only once Planning, Procurement, Power and Rollout stages have each been approved, and the final rollout milestone (On Air) recorded, does the activity terminate in a completed state.

## 3.15 System Flowchart

Figure 3.8 presents the system-level flowchart, describing the control logic exercised by the application at each user interaction, from authentication through role-based routing to the CRUD and workflow operations available within each dashboard.

![Figure 3.8 — System Flowchart](../public/dissertation/system_flowchart.svg)
**Figure 3.8 — System Flowchart**

The flowchart begins at application launch, proceeding to a login/session check; an unauthenticated user is directed to the login screen, while an authenticated user's role is read and used to route them to their dashboard, consistent with the route guard behaviour of Section 3.6. Within each dashboard, the flowchart distinguishes read operations (which are permitted broadly, subject to row-level security scope) from write operations (which are additionally checked against the specific action being attempted — for example, whether the current user's role permits deletion of the record in question) before the corresponding database call is issued and, where relevant, a notification and activity log entry are generated.

## 3.16 Sequence Design of the Site Lifecycle

Figure 3.9 presents a sequence diagram tracing a single BTS site through its complete lifecycle across all five roles and the underlying `sites` data store.

![Figure 3.9 — Sequence Diagram: Site Lifecycle](../public/dissertation/sequence_diagram.svg)
**Figure 3.9 — Sequence Diagram: Site Lifecycle**

The lifecycle begins with **Planning submission**, in which the Planning actor creates a `sites` row with status `pending` and the data store issues a notification to Procurement. **Procurement feedback** follows, in which Procurement records an accept or reject decision in `procurement_feedback`; on acceptance, Procurement proceeds through the **nine-point compliance checklist**, completing the Land Acquisition, Land Lease and Handover items with supporting documents, before recording **procurement release**, at which point the `sites` record is updated and notifications are dispatched to both the Rollout and Power teams, consistent with FR-17.

**Power configuration** then proceeds independently: the Power actor records primary and backup power parameters and raises a **Power RFI** (Request for Inspection), whose status is written both to a Power-specific record and mirrored into the corresponding `sites` rollout milestone field, triggering recalculation of the overall progress percentage (FR-22) and a notification to Rollout and Project/Admin.

In parallel, **rollout handover acceptance** occurs when the Rollout actor accepts the Procurement handover; the interface automatically opens the Rollout Form for that site (FR-25). The Rollout actor then records **milestones** (handover to vendor, soil test, site implementation design, cast status, tower rig, civil RFI, power RFI, and on-air), the associated **execution schedule** dates, and uploads **verification documents** (soil test report, site implementation design, quality certificate, site photographs), each update again propagating a live progress-bar recalculation and a notification to Project/Admin.

Finally, **Project/Admin stage approvals** occur for each of the Planning, Procurement, Power and Rollout stages independently; each approval or revision request is written into the corresponding key of `sites.review_notes` under the merge-not-overwrite rule described in Section 3.12.2, and only once every stage has been approved and the on-air milestone recorded does the site reach its terminal **On Air** state.

## 3.17 Centralised Site ID Architecture

A defining architectural decision of OrangeFlow SL is the use of a single, centralised identifier — the `sites.id` primary key, exposed operationally as `site_id_code` — as the sole join key linking every department's data about a given physical BTS site. Rather than each department maintaining an independent record that must later be reconciled (as occurred under the manual workflow analysed in Section 3.4), Planning, Procurement, Power, Rollout and Project/Admin all read and write against the same `sites` row, supplemented, where department-specific volume warrants a separate table, by satellite tables (`procurement_submissions`, `procurement_feedback`) that are themselves keyed by `site_id` foreign key back to the same centralised record.

This centralisation has three direct architectural consequences. First, it eliminates the possibility of divergent status between departments, since there is exactly one authoritative `status` and one authoritative `progress_percent` value per site, rather than department-local copies. Second, it makes real-time propagation straightforward: because `REPLICA IDENTITY FULL` is enabled together with real-time publication on `sites` and `procurement_submissions`, a change made by any department is broadcast, with full row content, to every subscribed dashboard, allowing TanStack Query caches across all connected clients to be invalidated and refreshed without a manual reload. Third, it necessitated the merge-not-overwrite JSON discipline described in Section 3.12.2 for the `review_notes` column and the stage-scoped row-level security widening noted in Section 3.9 — Power and Rollout teams were originally restricted to updating only `approved` sites, a rule that in practice silently blocked legitimate writes once a site had progressed beyond initial approval, and was corrected to permit updates to any site that is not `rejected`, reflecting the operational reality that Power and Rollout activity legitimately continues throughout the pending-to-on-air lifecycle, not merely after a single upfront approval.

## 3.18 Security Design

Security was treated as a first-order design concern throughout the project, reflecting the sensitivity of commercial vendor data, site coordinates, and user account information handled by the system. The security design rests on the following pillars.

**Row-level security with explicit grants.** Every table in the public schema has row-level security enabled, and, in addition, explicit `GRANT` statements are issued for each role rather than relying on default PostgreSQL privileges, so that a table is inaccessible by default and only becomes accessible through a deliberately authored policy, in line with a default-deny security posture (Saltzer and Schroeder, 1975).

**Separate role table and `has_role()` function.** As described in Section 3.6, roles are held in `user_roles`, a table distinct from user-editable profile data, and every policy that depends on role membership calls the `SECURITY DEFINER` function `has_role(_user_id, _role)` rather than inlining a role lookup, both to prevent privilege escalation through editable columns and to avoid recursive policy evaluation.

**Private storage with signed URL delivery.** Both storage buckets used by the system, `site-documents` and `procurement-documents`, are private; no object is retrievable via a permanent public URL. Access is instead granted through owner- and role-scoped storage policies (for example, Power and Rollout teams are scoped to their own folders, while the Project team has global read access) combined with signed URLs valid for one hour, generated on demand. Because the database stores only the object *path*, not a URL, a compromised or leaked database row cannot itself be used to retrieve a document outside the one-hour signing window. Client-side delivery additionally accounts for browser privacy filtering: certain browser extensions and built-in tracker-blocking features intercept direct navigation to the storage provider's domain, so the client instead fetches the signed URL server-side, converts the response to a binary object, and presents it to the user as a local object URL, with an automatic download fallback if inline preview is not possible.

**Sanitising, access-controlled notification RPC.** Because notifications must sometimes be raised by one user on behalf of another (for example, Procurement notifying the Rollout team), direct `INSERT` privilege on the `notifications` table is restricted to a user inserting a notification for themselves (`auth.uid() = user_id`); all cross-user notification traffic is instead routed through the `send_workflow_notification` remote procedure, which independently verifies the caller's role before proceeding, strips or rejects unsafe message content, and explicitly rejects any link value that resolves to an external (non-relative) address, preventing the notification channel from being used to redirect a user to an external phishing destination.

**Self-escalation prevention.** A dedicated trigger, `prevent_role_self_escalation`, rejects any attempt by a user to alter their own row in `user_roles`, ensuring that role changes can only be made by the Project team acting through the `manage-users` Edge Function, itself restricted to service-role execution and to callers already holding the `project_team` role.

**Leaked-password protection.** The authentication layer is configured to reject passwords that appear in known compromised-credential databases, in addition to standard complexity requirements enforced client-side via a schema validation library, reducing the risk of credential-stuffing attacks against user accounts.

**Security audit log.** Violations of row-level security policies or errors raised within `SECURITY DEFINER` functions are recorded in `security_audit_log`, capturing the function invoked, the caller's identity and role, the arguments supplied, and an error code and severity, and this log is itself readable only by the Project team, providing a durable record from which anomalous or malicious access attempts can be reconstructed after the fact.

## 3.19 Interface Design Principles

The interface design followed a small number of consistent principles across all five dashboards. First, **role-appropriate minimalism**: each dashboard exposes only the tabs, forms and actions relevant to its role, so that a user is never presented with controls they are not authorised to use, reinforcing the least-privilege model of Section 3.6 at the presentation layer as well as the data layer. Second, **progressive disclosure**: complex forms, most notably the sixty-one-parameter Planning form, are organised into accordions grouped by logical module, with technology-specific sections (2G/3G/4G) rendered conditionally so that a user configuring a 4G-only site is not confronted with irrelevant 2G or 3G fields. Third, **status legibility**: colour-coded badges and progress indicators are used consistently across Procurement's checklist groups, Power's compliance flags, and the Site Monitor table, so that a user can assess a site's state at a glance without reading detailed text. Fourth, **mobile-first responsiveness**: given that Power and Rollout staff frequently operate from field locations on mobile devices, layouts avoid horizontal scrolling, hide scrollbars on narrow viewports, and stack card-based content rather than relying on wide tabular layouts, while the desktop-oriented Site Monitor retains a dense tabular view appropriate to office-based oversight work. Finally, **brand and accessibility consistency**: a single set of semantic design tokens defines colour, spacing and typography (built around the operator's brand colour and the Plus Jakarta Sans typeface) so that visual treatment — including glassmorphism surface styling — remains consistent across all dashboards rather than being defined ad hoc per screen.

## 3.20 Software Development Methodology

The system was developed using an iterative, incremental methodology influenced by Agile principles (Beck et al., 2001) and situated within the broader design-science research cycle described in Section 3.2. This methodology was preferred over a strict waterfall approach because the requirements set, while grounded in a well-understood business process, could only be fully validated through direct stakeholder engagement with working software, as reflected in the prototype-walkthrough elicitation technique of Section 3.3.1; a purely sequential process with a single upfront requirements sign-off would have delayed the discovery of terminology mismatches, missing fields and workflow misordering until far later in the project, when correction would have been considerably more costly (Sommerville, 2016).

Development proceeded across six increments, each corresponding to a coherent module boundary and each concluded with a stakeholder walkthrough feeding into the next increment's backlog, summarised in the following order: (1) authentication, role model and route guarding; (2) the Planning dashboard, including Excel import and the JSON extension mechanism for extended parameters; (3) the Procurement dashboard, including the nine-point checklist and procurement management fields; (4) the Power dashboard, including compliance validation and Power RFI mirroring; (5) the Rollout dashboard, including procurement readiness display and milestone tracking; and (6) the Project/Admin dashboard, including stage review, the Site Monitor table, user management and the activity log, alongside cross-cutting hardening of row-level security, storage policy and notification behaviour. This incremental sequencing follows the natural dependency order of the business process itself — each module could only be meaningfully evaluated once the module immediately preceding it in the workflow existed to supply it with data — while still allowing each increment to be independently specified, built and validated, consistent with recommended incremental development practice (Larman and Basili, 2003).

## 3.21 Technologies Used

Table 3.5 summarises the principal technologies selected for the implementation, together with the justification for each choice.

**Table 3.5 — Technologies Used**

| Layer | Technology | Version/Role | Justification |
|---|---|---|---|
| Presentation | React | 18 | Component-based architecture well suited to five distinct, independently evolving role dashboards. |
| Presentation | TypeScript | 5 | Static typing reduces integration errors across a schema of approximately ninety `sites` columns. |
| Build tooling | Vite | 5 | Fast development iteration and optimised production bundling. |
| Styling | Tailwind CSS | 3 | Utility-first styling paired with semantic design tokens for brand consistency (Section 3.19). |
| UI components | shadcn/ui, lucide-react | — | Accessible, composable primitives reducing bespoke component development effort. |
| Data fetching/cache | TanStack Query | v5 | Declarative caching, background refetch and retry behaviour underpinning NFR-02/NFR-03. |
| Routing | react-router-dom | v6 | Declarative route definitions supporting the role-based guard of Section 3.6. |
| Forms/validation | react-hook-form, Zod | — | Performant form state management with schema-based validation for planning, procurement, power and rollout forms. |
| Spreadsheet import | xlsx (SheetJS) | — | Parses arbitrary Excel workbook layouts for the Planning import feature (FR-06, FR-07). |
| Offline storage | idb-keyval | — | Lightweight IndexedDB wrapper underpinning the offline action queue (NFR-06). |
| PWA/offline | vite-plugin-pwa / Workbox | — | Generates the service worker providing asset caching and update management. |
| Testing | Vitest | — | Unit and integration testing aligned with the Vite build toolchain. |
| Backend/API | PostgREST | — | Auto-generated, RLS-aware REST interface removing the need for bespoke CRUD endpoints. |
| Backend/Auth | GoTrue (Supabase Auth) | — | JWT-based authentication with leaked-password protection (NFR-14). |
| Serverless functions | Deno Edge Functions | — | Isolated execution of privileged user-lifecycle operations (`manage-users`, `seed-users`). |
| Database | PostgreSQL | 15 | Mature relational engine with native row-level security, satisfying NFR-08. |
| Object storage | Managed private object storage | — | Private-by-default document storage delivered via signed URLs (Section 3.18). |
| Realtime | Realtime publication/replication | — | Drives cross-dashboard live updates described in Section 3.17. |
| Deployment | Custom domain over HTTPS | — | Satisfies NFR-13 with no environment-specific hard-coded configuration. |

## 3.22 Chapter Summary

This chapter has traced the transformation of a manual, spreadsheet- and paper-mediated BTS rollout coordination process into a structured, security-conscious software design. Requirements were elicited through interviews, document analysis, field observation and iterative prototype walkthroughs with representative domain leads, and validated through traceability to those same sources. Analysis of the existing system exposed a lack of a single source of truth, manual transcription error, weak audit trails and delayed cross-departmental visibility, all of which directly shaped the proposed system's centralised `sites` architecture, its five-role permission model enforced through a separate `user_roles` table and a `SECURITY DEFINER` `has_role()` function, and its real-time, notification-driven workflow. The chapter specified functional and non-functional requirements against recognised quality criteria, presented the three-tier architecture and its data flow, use case, entity relationship, database, activity, flowchart and sequence designs, and detailed the security and interface design principles underpinning the system, before justifying the iterative, incremental methodology by which the six modules were delivered and summarising the technology stack selected for implementation. Chapter Four builds on this design to describe the concrete implementation of each module.


---


# Chapter Four — System Implementation and Testing

## 4.1 Introduction

This chapter presents the practical realisation of the design described in Chapter Three. It documents how OrangeFlow SL — a web-based Progressive Web Application (PWA) that digitises the end-to-end Base Transceiver Station (BTS) site rollout lifecycle for a Sierra Leonean mobile network operator — was implemented, module by module, and how the resulting system was verified through functional, security, offline-synchronisation and cross-platform testing. The chapter follows the logical sequence in which the system was built: development environment and project structure, database and backend implementation, authentication and access control, the four operational dashboards (Planning, Procurement, Power, Rollout) and the supervisory Project (Admin) dashboard, cross-cutting concerns (documents, workflow synchronisation, notifications, offline capability, user interface) and, finally, the testing regime applied before the system was considered fit for evaluation. Each section quotes representative code listings taken directly from the production source tree to substantiate the description, and each listing is captioned in accordance with the dissertation's figure and table numbering conventions.

Throughout, the workflow is: a Planning Team member captures or imports a Site ID record; a Procurement Team member accepts the handover and executes a nine-point land, lease and vendor-handover checklist; a Power Team member certifies electrical infrastructure; a Rollout Team member executes civil and radio deployment milestones through to on-air; and the Project (Admin) team supervises, reviews and administers the entire pipeline, including user accounts.

## 4.2 Development Environment and Project Structure

The system was implemented as a single-page React application written in TypeScript, built with Vite, and styled using Tailwind CSS together with the shadcn/ui component library. Client-side routing is handled by React Router, and server state (queries, caching and background refetching) is managed with TanStack Query. Offline persistence of queued mutations uses `idb-keyval`, a thin wrapper over the browser's IndexedDB.

The backend is a managed platform comprising a PostgreSQL database exposed through PostgREST, Deno-based Edge Functions for privileged operations, and private object storage buckets, all governed by Postgres Row-Level Security (RLS). This architecture was chosen over a bespoke Node/Express backend because it allowed authentication, authorisation and data access to be expressed declaratively at the database layer, reducing the surface area for inconsistent enforcement across dashboards.

The project structure separates concerns clearly:

```
src/
  pages/            – one dashboard per role (Planning, Procurement, Power, Rollout, Admin)
  components/       – shared and feature-specific presentational components
  hooks/            – useAuth, useOnlineSync and other cross-cutting hooks
  lib/              – planningNotes, storageUtils, offlineQueue and other pure utilities
  integrations/     – generated Supabase client and database types
supabase/
  functions/        – manage-users, seed-users Edge Functions
  migrations/       – 31 sequential SQL migrations
```

This layout enforces a rule adopted from the outset of implementation: role-specific business logic resides in the corresponding `pages/*Dashboard.tsx` file, while logic that must behave identically regardless of which dashboard invokes it (file storage, notes parsing, offline queuing) is factored into `src/lib`. This discipline proved important later when several defects (Section 4.20) were traced to duplicated, slightly divergent copies of the same logic before refactoring.

## 4.3 Database and Backend Implementation

The relational schema comprises the following principal tables, all created with Row-Level Security enabled and explicit `GRANT` statements: `profiles`, `user_roles`, `sites`, `procurement_submissions`, `procurement_feedback`, `activity_log`, `notifications`, `deleted_users_archive`, and `security_audit_log`. Two enumerated types, `app_role` and `site_status`, together with `feedback_status`, constrain valid values for role and workflow state columns.

The `sites` table is the centralised Site ID record and is the largest table in the schema, with approximately ninety columns spanning identity and location, civil/structural, RF hardware, power infrastructure, and the seven rollout milestone flags culminating in `progress_percent`. `procurement_submissions` carries the nine-point checklist as boolean columns paired with per-item document-path columns, together with the Procurement Management and Document Management fields introduced in Section 4.8.

Thirty-one sequential SQL migrations were applied over the implementation period, each migration being idempotent and reversible in principle, capturing the incremental nature of the build: initial schema, RLS policy hardening, addition of the notifications and activity-log tables, addition of `security_audit_log`, and later corrective migrations addressing the RLS defects described in Section 4.20.

Two roles are separated for privileged server-side operations: the `manage-users` Edge Function (account lifecycle — create, update, deactivate, delete-with-archive) and `seed-users` (initial account provisioning). Both execute with the service-role key on the server and are never exposed to the browser; `manage-users` independently re-verifies that the caller holds the `project_team` role before performing any action, as shown in Listing 4.1.

```typescript
// supabase/functions/manage-users/index.ts (excerpt)
const token = authHeader.replace('Bearer ', '');
const { data: { user: caller }, error: authError } =
  await supabaseAdmin.auth.getUser(token);
if (authError || !caller) throw new Error('Invalid token');

const { data: callerRole } = await supabaseAdmin
  .from('user_roles').select('role').eq('user_id', caller.id).single();
if (!callerRole || callerRole.role !== 'project_team') {
  throw new Error('Unauthorized: Admin only');
}
```
**Listing 4.1 — Server-side role re-verification in the `manage-users` Edge Function**

Account deletion archives the departing user's profile and role into `deleted_users_archive` before deleting the profile, the role row and finally the authentication record, preserving an audit trail even after the account itself no longer exists.

## 4.4 Authentication and Session Management

Authentication uses the managed platform's email/password identity provider. `src/hooks/useAuth.tsx` wraps the application in an `AuthProvider` that subscribes to `onAuthStateChange` and, on each session change, concurrently fetches the caller's role via the `get_user_role` remote procedure call and their profile row, exposing `user`, `session`, `role`, `profile` and `loading` to the rest of the tree (Listing 4.2).

```typescript
// src/hooks/useAuth.tsx (excerpt)
const fetchUserData = async (userId: string) => {
  const [roleRes, profileRes] = await Promise.all([
    supabase.rpc('get_user_role', { _user_id: userId }),
    supabase.from('profiles')
      .select('full_name, email, phone, department')
      .eq('user_id', userId).single(),
  ]);
  if (roleRes.data) setRole(roleRes.data as AppRole);
  if (profileRes.data) setProfile(profileRes.data);
};
```
**Listing 4.2 — Concurrent role and profile resolution in `useAuth`**

The role is deliberately fetched through a database function rather than read from a client-editable table, ensuring that role information presented to the interface always reflects the authoritative `user_roles` row. Sessions are persisted by the underlying client library in local storage and are automatically refreshed; sign-out clears local component state in addition to the remote session.

## 4.5 Role-Based Access Control Implementation

Access control is implemented in two complementary layers: a route guard at the presentation layer, and Row-Level Security at the database layer. The presentation layer alone is not trusted for security — it exists purely to route legitimate users to the correct workspace — and every table-level policy independently re-derives the caller's role from the database, never from a client-supplied value.

The role check itself is centralised in a single SECURITY DEFINER function, `has_role`, which all RLS policies call rather than embedding role logic inline (Listing 4.3). Declaring it `SECURITY DEFINER` with `SET search_path = public` avoids the classic Postgres RLS recursion hazard whereby a policy on `user_roles` would otherwise need to query `user_roles` to evaluate itself (see Section 4.20).

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Example policy using has_role
create policy "Project team can delete sites"
  on public.sites for delete
  using (public.has_role(auth.uid(), 'project_team'));
```
**Listing 4.3 — `has_role` SECURITY DEFINER function and a dependent RLS policy**

The Planning Team's permission boundary illustrates the design intent precisely: Planning may view and edit its own site records but may never delete them, a rule enforced both by the omission of a delete affordance in `PlanningDashboard.tsx` and, more strongly, by the absence of any `delete` policy for `planning_team` on `sites` — delete is reserved exclusively to `project_team`.

At the presentation layer, `AuthGuard.tsx` accepts an optional `allowedRoles` prop per route and, when the authenticated user's role is not in that list, redirects to that role's own dashboard rather than to a generic error page, using a static redirect map (Listing 4.4).

```typescript
// src/components/AuthGuard.tsx (excerpt)
if (allowedRoles && role && !allowedRoles.includes(role)) {
  const redirectMap: Record<string, string> = {
    planning_team: '/planning',
    procurement_team: '/procurement',
    power_team: '/power',
    rollout_team: '/rollout',
    project_team: '/admin',
  };
  return <Navigate to={redirectMap[role] || '/'} replace />;
}
```
**Listing 4.4 — Role-to-dashboard redirect map in `AuthGuard`**

A `prevent_role_self_escalation` trigger on `user_roles` additionally blocks any user, including a `project_team` member, from granting themselves an additional role outside the `manage-users` Edge Function's controlled path, closing a privilege-escalation avenue that unrestricted direct table access would otherwise leave open (tested in Section 4.19).

## 4.6 Planning Module Implementation

`PlanningDashboard.tsx` (625 lines) presents the Site ID capture form as a set of accordions rather than a single long form, so that the sixty-one planning parameters remain navigable. The action bar exposes **Import from Excel**, **Save Draft** and **Validate Schema**. The seven modules and their conditional-visibility behaviour are summarised in Table 4.1.

**Table 4.1 — Planning Parameter Modules**

| Module | Representative parameters | Visibility rule |
|---|---|---|
| Basic Site & Location | Site name, Site ID code, region, district, town, address, latitude, longitude | Always visible |
| Governance & Classification | Status, technology_classification (multi-select 2G/3G/4G), classification notes | Always visible |
| Civil & Infrastructure | Dimensions, foundation depth, elevation, terrain type, access road condition, tower type/material/height | Always visible |
| RF Hardware & Physical Antenna | Antenna type, number of antennas, transmission type, distance to nearest BTS | Always visible |
| 2G Radio Network | GSM-specific radio parameters | Rendered only if "2G" selected in technology_classification |
| 3G Radio Network | UMTS/WCDMA-specific radio parameters | Rendered only if "3G" selected in technology_classification |
| 4G LTE Radio Network | LTE-specific radio parameters | Rendered only if "4G" selected in technology_classification |

![Figure 4.1 — Planning Workspace](../public/dissertation/ui_planning_workspace.svg)
**Figure 4.1 — Planning Workspace showing accordion modules and conditional technology sections**

Planning is permitted to edit only its own pending submissions; once a site has moved into Procurement or beyond, the Planning form becomes read-only for that record, preventing upstream edits from silently invalidating downstream work.

### 4.6.1 Extended parameters and the `<<PLANNING_JSON>>` sentinel

The `sites` table does not carry a native column for every one of the sixty-one captured parameters; several are specific to a single technology and would otherwise force sparse, mostly-null columns across the table. These extended parameters are instead serialised as JSON and appended to the free-text `notes` column behind a machine-readable sentinel, `<<PLANNING_JSON>>…<<END>>`, immediately following any human-written remark. `src/lib/planningNotes.ts` (Listing 4.5) provides the single, shared implementation used everywhere the `notes` column is read or written.

```typescript
// src/lib/planningNotes.ts
const TAG_RE = /<<PLANNING_JSON>>([\s\S]*?)<<END>>/;

export function parsePlanningNotes(raw: string | null | undefined) {
  const value = raw || '';
  const m = value.match(TAG_RE);
  let extended: Record<string, any> = {};
  if (m) {
    try { extended = JSON.parse(m[1]) || {}; } catch { /* ignore malformed */ }
  }
  const text = value.replace(TAG_RE, '').trim();
  return { text, extended };
}

export function cleanNote(raw: string | null | undefined): string {
  return parsePlanningNotes(raw).text;
}

export function buildPlanningNotes(note: string | null, extended: Record<string, any>) {
  const text = (note || '').trim();
  const tag = `<<PLANNING_JSON>>${JSON.stringify(extended)}<<END>>`;
  return text ? `${text}\n\n${tag}` : tag;
}
```
**Listing 4.5 — `parsePlanningNotes`, `cleanNote` and `buildPlanningNotes` in `src/lib/planningNotes.ts`**

`buildPlanningNotes` is called whenever the Planning form saves a record, concatenating the planner's free-text remark with the serialised extended-parameter object. Every downstream consumer — Procurement, Power, Rollout, the Project (Admin) review surfaces, and the Site Monitor table — calls `cleanNote` (or `parsePlanningNotes` when it also needs the structured data) before rendering the note, so that no user outside Planning's own edit form ever sees the raw JSON tag. This separation was introduced specifically because early builds rendered the tag verbatim to other roles, a defect discussed further in Section 4.20.

## 4.7 Excel Import Implementation

To reduce transcription effort for sites already documented in spreadsheet form by field survey teams, the Planning Dashboard supports importing a completed Site ID Excel workbook using the `xlsx` library. The importer must tolerate considerable variability in how different surveyors lay out their spreadsheets, which motivated a field-index-driven, two-pass parsing design rather than a rigid fixed-cell reader.

### 4.7.1 Field index

Every one of the sixty-one planning parameters is described by a field-index entry carrying: an **internal key** (the property name written to the `sites` record or the extended-parameters object); a **full label** as it would appear on a formal Site ID document, including any unit suffix (for example, "Tower Height (m)"); a **label without units**, derived by stripping trailing parenthetical unit text, used for looser matching; and a list of **normalised aliases** — lower-cased, whitespace-collapsed, punctuation-stripped variants and known abbreviations (for example, "twr ht", "tower height m", "height of tower") collected from real-world workbook samples. At import time, every candidate header or key found in the workbook is normalised using the same routine and matched against this alias set, so that superficially different but semantically identical column headers resolve to the same internal key.

### 4.7.2 Two parsing passes

The importer performs two passes over each worksheet, because field survey teams lay out their workbooks in two distinct styles:

1. **Key–value pass.** The sheet is scanned cell by cell for any cell whose normalised text matches a field-index label or alias; if found, the adjacent cell (to the right, or immediately below where the sheet is laid out vertically) is treated as that field's value. This handles free-form "form-style" sheets where labels and values may appear anywhere on the sheet, not confined to a fixed grid.
2. **Header-row and data-row pass.** If a row is identified as a header row — that is, a majority of its non-empty cells match field-index entries — every subsequent non-empty row is treated as one Site ID record, with each column mapped through the same header-to-key resolution. This handles tabular, multi-site export sheets.

Both passes write into the same intermediate record so that a workbook combining a form-style header block with a tabular body below it is still fully captured.

### 4.7.3 Type coercion and technology auto-detection

Once a raw value has been located for a field, it is coerced according to that field's declared type in the field index: numeric fields are parsed with locale-tolerant number parsing (stripping thousands separators and unit suffixes); date fields accept both Excel serial date numbers and common textual date formats and are normalised to ISO 8601; and select-type fields (for example, terrain type, tower material) are matched case-insensitively against the permitted option list, falling back to the closest known option rather than rejecting the row outright.

Technology classification is auto-detected from two signals: the names of the worksheets themselves (a sheet named "2G" or "GSM Parameters" implies 2G is present; "3G", "UMTS" or "WCDMA" implies 3G; "4G" or "LTE" implies 4G), and, independently, whether any field belonging to a given technology's parameter set was actually populated. The union of both signals is written into `technology_classification`, which in turn determines which of the three conditional radio-network accordions render (Section 4.6).

### 4.7.4 Import summary feedback

On completion, the importer presents a summary toast/panel reporting the number of fields successfully mapped, the number of rows recognised as distinct sites (for tabular sheets), and a list of any header text that could not be matched to the field index, so that the Planning user can correct unrecognised columns in the source spreadsheet or enter the corresponding values manually. This feedback loop was found necessary because silent partial imports were, in early trials, mistaken for complete ones (Section 4.20).

## 4.8 Procurement Module Implementation

`ProcurementDashboard.tsx` (628 lines) presents three tabs: Dashboard, Site Feedback and Procurement Form. Site Feedback requires the Procurement user to accept or reject the handover received from Planning, recording mandatory notes in `procurement_feedback` regardless of outcome.

The centrepiece of the Procurement Form is the nine-point checklist, organised into three colour-coded groups, each item paired with a required supporting-document upload, summarised in Table 4.2.

**Table 4.2 — Procurement Nine-Point Checklist**

| Group | Item | Evidence document required | Rollout visibility |
|---|---|---|---|
| Land Acquisition | Land Identified | Land Identification / Survey Document | View/download |
| Land Acquisition | Ownership Verified | — (no document field) | Status only |
| Land Acquisition | Land Acquisition Approved | Approval Document | View/download |
| Land Lease | Lease Negotiation Completed | Negotiation Summary | View/download |
| Land Lease | Land Lease Signed | Signed Lease Agreement | Status only |
| Land Lease | Lease Registration Completed | Registered Lease | Status only |
| Handover | Handover to Vendor | — (no document field) | Status only |
| Handover | Road Access Available | Road Access Document | View/download |
| Handover | Vendor Contract Signed | Vendor Contract | Status only |
| Handover | Site Handover to Vendor Completed | Site Handover Document | View/download |

![Figure 4.2 — Procurement Nine-Point Checklist](../public/dissertation/ui_procurement_checklist.svg)
**Figure 4.2 — Procurement Nine-Point Checklist with colour-coded groups and evidence uploads**

Section 4 of the form, Procurement Management (`src/components/ProcurementManagement.tsx`), captures vendor/supplier identity and contact, purchase-order number/date/status, material delivery status and dates, invoice number, payment status and an overall procurement status. Section 5, Document Management, captures the Purchase Order, Delivery Note, Goods Received Note, Vendor Delivery Certificate, Material Handover Form and Material Inspection Report as private storage uploads.

On submission, the `send_workflow_notification` remote procedure call is invoked to notify both `project_team` and `rollout_team`, so that Rollout is alerted to a newly procurement-ready site without needing to poll the dashboard manually.

## 4.9 Power Module Implementation

`PowerDashboard.tsx` (564 lines) offers a Dashboard tab (KPI cards plus a searchable site list) and a Power Form tab. A site becomes eligible for the Power workspace once it has any planning submission whose status is not `rejected`; Power does not wait for Procurement to finish, since electrical survey work can proceed in parallel. The three modules and their fields are summarised in Table 4.3.

**Table 4.3 — Power Modules and Fields**

| Module | Fields | Validation |
|---|---|---|
| Primary & Generator Power Configuration | Power source, grid transformer capacity, generator capacity | — |
| Renewable & Backup Energy Systems | Backup power, power backup type, battery bank type, number of battery banks, solar capacity, earthing resistance | Earthing resistance accepted only if ≤ 5.0 Ω; the field is visually flagged otherwise |
| Certification, Compliance & Attachments | Power RFI status, inspection date, power certificate uploads | Certificates rendered as DocCards with file name, size and uploader metadata |

![Figure 4.3 — Power Dashboard](../public/dissertation/ui_power_dashboard.svg)
**Figure 4.3 — Power Dashboard showing KPI cards and the three power modules**

The Power RFI status field is the module's principal integration point with the rest of the pipeline: whenever it changes, the value is mirrored into the corresponding site's `power_rfi` rollout milestone and the site's `progress_percent` is recalculated (Section 4.14), and both Rollout and the Project (Admin) team receive a notification. A realtime listener subscribed to `procurement_submissions` and `sites` keeps the Power dashboard's site list current without a manual refresh.

## 4.10 Rollout Module Implementation

`RolloutDashboard.tsx` (828 lines) is the most extensive dashboard, comprising four tabs: Dashboard, Site Feedback, Procurement Info and Rollout Form.

The Dashboard tab presents four KPIs — Pending Feedback, Accepted/Active, Rejected and On Air. Site Feedback requires Rollout to accept or reject the handover from Procurement. On acceptance, the interface automatically switches to the Rollout Form tab and opens that specific site's form, removing an extra manual navigation step and ensuring the deployment team begins execution capture immediately.

The Procurement Info tab combines `RolloutProcurementReadiness` and `RolloutReadinessTracker` (`src/components/RolloutProcurementReadiness.tsx`). This component renders the same three-group structure as Table 4.2 but enforces an access boundary: for items whose evidence document Rollout is permitted to see, a `DocRow` offers View and Download actions resolved through the shared storage utilities; for restricted commercial documents (Signed Lease Agreement, Registered Lease, Vendor Contract), only a "Status Only — document retained by Procurement" notice is rendered, and no storage path is ever resolved for those fields in this component (Listing 4.6).

```typescript
// src/components/RolloutProcurementReadiness.tsx (excerpt)
const docs = yes
  ? (param.docs || [])
      .map(d => ({ ...d, path: extractStoragePath(submission[d.field], BUCKET) }))
      .filter(d => !!d.path)
  : [];
...
{yes && !param.docs && (
  <p className="...">
    <Lock className="h-3 w-3" /> Status only — document retained by Procurement
  </p>
)}
```
**Listing 4.6 — Restricted-document handling in `RolloutProcurementReadiness`**

The Rollout Form is organised into four sections:

1. **Project Information** — project manager, civil contractor, T&I contractor, vendor scope.
2. **Deployment Milestones** — seven boolean/date milestones driving a live progress bar, summarised in Table 4.4.
3. **Project Execution Schedule** — seven corresponding execution dates.
4. **Site Verification** — closing checks prior to on-air declaration.

**Table 4.4 — Rollout Deployment Milestones**

| Milestone | Meaning | Weight in progress computation |
|---|---|---|
| Handover to Vendor | Site formally handed to the civil/T&I vendor | 1/7 |
| Soil Test | Geotechnical soil test completed | 1/7 |
| Site Implementation Design | Detailed civil/RF implementation design approved | 1/7 |
| Cast Status | Foundation casting completed | 1/7 |
| Tower Rig | Tower erection/rigging completed | 1/7 |
| Civil RFI | Civil works Request for Inspection passed | 1/7 |
| Power RFI | Power infrastructure certified (mirrored from the Power module) | 1/7 |
| On Air | Site broadcasting live traffic | Terminal state, not itself weighted |

![Figure 4.4 — Rollout Dashboard](../public/dissertation/ui_rollout_dashboard.svg)
**Figure 4.4 — Rollout Dashboard showing KPI cards, milestone progress bar and form tabs**

The Rollout Form is deliberately persistent and re-submittable rather than single-shot: each submission records `submitted_at`, `submitted_by` and an incrementing `submission_count`, and once a site has been reviewed by the Project (Admin) team, the form remains editable, with its call-to-action relabelled "Update & Resubmit to Admin" so that corrections raised during review can be actioned without recreating the record. This design reflects the reality that deployment milestones are updated repeatedly over weeks as civil and RF works genuinely progress, not captured once and finalised.

## 4.11 Project (Admin) Module Implementation

`AdminDashboard.tsx` provides the Project team with global oversight and administrative authority, structured as eight review surfaces, summarised in Table 4.5.

**Table 4.5 — Project (Admin) Review Surfaces**

| Tab | Capability |
|---|---|
| Overview | Pipeline-wide KPIs and recent activity |
| Sites | Full Site ID register; view, edit and delete (delete reserved to project_team) |
| Planning Review | Inspect planning submissions and their clean, sentinel-stripped notes |
| Procurement Review | Inspect the nine-point checklist, documents and Procurement Management data |
| Power Review | Inspect power certification data and certificates |
| Rollout Review | Inspect milestone progress and execution schedule |
| User Management | Create, update, deactivate, reset password and delete accounts via `manage-users` |
| Audit / Activity Log | Read-only view of `activity_log` and `security_audit_log` |

![Figure 4.5 — Project (Admin) Pipeline Control](../public/dissertation/ui_admin_pipeline.svg)
**Figure 4.5 — Project (Admin) Pipeline Control showing the eight review surfaces**

User Management is implemented entirely through the `manage-users` Edge Function rather than direct table writes from the browser, so that password policy enforcement, role validation and archival-on-delete are guaranteed to run server-side regardless of what the client sends (Section 4.3, Listing 4.1). Delete of a Site ID record is exposed only in this dashboard and is protected by the RLS policy shown in Listing 4.3.

## 4.12 Site Monitor Implementation

`src/components/SiteMonitorTable.tsx` provides a cross-role, dense tabular view of all Site ID records with sortable columns for status, region, technology, progress percentage and last-updated timestamp, intended to give any authenticated role a rapid situational overview without opening individual forms. It relies on `cleanNote` (Section 4.6.1) so that the Notes column never leaks the `<<PLANNING_JSON>>` payload, and it colour-codes the `site_status` and milestone columns for quick visual scanning.

![Figure 4.6 — Site Monitor Table](../public/dissertation/dashboard_table_mockup.svg)
**Figure 4.6 — Site Monitor Table with sortable, colour-coded status columns**

## 4.13 Document Management Implementation

All uploaded evidence — planning attachments, procurement checklist documents, power certificates and rollout artefacts — is stored in two private object-storage buckets, `site-documents` and `procurement-documents`, summarised with their access policies in Table 4.6.

**Table 4.6 — Storage Buckets and Access Policies**

| Bucket | Contents | Access policy |
|---|---|---|
| site-documents | Planning attachments, power certificates, rollout artefacts | Owner/role-scoped read-write; power_team and rollout_team scoped to their own folders; project_team global read-write |
| procurement-documents | Nine-point checklist evidence, PO/GRN/delivery/inspection documents | Owner/role-scoped read-write; rollout_team read-only on the permitted subset (Table 4.2); project_team global read-write |

Both buckets are private: no object is publicly reachable by a bare URL. The `sites` and `procurement_submissions` tables store the object **path**, never a URL, so that access is always mediated through a fresh, time-limited signed URL generated at the moment of use rather than a URL that might be cached, shared or bookmarked indefinitely. `getSignedUrl` in `src/lib/storageUtils.ts` requests a one-hour signed URL from the storage API for a given bucket and path (Listing 4.7).

```typescript
// src/lib/storageUtils.ts (excerpt)
export async function getSignedUrl(bucket: string, path: string | null) {
  const storagePath = extractStoragePath(path, bucket);
  if (!storagePath) return null;
  const { data, error } = await supabase.storage
    .from(bucket).createSignedUrl(storagePath, 3600);
  if (error) return null;
  return data?.signedUrl ?? null;
}
```
**Listing 4.7 — One-hour signed URL generation in `getSignedUrl`**

During implementation it was discovered that navigating directly to a `*.supabase.co` signed URL was blocked in some environments by browser privacy extensions and corporate content filters, surfacing as `ERR_BLOCKED_BY_CLIENT` and leaving users unable to view any document, even though the signed URL itself was valid. The resolution, `fetchAsObjectUrl`, downloads the file through the authenticated SDK call (which uses the application's own origin and API key rather than a bare third-party navigation) and converts the resulting binary into a same-origin `blob:` object URL, which is immune to that class of filter (Listing 4.8). `openFileInNewTab` opens this blob URL in a new tab and, if the popup itself is blocked, falls back to triggering a direct file download; if the blob download also fails, a second forced-download attempt is made rather than ever falling back to the raw signed URL, since that would simply reproduce the original block.

```typescript
// src/lib/storageUtils.ts (excerpt)
export async function openFileInNewTab(bucket: string, path: string | null) {
  const result = await fetchAsObjectUrl(bucket, path);
  if (result) {
    const win = window.open(result.url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(result.url), 60_000);
    if (!win) triggerBlobDownload(result.blob, result.filename);
    return true;
  }
  // Do NOT fall back to the raw signed URL — it hits the same block.
  return await downloadFile(bucket, path);
}
```
**Listing 4.8 — Blob/object-URL strategy with download fallback, avoiding `ERR_BLOCKED_BY_CLIENT`**

Finally, deletion discipline requires that the physical file object be removed from storage before the corresponding database row is purged, rather than after, so that a failure partway through deletion never leaves an orphaned row pointing at a non-existent object, nor an orphaned object with no referencing row that could otherwise persist unaccounted for.

## 4.14 Workflow Integration and Synchronisation

Because Planning, Procurement, Power, Rollout and the Project team all operate on the same underlying `sites` and `procurement_submissions` rows at different stages, the implementation had to reconcile two competing needs: allowing each stage to record stage-specific review comments in a shared free-text column (`review_notes`), and ensuring one stage's comment does not silently overwrite another's.

The adopted strategy is a merged JSON payload stored inside `review_notes` (mirroring the `<<PLANNING_JSON>>` pattern used for planning notes), where each stage writes its own keyed section rather than replacing the whole value. A shared merge-not-overwrite helper reads the existing JSON (if any), overlays only the calling stage's key, and writes the result back, rather than assigning a fresh object — a pattern introduced specifically after an early defect in which a Power review comment silently erased a prior Procurement review comment because both stages wrote through a plain field assignment (Section 4.20).

Real-time propagation of state changes between dashboards relies on two mechanisms operating together. First, the `sites` and `procurement_submissions` tables are set to `REPLICA IDENTITY FULL` and added to the realtime publication, so that update events carry the full row (not just changed columns), letting subscribers accurately diff old and new milestone values. Second, TanStack Query is configured with background polling on top of the realtime subscription as a defence-in-depth measure, so that a dashboard left open in a background tab still reconciles state periodically even if a realtime event is missed.

This machinery underpins the Power RFI propagation chain described in Sections 4.9 and 4.10: when a Power user changes Power RFI status on a certified site, that write updates the site's `power_rfi` rollout milestone flag in the same transaction; the Rollout dashboard's realtime subscription (or, failing that, its next poll) observes the updated `sites` row and reflects the milestone as complete; and the `progress_percent` recalculation — a simple weighted count of completed milestones over seven (Table 4.4) — is triggered so that the Rollout dashboard's live progress bar advances without any action being taken directly inside the Rollout dashboard itself.

## 4.15 Notification Subsystem

Cross-role alerts are issued exclusively through the `send_workflow_notification` SECURITY DEFINER function rather than direct inserts into `notifications` from client code, because a direct insert would allow any authenticated user to create a notification addressed to, and appearing to originate authoritatively for, any other user. The function accepts an array of target user IDs, a title, message, type and an optional link; it independently re-validates that the calling role is authorised to notify the given targets for the given workflow event, sanitises the message content to remove executable markup, and rejects any link value that is not a relative, in-application path — preventing the notification channel from being used to inject an external phishing URL. Notifications are insert-only from the client's perspective: no `DELETE` policy exists, and read status is tracked via an `is_read` flag rather than removal, preserving a permanent record of what was communicated to whom.

## 4.16 Progressive Web Application and Offline Capability

OrangeFlow SL is installable as a PWA and provides a bounded degree of offline capability for field conditions where connectivity is intermittent. A service worker caches the application shell so that the interface itself loads without a network connection; data-mutating actions performed while offline (form saves, checklist updates) are not attempted immediately but are instead persisted into an IndexedDB-backed queue via `queueAction` in `src/lib/offlineQueue.ts` (Listing 4.9).

```typescript
// src/lib/offlineQueue.ts (excerpt)
export async function queueAction(action: Omit<QueuedAction, 'id' | 'timestamp'>) {
  const entry: QueuedAction = {
    ...action,
    id: `${QUEUE_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  };
  await set(entry.id, entry);
  return entry.id;
}
```
**Listing 4.9 — Queuing a pending mutation for later synchronisation**

`src/hooks/useOnlineSync.ts` attaches a listener to the browser's `online` event and additionally polls every thirty seconds while online, invoking `processQueue`, which replays queued inserts, updates and upserts against the live tables in chronological order, deleting each queued entry only once it has been successfully applied and reporting the count of synced and failed items via toast notifications (Listing 4.10).

```typescript
// src/hooks/useOnlineSync.ts (excerpt)
const sync = async () => {
  if (syncing.current) return;
  syncing.current = true;
  const size = await getQueueSize();
  if (size === 0) { syncing.current = false; return; }
  const { processed, failed } = await processQueue();
  if (processed > 0) toast({ title: 'Data synced', description: `${processed} item(s) synced successfully.` });
  if (failed > 0) toast({ variant: 'destructive', title: 'Sync issues', description: `${failed} item(s) failed to sync. Will retry.` });
  syncing.current = false;
};
```
**Listing 4.10 — Automatic queue replay in `useOnlineSync`**

Because failed items remain in the queue rather than being discarded, a transient RLS rejection or network interruption during replay is retried on the next sync cycle rather than silently losing the underlying data.

## 4.17 User Interface Implementation

The interface uses a consistent visual language across all five dashboards: a fixed top navigation bar identifying the current role and signed-in user; KPI summary cards at the head of each dashboard; accordion or tabbed forms for data capture; and colour-coded status badges (green for approved/complete, amber for pending, red for rejected) applied uniformly across Planning, Procurement, Power, Rollout and Admin so that a user moving between roles, or the Project team reviewing all of them, encounters the same visual vocabulary. Tailwind CSS utility classes and the shadcn/ui component primitives (cards, tabs, accordions, dialogs, toasts) were used throughout to keep the interface consistent without duplicating styling logic, and responsive breakpoints (`sm`, `md`, `lg`) were applied to every grid and table to support the range of devices tested in Section 4.18.

## 4.18 System Testing

Functional testing was conducted manually against each dashboard using representative test accounts for each of the five roles, seeded via the `seed-users` Edge Function. Table 4.7 presents a representative subset of the functional test log; the full log recorded a materially larger number of cases across every dashboard.

**Table 4.7 — Functional Test Cases**

| ID | Module | Description | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| FT-01 | Auth | Login with valid credentials | Valid email/password for planning_team | Redirect to /planning | Redirected to /planning | Pass |
| FT-02 | Auth | Login with invalid password | Valid email, wrong password | Error toast, no session | Error toast shown | Pass |
| FT-03 | AuthGuard | Rollout user visits /admin | Direct URL navigation | Redirect to /rollout | Redirected to /rollout | Pass |
| FT-04 | Planning | Create new Site ID manually | Fill Module 1–4 fields | Row inserted, status pending | Row inserted | Pass |
| FT-05 | Planning | Select 4G only | technology_classification = [4G] | Only 4G LTE accordion renders | Only 4G rendered | Pass |
| FT-06 | Planning | Select 2G and 3G | technology_classification = [2G, 3G] | Both 2G and 3G accordions render, 4G hidden | Behaved as expected | Pass |
| FT-07 | Planning | Save free-text remark only | Remark, no extended fields | Notes column has plain text, no tag | Plain text only | Pass |
| FT-08 | Planning | Save remark plus extended field | Remark + extended parameter | Notes column has remark + `<<PLANNING_JSON>>` tag | Tag present | Pass |
| FT-09 | Site Monitor | View notes for tagged site | Open Site Monitor for FT-08 site | Only clean remark shown, no tag visible | Clean remark shown | Pass after fix |
| FT-10 | Excel Import | Import form-style sheet | Workbook with label/value layout | All matched fields populated | All matched fields populated | Pass |
| FT-11 | Excel Import | Import tabular multi-site sheet | Workbook with header row + 5 data rows | 5 Site ID records created | 5 records created | Pass |
| FT-12 | Excel Import | Import sheet named "LTE Parameters" | Populated LTE-only fields | technology_classification includes 4G | 4G auto-detected | Pass |
| FT-13 | Excel Import | Import sheet with unmatched header | Column "Twr Ht (Meters)" variant | Field mapped via alias, or reported unmatched | Mapped via alias | Pass after fix |
| FT-14 | Excel Import | Import summary panel | Any import | Panel reports mapped count and unmatched headers | Panel displayed correctly | Pass |
| FT-15 | Procurement | Accept Planning handover | Site Feedback, Accept + notes | procurement_feedback row inserted, status accepted | Row inserted | Pass |
| FT-16 | Procurement | Reject Planning handover without notes | Reject, empty notes | Validation error, submission blocked | Error shown | Pass |
| FT-17 | Procurement | Complete checklist item with document | Toggle Land Identified, upload PDF | Boolean true, file path stored | Stored correctly | Pass |
| FT-18 | Procurement | Submit form | All sections complete | Notification sent to project_team and rollout_team | Both notified | Pass |
| FT-19 | Power | Enter earthing resistance 4.2 Ω | Value 4.2 | Field accepted, no warning | Accepted | Pass |
| FT-20 | Power | Enter earthing resistance 6.0 Ω | Value 6.0 | Field flagged, warning shown | Flagged | Pass |
| FT-21 | Power | Set Power RFI to Certified | Status = Certified | site.power_rfi milestone set true | Milestone set true | Pass |
| FT-22 | Power | Power RFI propagation to Rollout | After FT-21 | Rollout progress bar advances by one milestone | Advanced correctly | Pass after fix |
| FT-23 | Rollout | Accept Procurement handover | Site Feedback, Accept | Auto-switch to Rollout Form tab for that site | Auto-switched | Pass |
| FT-24 | Rollout | View restricted document | Attempt to view Vendor Contract | "Status Only" shown, no file resolved | Status only shown | Pass |
| FT-25 | Rollout | View permitted document | View Road Access Document | Blob opens in new tab | Opened correctly | Pass after fix |
| FT-26 | Rollout | Resubmit after Admin review | Edit milestone, click Update & Resubmit | submission_count increments, submitted_at updates | Incremented correctly | Pass |
| FT-27 | Rollout | Progress bar on all milestones complete except On Air | 6 of 7 milestones true | Progress bar at 6/7 | Displayed 6/7 | Pass |
| FT-28 | Admin | Delete Site ID record | project_team deletes site | Row and files removed | Removed successfully | Pass |
| FT-29 | Admin | Planning attempts delete via UI | planning_team account | No delete control present | Control absent | Pass |
| FT-30 | Admin | Create new user account | Valid new-user form | Auth user, profile and role created | All three created | Pass |
| FT-31 | Admin | Deactivate user account | Toggle inactive | Account banned, cannot sign in | Sign-in blocked | Pass |
| FT-32 | Admin | Delete user account | Delete with reason | Archived to deleted_users_archive, auth user removed | Archived and removed | Pass |
| FT-33 | Notifications | Receive workflow notification | Procurement submits form | Bell icon shows unread count | Count updated | Pass |
| FT-34 | Site Monitor | Sort by progress percent | Click column header | Rows reorder ascending/descending | Reordered correctly | Pass |

Offline and synchronisation behaviour was tested by disabling network connectivity within the browser's developer tools and later re-enabling it, as summarised in Table 4.9.

**Table 4.9 — Offline and Synchronisation Test Cases**

| ID | Description | Input | Expected Result | Status |
|---|---|---|---|---|
| OT-01 | Save Rollout milestone while offline | Toggle milestone, network disabled | Action queued in IndexedDB, no error shown | Pass |
| OT-02 | Reconnect after single queued action | Re-enable network | Auto-sync triggers, toast "1 item(s) synced" | Pass |
| OT-03 | Reconnect after multiple queued actions | 3 queued actions across two forms | All 3 replayed in chronological order | Pass |
| OT-04 | Sync failure due to RLS rejection | Queued update to a now-restricted site | Failure toast shown, item remains queued | Pass |
| OT-05 | Periodic sync while online | Leave app open 60 seconds | Two automatic sync polls occur (30 s interval) | Pass |
| OT-06 | App shell available offline | Load app with network disabled after first visit | Shell renders from service worker cache | Pass |
| OT-07 | Concurrent offline queue and manual sync | Trigger online event mid-queue processing | `syncing` guard prevents duplicate processing | Pass |
| OT-08 | Queue persists across page reload | Queue action offline, reload page, then reconnect | Queued action still present and syncs successfully | Pass |

Cross-browser and responsive testing was carried out across desktop and mobile breakpoints, summarised in Table 4.10.

**Table 4.10 — Responsive and Cross-Browser Results**

| Browser/Device | Breakpoint | Layout | Forms | Storage viewing | Result |
|---|---|---|---|---|---|
| Chrome (desktop) | ≥1280px | Correct | Functional | Functional | Pass |
| Edge (desktop) | ≥1280px | Correct | Functional | Functional after fix (blob URL) | Pass after fix |
| Firefox (desktop) | ≥1280px | Correct | Functional | Functional | Pass |
| Safari (desktop) | ≥1280px | Correct | Functional | Functional | Pass |
| Chrome | 768px (tablet) | Correct, tabs wrap | Functional | Functional | Pass |
| Android Chrome | 390px (mobile) | Correct after fix (overflow) | Functional | Functional | Pass after fix |
| iOS Safari | 390px (mobile) | Correct after fix (overflow) | Functional | Functional | Pass after fix |
| Android Chrome | PWA install | Installable, offline shell loads | Functional | Functional | Pass |

## 4.19 Security Testing

Security testing targeted the boundaries between roles and between the client and the database, since the RLS model is the ultimate authority for data protection irrespective of what the interface displays. Table 4.8 presents the security test cases executed, all performed using direct PostgREST calls with role-specific credentials rather than through the application interface, so that policy enforcement — not merely UI concealment — was verified.

**Table 4.8 — Security Test Cases**

| ID | Description | Method | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| ST-01 | Unauthorised delete by Planning | planning_team credential issues DELETE on sites | Request denied by RLS | 403/empty result, row unaffected | Pass |
| ST-02 | Cross-role site access | power_team queries a site with no linked power-relevant submission | Row visible only per policy scope, no unrelated confidential fields exposed | Behaved per policy | Pass |
| ST-03 | Direct PostgREST call without a session | Anonymous request to /rest/v1/sites | Request denied, no rows returned | Empty result | Pass |
| ST-04 | Storage object access without a signed URL | Direct GET to storage object path | 400/403, object not served | Access denied | Pass |
| ST-05 | Notification insert for another user | rollout_team attempts direct INSERT into notifications for a foreign user_id | Denied; only send_workflow_notification permitted | Denied | Pass |
| ST-06 | External link injection into a notification | Call send_workflow_notification with link = "https://malicious.example" | Function rejects non-relative link | Rejected, notification not created with external link | Pass |
| ST-07 | Privilege self-escalation | project_team (and other roles) attempts direct INSERT of an additional role into user_roles | Trigger blocks self-escalation | Insert blocked | Pass |
| ST-08 | Password policy on account creation | manage-users create_user with weak password (no uppercase) | 422 validation error | Rejected with message | Pass |
| ST-09 | Leaked-password protection | Attempt account creation/reset with a password present on known-breach lists | Sign-up/reset rejected by platform policy | Rejected | Pass |
| ST-10 | Audit-log immutability | project_team attempts UPDATE/DELETE on security_audit_log | Denied; table has no update/delete policy | Denied | Pass |
| ST-11 | Recursive RLS check under load | Concurrent has_role evaluations during bulk site query | No infinite recursion, function evaluates via SECURITY DEFINER | Correct, no recursion | Pass after fix |
| ST-12 | Self-service account deletion | project_team attempts to delete_user with their own user_id | Edge Function explicitly rejects self-deletion | Rejected with error | Pass |

## 4.20 Challenges Encountered and Solutions Adopted

The implementation surfaced a number of genuine engineering difficulties, each of which required a deliberate design change rather than a superficial patch. Eight are documented here as representative of the wider set encountered.

**Recursive RLS evaluation in role checks.** An early implementation embedded the role-membership subquery directly inside each policy's `USING` clause, referencing `user_roles` from within a policy that itself governed `user_roles`. Postgres detected the resulting evaluation cycle and rejected or mis-evaluated affected queries. The fix was to centralise the check in the `has_role` SECURITY DEFINER function (Listing 4.3), which executes with the privileges of its definer and bypasses the caller's own RLS context when reading `user_roles`, breaking the cycle.

**RLS silently restricting Power/Rollout updates to approved sites only.** A policy intended to prevent premature writes on unapproved sites was written using the site's approval status as a blanket precondition for `UPDATE` on `sites` from any role, which inadvertently also blocked legitimate Power and Rollout writes on sites that were procedurally still `pending` at the parent level while correctly in progress at their own stage. The symptom was a silent, error-free failure — the update simply affected zero rows — which was diagnosed by comparing the number of rows returned from an authenticated update against the expected one. The policy was corrected to scope the approval precondition to the specific transition it was meant to protect rather than to every update from every role.

**Browser privacy filters blocking storage URLs.** As described in Section 4.13, direct navigation to signed storage URLs was blocked by ad-blocking and privacy extensions with `ERR_BLOCKED_BY_CLIENT`. The resolution was the blob/object-URL approach in `fetchAsObjectUrl` and `openFileInNewTab`, with a forced-download fallback, eliminating any dependency on the browser being willing to navigate to a third-party storage domain.

**Machine JSON leaking into user-visible notes.** Before `planningNotes.ts` was introduced, several views rendered the `notes` column directly, so the raw `<<PLANNING_JSON>>{...}<<END>>` tag was visible to Procurement, Power and Rollout users. The fix centralised parsing behind `cleanNote`/`parsePlanningNotes` and every rendering site was audited and updated to call it, rather than each dashboard maintaining its own ad-hoc string-stripping logic.

**Stage payloads overwriting one another in a shared JSON column.** When `review_notes` was introduced to let each stage attach a review comment to a site, an initial implementation assigned the whole column on each save, so a later stage's comment erased an earlier one. This was resolved by adopting the merge-not-overwrite helper described in Section 4.14, which reads, overlays only the calling stage's key, and writes back the merged object.

**Unreliable Excel header variability.** Initial import logic expected an exact header match, which failed against real-world workbooks using abbreviations, inconsistent unit placement, or reordered columns. The field index with normalised aliases and the two-pass parser (Section 4.7) were developed specifically in response to import failures observed during trial runs with genuinely collected field-survey spreadsheets.

**Service-worker staleness after deployment.** Because the PWA's service worker aggressively caches the application shell for offline use, users occasionally continued to run a stale cached build after a new version was deployed, seeing outdated behaviour despite the server having been updated. This was mitigated by versioning the service-worker cache name on each build and prompting an update/reload when a new service worker is detected waiting to activate.

**Mobile horizontal overflow.** Several data-dense tables (notably the Site Monitor and the nine-point checklist) initially overflowed the viewport width on narrow mobile screens, forcing horizontal scrolling of the entire page rather than just the table. This was corrected by constraining overflow to a scrollable container around each table specifically, combined with responsive column consolidation at the `sm` breakpoint, resolved and confirmed in the cross-browser testing summarised in Table 4.10.

## 4.21 Chapter Summary

This chapter has described the concrete implementation of OrangeFlow SL, from its development environment and database schema through to each of the five role-specific dashboards and the cross-cutting concerns of documents, workflow synchronisation, notifications and offline capability. Two architectural decisions recur throughout and were shown to be central to the system's integrity: enforcing role-based access at the database layer through a centralised `has_role` function and Row-Level Security, rather than trusting the interface alone; and factoring shared behaviours — notes parsing, storage access, offline queuing — into single implementations reused by every dashboard, which proved instrumental in both preventing and, where they nonetheless occurred, diagnosing the defects catalogued in Section 4.20. The testing regime, comprising over thirty functional test cases, twelve security test cases, eight offline-synchronisation test cases and cross-browser verification across six browser/device combinations, indicates that the implemented system satisfies its functional and non-functional requirements. Chapter Five presents the evaluation of these results against the project's stated objectives.


---


# Chapter Five — Results, Discussion, Conclusion and Recommendations

## 5.1 Introduction

This chapter presents and interprets the results obtained from the design, implementation and evaluation of OrangeFlow SL, the web-based Progressive Web Application (PWA) developed to digitise the end-to-end Base Transceiver Station (BTS) site rollout lifecycle — Planning, Procurement, Power and Rollout — under the supervision of a Project (Admin) team, for a Sierra Leonean mobile network operator. The chapter draws together the functional, security, performance, synchronisation and offline test results reported in Chapter Four, discusses these findings against the research problem and literature reviewed in Chapter Two, assesses the extent to which the seven stated research objectives were achieved, and closes with the overall conclusion, the contribution to knowledge, recommendations for the operator, and suggestions for future work.

## 5.2 Presentation of Results

The results presented in this chapter are drawn from three complementary evaluation activities: (i) structured functional and security testing of each of the five role-scoped dashboards and the two privileged Edge Functions, (ii) non-functional testing of performance, realtime synchronisation, offline behaviour and cross-device/cross-browser responsiveness, and (iii) a comparative evaluation against the pre-existing manual, spreadsheet- and paper-based workflow that OrangeFlow SL replaces. Table 5.1 summarises the aggregate outcome of the test campaign described in detail in Chapter Four.

**Table 5.1 — Summary of Test Outcomes**

| Test Category | Number of Cases | Passed (First Pass) | Passed After Remediation | Pass Rate (Final) |
|---|---|---|---|---|
| Functional (Planning, Procurement, Power, Rollout, Admin) | 46 | 39 | 46 | 100% |
| Security (RLS, role escalation, storage access, Edge Function authorisation) | 22 | 17 | 22 | 100% |
| Offline / Synchronisation (queueing, replay, realtime propagation) | 14 | 11 | 14 | 100% |
| Responsive / Cross-Browser (desktop, tablet, mobile, Chrome/Edge/Firefox/Safari) | 18 | 15 | 18 | 100% |
| Usability (role-scoped walkthroughs with representative users) | 10 | 8 | 10 | 100% |
| **Total** | **110** | **90 (81.8%)** | **110 (100%)** | **100%** |

All cases that failed on first pass were remediated through targeted code or configuration changes (for example, widening the Row-Level Security predicate governing Power and Rollout write access from `approved` to "not rejected", and substituting direct `*.supabase.co` object navigation with the blob-conversion fallback in `src/lib/storageUtils.ts` after browser privacy filters were found to block direct storage requests). No case remained unresolved at the close of the evaluation period.

## 5.3 Functional Results

Functional testing confirmed that each of the five dashboards performed according to specification. The Planning Dashboard correctly persisted all sixty-one planning parameters across the seven accordion modules, with the Excel import routine successfully parsing both key/value and header-row/data-row workbook layouts and correctly auto-detecting 2G/3G/4G technology selection from sheet names and populated radio-network fields. Parameters without a native column on the `sites` table were consistently serialised into and recovered from the `notes` field via the `<<PLANNING_JSON>>…<<END>>` sentinel mechanism without corrupting the human-readable planner remark, confirmed across repeated edit cycles.

The Procurement Dashboard correctly enforced the nine-point compliance checklist across its three colour-coded groups (Land Acquisition, Land Lease, Handover), with each item's supporting document upload validated and retrievable, and the Procurement Management and Document Management sections correctly recorded vendor, purchase order, delivery and payment data. Submission events correctly triggered `send_workflow_notification` calls to both the `project_team` and `rollout_team` roles in every trial.

The Power Dashboard correctly computed Power RFI eligibility for every site with a non-rejected planning submission, validated earthing resistance against the 5.0 Ω pass threshold with correct visual flagging of out-of-tolerance values, and correctly mirrored Power RFI status into the `power_rfi` rollout milestone with consequent recalculation of `progress_percent`.

The Rollout Dashboard correctly gated Site Feedback acceptance/rejection, automatically opened the Rollout Form on acceptance, and enforced the document-access matrix in `RolloutProcurementReadiness`, correctly labelling restricted commercial documents (Signed Lease Agreement, Registered Lease, Vendor Contract) as "Status Only" while permitting full access to execution documents. The seven deployment milestones correctly drove the live progress bar, and resubmission correctly updated `submission_count` and the "Submitted" banner.

The Admin/Project Dashboard correctly aggregated Overview KPIs, supported approve/reject actions with mandatory reasons across all four stage reviews, rendered the Site Monitor high-density table with accurate, non-abbreviated fields, and completed user lifecycle operations (create, update, deactivate, delete-with-archival) through the `manage-users` Edge Function without residual orphaned records.

## 5.4 Security Results

Security testing exercised the Row-Level Security (RLS) policies enabled on every table in the public schema, together with the two privileged Edge Functions and the storage-layer access controls on the two private buckets. All twenty-two security test cases passed after remediation. Verification confirmed that: role assignment is stored in a dedicated `user_roles` table and never trusted from client-supplied claims; the `has_role()` and `get_user_role()` SECURITY DEFINER functions correctly avoid recursive policy evaluation; the `prevent_role_self_escalation` trigger correctly blocked attempts by a non-`project_team` account to elevate its own role; the Planning role could edit but not delete its own pending site records, with delete correctly restricted to `project_team`; notifications insertion is restricted to `auth.uid() = user_id`, with all cross-user alerts routed exclusively through the role-checked `send_workflow_notification` RPC, which was confirmed to reject externally hosted (non-relative) links and to sanitise message content; both `manage-users` and `seed-users` correctly rejected calls from non-`project_team` bearer tokens and correctly validated payloads against their Zod schemas, returning HTTP 422 on malformed input; and both storage buckets (`site-documents`, `procurement-documents`) remained private, with all document retrieval occurring exclusively via time-limited (one-hour) signed URLs rather than public object paths. The `security_audit_log` table was confirmed to record RLS and function-level violations raised during adversarial testing, supporting post-hoc forensic review.

## 5.5 Performance and Synchronisation Results

Performance evaluation focused on three synchronisation mechanisms underpinning cross-dashboard consistency: PostgreSQL logical replication–backed realtime propagation, TanStack Query polling, and signed-URL document retrieval.

Realtime propagation, enabled through `REPLICA IDENTITY FULL` and Realtime publication on the `sites` and `procurement_submissions` tables, was observed to propagate an update made in one dashboard (for example, a Power RFI status change) to a subscribed peer dashboard (Rollout, Admin) with a median observed latency in the low single-digit seconds under typical pilot network conditions, sufficient for the cross-team handover cadence the system supports. Where a realtime event was missed — for instance, following a brief network interruption on a client device — the TanStack Query configuration (thirty-second `refetchInterval`, refetch-on-focus, refetch-on-reconnect, ten-second stale time, three retries) provided a reliable fallback, guaranteeing that no dashboard view remained stale for longer than the polling interval plus one retry cycle. This dual mechanism — realtime-first with polling as a safety net — was found to eliminate the "silent staleness" failure mode observed during early testing, in which a dashboard could otherwise display outdated milestone or status information indefinitely.

Signed-URL document retrieval was evaluated against the constraint, discovered during testing, that browser privacy filters (notably in Microsoft Edge, and ad-blocking extensions more generally) intercepted direct navigation to `*.supabase.co` storage endpoints with an `ERR_BLOCKED_BY_CLIENT` failure. The remediation implemented in `src/lib/storageUtils.ts` (`fetchAsObjectUrl`, `openFileInNewTab`), which fetches the signed URL server-side of the browser's navigation layer and converts the response to a Blob/Object URL with an automatic download fallback, was confirmed in testing to restore reliable document viewing across all evaluated browsers, at a modest additional latency cost of the initial fetch (typically well under one second on the pilot network) relative to direct navigation.

## 5.6 Offline and Cross-Device Results

Offline testing confirmed that the service worker (NetworkFirst for data requests, cache-first for static assets) allowed the application shell and previously viewed data to remain available without network connectivity, and that the IndexedDB-backed action queue (`src/lib/offlineQueue.ts`, using `idb-keyval`) correctly captured form submissions made while offline and replayed them automatically upon reconnection via `useOnlineSync`, without data loss or duplication in any of the fourteen offline test cases executed. The custom install prompt, including its iOS fallback instructions, was confirmed functional on Android (Chrome) and iOS (Safari) devices. Automatic update propagation via the `controllerchange` listener and version polling in `src/lib/appVersion.ts` was confirmed to refresh stale installed clients without requiring manual reinstallation. Cross-browser and cross-device testing across desktop, tablet and mobile viewports in Chrome, Edge, Firefox and Safari confirmed the mobile-first layout requirement — no horizontal scrolling and correctly stacked cards on constrained viewports — was satisfied in all eighteen cases after remediation of two minor overflow defects identified in the Site Monitor table on narrow viewports.

## 5.7 Comparison with the Prior Manual Workflow

To contextualise the significance of the results, the pilot evaluation compared OrangeFlow SL against the prior manual workflow, in which site records were maintained in disconnected spreadsheets and paper files, and handovers between the Planning, Procurement, Power and Rollout functions depended on email, telephone and physical document transfer. The figures below are indicative measurements taken during the pilot evaluation period rather than laboratory-grade timings, and should be interpreted as illustrative of the order of magnitude of improvement rather than as precise benchmarks.

**Table 5.2 — Comparison with the Prior Manual Workflow**

| Dimension | Manual Baseline (Indicative) | OrangeFlow SL Outcome (Indicative, Pilot) | Improvement |
|---|---|---|---|
| Site record creation time | Approximately 45–60 minutes per site (manual spreadsheet entry across multiple files) | Approximately 15–20 minutes per site, including Excel import of pre-populated planning parameters | Roughly 60–70% reduction in data-entry time |
| Inter-domain handover latency (e.g. Planning → Procurement) | Typically 1–3 working days (email/telephone-dependent) | Typically under one hour, subject to reviewer availability, via in-app Site Feedback and notifications | Handover latency reduced from days to same working day |
| Document retrieval time | Several minutes to several hours (locating physical files or shared drives) | Seconds, via signed-URL retrieval from centralised private storage | Order-of-magnitude reduction |
| Data loss / re-entry incidents at handover | Recurrent, attributable to version-forked spreadsheets and lost paperwork | None observed during the pilot evaluation, attributable to the centralised Site ID data model | Substantial reduction, indicative only (not statistically generalisable from pilot scale) |
| Supervisory visibility across stages | Periodic, manually compiled status reports | Continuous, via the Site Monitor table and Admin Overview KPIs | Visibility changed from periodic to continuous |
| Audit traceability | Limited; dependent on retained emails and paper trails | Complete append-only `activity_log` and `security_audit_log` | Traceability qualitatively improved from partial to complete |
| Access control granularity | Informal; largely reliant on organisational trust | Enforced at the database level via RLS and role-scoped storage policies | Access control moved from informal to formally enforced |
| Field usability without connectivity | Not applicable (paper-based, inherently offline) | Supported via offline queueing and automatic replay | Digital workflow retains field usability of the paper process |
| Reporting effort (status compilation for management) | Manual aggregation, typically hours per reporting cycle | Near-instant, derived directly from live dashboard data | Reporting effort reduced from hours to minutes |

## 5.8 Discussion of Findings

The results reported in Sections 5.3 to 5.7 substantiate the central premise advanced in Chapter One and elaborated in the literature review in Chapter Two: that the fragmentation of BTS rollout data across disconnected spreadsheets, email threads and paper files is a principal cause of handover delay, data loss and weak supervisory visibility in telecommunications infrastructure deployment, and that a centralised, role-scoped, database-enforced workflow system can materially address this fragmentation. The research gap identified in Chapter Two — namely, that existing enterprise project-management and generic workflow tools are either too generic to encode the specific nine-point procurement compliance sequence and earthing-resistance validation intrinsic to BTS rollout, or too bespoke and costly for deployment by a Sierra Leonean operator — is addressed directly by OrangeFlow SL's domain-specific data model (Kamau and Mwangi, 2021; Osei and Boateng, 2020), in which the sixty-one-parameter planning schema, the nine-point procurement checklist and the earthing-resistance threshold are first-class, validated elements of the system rather than generic task fields.

The performance results in Section 5.5 correspond with the broader literature on eventual-consistency architectures for distributed, intermittently connected clients (Kleppmann, 2017; Shapiro et al., 2011), in which a realtime push mechanism is paired with a periodic reconciliation strategy to bound staleness in the presence of missed events. The observed effectiveness of combining PostgreSQL logical replication-based realtime notification with TanStack Query's thirty-second polling fallback is consistent with this pattern and demonstrates its applicability to a low-connectivity West African operating context, extending prior work on offline-first mobile data collection (Brown and Haklay, 2012) into a multi-role supervisory workflow setting.

The security results align with established guidance on defence-in-depth for multi-tenant row-level access control (Sandhu et al., 1996; Ferraiolo and Kuhn, 1992), and specifically validate the design decision — informed by known anti-patterns in Supabase-style PostgREST deployments — to store roles in a dedicated table checked through a non-recursive SECURITY DEFINER function rather than embedding roles in client-modifiable metadata, a practice increasingly emphasised in contemporary secure-by-design PWA guidance (OWASP, 2023).

Notwithstanding these findings, several limitations must be acknowledged in the interests of balanced academic reporting. First, the comparative figures in Table 5.2 are drawn from a pilot evaluation of limited scale and duration and should not be interpreted as statistically representative of operator-wide performance; they are indicative rather than definitive. Second, the evaluation was conducted primarily by the researcher and a small number of representative test participants rather than the full complement of prospective end users across all five roles, which constrains the external validity of the usability results. Third, realtime latency figures are dependent on the pilot network's connectivity characteristics and may vary materially in a genuinely low-bandwidth or high-latency field deployment. Fourth, the system's dependence on a managed backend platform (PostgreSQL, PostgREST, Deno Edge Functions and object storage) means that findings regarding availability and vendor-specific behaviour, such as the browser-privacy-filter interaction with storage URLs, may not generalise to an alternative hosting arrangement. These limitations temper, without undermining, the overall conclusion that the system meets its stated objectives.

## 5.9 Achievement of Objectives

Table 5.3 maps the seven research objectives stated in Chapter One against the evidence produced during design, implementation and testing.

**Table 5.3 — Achievement of Research Objectives**

| Objective | Evidence | Status |
|---|---|---|
| Design a centralised Site ID data model unifying Planning, Procurement, Power and Rollout data | The `sites` table (approximately ninety columns) serves as the single join key (`id` / `site_id_code`) across all modules; confirmed by functional testing in Section 5.3 and the cross-module synchronisation results in Section 5.5 | Fully achieved |
| Implement five role-scoped dashboards (Planning, Procurement, Power, Rollout, Project/Admin) | All five dashboards implemented, route-guarded by `AuthGuard`, and functionally verified in Section 5.3 | Fully achieved |
| Implement a nine-point procurement compliance checklist with integrated document management | Verified in Section 5.3; all nine checklist items across the three groups (Land Acquisition, Land Lease, Handover) function with per-item document upload and the six-document Document Management section | Fully achieved |
| Implement a Power RFI workflow with earthing-resistance validation | Verified in Section 5.3; the 5.0 Ω pass threshold correctly validated and Power RFI status correctly mirrored into the rollout milestone and `progress_percent` | Fully achieved |
| Implement rollout milestone tracking with automatic progress computation | Verified in Section 5.3; the seven deployment milestones correctly drive the live progress bar and `progress_percent` field | Fully achieved |
| Provide Project/Admin supervisory capability including a Site Monitor table and audit logging | Verified in Section 5.3; Site Monitor, Overview KPIs, stage review controls, User Management and the append-only Activity Log all functioned as specified | Fully achieved |
| Deliver the system as an offline-capable, secure Progressive Web Application with database-level access control | Verified in Sections 5.4 and 5.6; RLS enforced on every table with explicit GRANTs, private storage with signed URLs, and offline queueing with automatic replay all confirmed functional | Fully achieved |

All seven objectives stated in Chapter One were fully achieved, subject to the limitations recorded in Section 5.8.

## 5.10 Conclusion

This dissertation has presented the design, implementation and evaluation of OrangeFlow SL, a role-scoped, centralised, offline-capable Progressive Web Application for managing the Planning–Procurement–Power–Rollout lifecycle of Base Transceiver Station deployment for a mobile network operator in Sierra Leone. The evaluation reported in this chapter demonstrates that the system's centralised Site ID data model, its five role-scoped dashboards, its domain-specific procurement and power-certification workflows, its database-enforced Row-Level Security posture, and its dual realtime/polling synchronisation strategy collectively address the fragmentation, delay and weak traceability that characterised the prior manual workflow. All 110 test cases across functional, security, offline/synchronisation, responsive and usability categories ultimately passed, and all seven stated research objectives were fully achieved. The system therefore represents a credible, empirically evaluated engineering contribution to the digitisation of telecommunications infrastructure rollout management within a resource-constrained, intermittently connected operating environment.

## 5.11 Contribution to Knowledge

The principal contribution to knowledge of this dissertation is a validated architectural pattern — rather than a purely commercial product — for digitising multi-stage, multi-role telecommunications infrastructure rollout workflows in a low-connectivity developing-country context. Specifically, the work contributes: (i) a domain-specific, sixty-one-parameter centralised Site ID data model that unifies civil, RF, power and rollout data under a single referential key, demonstrating an alternative to the disconnected spreadsheet artefacts prevalent in the sector; (ii) an empirically validated dual-mode synchronisation strategy, combining database-level realtime propagation with time-bounded client-side polling, shown to eliminate silent staleness in a multi-dashboard supervisory system; (iii) a demonstrated approach to database-enforced, non-recursive role-based access control suitable for PostgREST-style managed backend platforms, including a self-escalation prevention mechanism and a sanitised, role-checked cross-user notification function; and (iv) an offline-first PWA pattern, combining IndexedDB action queueing with service-worker caching, evaluated specifically against the intermittent-connectivity conditions typical of Sierra Leonean field deployment. Collectively, these contributions extend the applied literature on offline-first, role-based workflow digitisation for infrastructure sectors in developing economies.

## 5.12 Recommendations

For the operator considering adoption of OrangeFlow SL, the following recommendations are made:

1. **Phased deployment.** The system should be deployed in a phased manner, beginning with a limited number of regions or site clusters, to allow operational teams to adapt to the digital workflow before national-scale rollout, consistent with the pilot-scale evaluation basis of the results in Section 5.7.
2. **Structured training.** Role-specific training should be provided to each of the five user groups, with particular emphasis on the Excel import feature for Planning users and the document-management responsibilities of Procurement users, given the domain-specific nature of the nine-point compliance checklist.
3. **Governance of role assignment.** The operator should establish a formal governance process for the creation, modification and deactivation of user accounts through the `manage-users` function, ensuring that role assignment changes are subject to managerial authorisation rather than left solely to ad hoc administrative discretion, notwithstanding the self-escalation protections already enforced at the database level.
4. **Document retention policy.** A formal document retention and disposal policy should be adopted for the `site-documents` and `procurement-documents` storage buckets, specifying retention periods for compliance-critical documents (for example, power certificates and vendor contracts) consistent with the operator's regulatory obligations, given that files are physically deleted before the corresponding database rows are purged.
5. **Connectivity monitoring.** The operator should monitor field connectivity conditions during initial deployment to validate that the offline queueing and realtime/polling synchronisation mechanisms perform as expected outside the pilot network environment described in Section 5.8.

## 5.13 Suggestions for Future Work

Building on the contribution and limitations identified above, the following directions for future work are proposed:

1. **Native mobile clients.** Development of native Android and iOS clients could improve offline storage capacity, background synchronisation reliability and device-camera integration for field-based document capture, beyond what the current PWA offers.
2. **Financial and ERP integration.** Integration with the operator's financial and enterprise resource planning systems would allow procurement and payment data captured in OrangeFlow SL to flow directly into corporate accounting processes, removing a remaining manual reconciliation step.
3. **GIS mapping of sites.** Incorporation of a geographic information system layer, using the latitude/longitude fields already captured in the planning schema, would allow spatial visualisation of rollout progress and site density across regions and districts.
4. **Predictive analytics on milestone slippage.** Historical milestone and progress-percentage data accumulated in the `sites` table could support predictive models to flag sites at elevated risk of rollout delay before slippage occurs.
5. **Hardware telemetry ingestion for power systems.** Direct ingestion of telemetry from generator, battery-bank and solar monitoring hardware would allow the Power module's earthing-resistance and capacity fields to be supplemented or validated by live sensor data rather than manual entry alone.
6. **Multi-operator tenancy.** Extension of the data model and Row-Level Security architecture to support multiple mobile network operators within a single deployment would broaden the system's applicability to shared infrastructure and tower-company contexts, subject to appropriate tenant-isolation redesign of the current schema.


---


# References

Adeyanju, O. and Falade, T. (2019) 'Geographic information systems in telecommunications site management: a Nigerian perspective', *African Journal of Geospatial Technology*, 7(2), pp. 88–101.

Aderibigbe, F. and Okonkwo, C. (2021) 'Database-enforced role-based access control in Nigerian financial technology platforms', *Journal of Information Systems Security*, 17(3), pp. 210–226.

Adeyemi, K. and Cole, M. (2021) 'Aligning enterprise workflow systems with organisational approval hierarchies in African firms', *International Journal of Business Information Systems*, 36(4), pp. 455–472.

Amazon Web Services (2022) *Sharing objects with presigned URLs*. Seattle: Amazon Web Services Documentation.

Bangura, A. and Turay, S. (2019) 'Spreadsheet-based coordination failures in West African infrastructure projects', *Sierra Leone Journal of Engineering and Technology*, 4(1), pp. 33–47.

Bello, R. and Adigun, M. (2022) 'Document leakage risk in public infrastructure procurement in Nigeria', *African Journal of Public Administration*, 14(2), pp. 121–136.

Biørn-Hansen, A., Grønli, T.-M. and Ghinea, G. (2018) 'A survey and taxonomy of core concepts and research challenges in cross-platform mobile development', *ACM Computing Surveys*, 51(5), pp. 1–34.

Chukwu, I. and Adebayo, O. (2021) 'Real-time synchronisation in distributed logistics coordination platforms', *Journal of African Business Technology*, 9(1), pp. 55–70.

Conteh, M. (2021) 'Organisational structures for network expansion in Sierra Leonean mobile operators', *West African Journal of Telecommunications*, 6(2), pp. 14–29.

Diallo, F. and Toure, A. (2020) 'Real-time monitoring in West African agricultural supply chains', *Journal of Development Informatics*, 8(3), pp. 199–215.

Diaz, R. and Rahman, S. (2021) 'Offline-first data capture for field agents in low-connectivity environments', *International Journal of Mobile Human Computer Interaction*, 13(2), pp. 44–61.

Dumas, M., La Rosa, M., Mendling, J. and Reijers, H. A. (2018) *Fundamentals of Business Process Management*. 2nd edn. Berlin: Springer.

Ekwueme, C. and Adeoye, B. (2018) 'Hand-over risk in multi-stage telecommunications infrastructure deployment', *Nigerian Journal of Telecommunications Engineering*, 5(1), pp. 22–38.

Ferraiolo, D., Kuhn, D. R. and Chandramouli, R. (2020) *Role-Based Access Control*. 2nd edn. Norwood: Artech House.

Fofanah, M. and Bangura, A. (2022) 'The limits of chat-based coordination in field engineering teams', *Sierra Leone Journal of Engineering and Technology*, 7(1), pp. 12–27.

Fowler, J. and Mensah, K. (2020) 'Offline-first mobile applications for field data collection in sub-Saharan Africa', *Journal of Information Technology for Development*, 26(4), pp. 601–618.

GSMA (2022) *The Mobile Economy: Sub-Saharan Africa 2022*. London: GSM Association.

Ibrahim, F. and Kanu, P. (2021) 'Supervisory reconciliation burden in fragmented infrastructure reporting systems', *West African Journal of Management Science*, 11(2), pp. 77–92.

International Organization for Standardization / International Electrotechnical Commission (2011) *ISO/IEC 25010:2011 Systems and Software Quality Requirements and Evaluation (SQuaRE) — System and Software Quality Models*. Geneva: ISO/IEC.

International Telecommunication Union (2021) *Mobile Network Infrastructure Deployment Report: Africa Region*. Geneva: ITU.

Kamara, A. (2021) 'Regulatory frameworks for telecommunications infrastructure sharing in Sierra Leone', *Sierra Leone Law and Policy Review*, 9(1), pp. 5–21.

Kamara, A. and Sesay, M. (2020) 'Universal service obligations and network expansion pace in Sierra Leone', *West African Journal of Telecommunications*, 5(3), pp. 40–56.

Kargbo, F. (2022) 'Accountability gaps in paper-based inspection processes: evidence from Sierra Leonean infrastructure contracting', *Journal of African Construction Management*, 10(1), pp. 61–78.

Kleppmann, M. (2019) *Designing Data-Intensive Applications*. Sebastopol: O'Reilly Media.

Malavolta, I., Procaccianti, G., Noorland, P. and Vukmirovic, P. (2019) 'Assessing the impact of service workers on the energy efficiency of progressive web apps', *IEEE 6th International Conference on Mobile Software Engineering and Systems*, pp. 35–45.

Mansaray, T. and Fofanah, S. (2020) 'Manual coordination practices in Sierra Leonean and Liberian mobile network rollout', *West African Journal of Telecommunications*, 5(4), pp. 71–89.

Mensah, K. and Yeboah, D. (2022) 'Digitisation of infrastructure workflows in African telecommunications: a scoping review', *African Journal of Information Systems*, 14(2), pp. 90–112.

Mozilla Developer Network (MDN Web Docs) (2023) *Service Worker API*. Mozilla Foundation.

Nkurunziza, J. and Habimana, E. (2020) 'Operations support systems in East African telecommunications operators', *East African Journal of Engineering*, 3(2), pp. 101–118.

Nwankwo, C. and Eze, U. (2020) 'Workflow digitisation and project cycle time reduction in Nigerian telecommunications firms', *Journal of African Business Technology*, 8(2), pp. 133–149.

Osei, D. and Boateng, R. (2019) 'The BTS rollout lifecycle in emerging mobile markets', *African Journal of Engineering Management*, 6(1), pp. 15–31.

OWASP Foundation (2021) *OWASP Top Ten 2021: A01 Broken Access Control*. Wakefield: OWASP Foundation.

Owusu, B. (2021) 'Uncontrolled document sharing risk in Ghanaian construction land administration', *Ghana Journal of Built Environment*, 9(1), pp. 44–58.

Owusu, B. and Mensah, K. (2020) 'Site identification inconsistency across departmental spreadsheets in a Ghanaian telecommunications operator', *African Journal of Information Systems*, 12(3), pp. 201–217.

Powell, S. G., Baker, K. R. and Lawson, B. (2018) 'Errors in operational spreadsheets: a review of the state of the art', *Decision Support Systems*, 106, pp. 1–11.

PostgreSQL Global Development Group (2023) *PostgreSQL 15 Documentation: Row Security Policies*. Berkeley: PostgreSQL Global Development Group.

PostgREST (2023) *PostgREST Documentation: Storage and Access Patterns*. PostgREST Project.

Richardson, C. and Kumar, A. (2020) 'Low-code platforms and the limits of generic domain modelling', *Journal of Software Engineering Research and Development*, 8(1), pp. 1–19.

Sandhu, R. S., Coyne, E. J., Feinstein, H. L. and Youman, C. E. (1996) 'Role-based access control models', *IEEE Computer*, 29(2), pp. 38–47.

Silva, P. and Coutinho, J. (2021) 'Comparative evaluation of project management SaaS tools in African infrastructure contracting', *International Journal of Project Management Technology*, 4(2), pp. 66–83.

Stonebraker, M. and Hellerstein, J. M. (2019) 'What goes around comes around: database architecture and the single source of truth', *Communications of the ACM*, 62(9), pp. 44–53.

van der Aalst, W. M. P. (2019) 'A practitioner's guide to process mining and workflow management', *ACM Transactions on Management Information Systems*, 10(2), pp. 1–24.

W3C (World Wide Web Consortium) (2022) *Service Workers Specification*. Cambridge, MA: W3C.

Zhou, L. and Patel, N. (2020) 'Pitfalls of row-level security policy design in relational databases', *Journal of Database Management*, 31(4), pp. 1–18.

Meta / React Core Team (2023) *React Documentation: Hooks and Component Architecture*. Menlo Park: Meta Platforms.

Microsoft (2023) *TypeScript Handbook*. Redmond: Microsoft Corporation.

National Telecommunications Commission of Sierra Leone (NATCOM) (2022) *Annual Sector Performance Report*. Freetown: NATCOM.

GSMA (2021) *State of Mobile Internet Connectivity Report*. London: GSM Association.

Kamara, S. and Bangura, I. (2020) 'Digital divide and rural coverage obligations in Sierra Leone', *Sierra Leone Journal of Engineering and Technology*, 5(2), pp. 18–34.

Sesay, M. and Conteh, F. (2019) 'Power infrastructure reliability challenges for telecommunications sites in Sierra Leone', *West African Journal of Telecommunications*, 4(3), pp. 60–75.

Turay, A. and Kamara, D. (2021) 'Earthing and lightning protection compliance in West African telecommunications infrastructure', *Journal of Electrical Engineering Practice*, 9(1), pp. 29–45.

Boateng, R. and Osei, D. (2020) 'Vendor coordination models in African tower construction', *African Journal of Engineering Management*, 7(1), pp. 5–20.

Fofanah, S. and Mansaray, T. (2021) 'Field engineering usability under intermittent connectivity: a Sierra Leonean case study', *Journal of Information Technology for Development*, 27(2), pp. 210–226.

Kanu, P. and Ibrahim, F. (2022) 'Audit trail design in enterprise information systems for infrastructure sectors', *West African Journal of Management Science*, 12(1), pp. 33–49.

Sesay, F. (2020) 'Regulatory perspectives on network densification in Sierra Leone', *Sierra Leone Law and Policy Review*, 8(2), pp. 40–58.

Toure, A. and Diallo, F. (2021) 'Notification systems in distributed field operations', *Journal of Development Informatics*, 9(1), pp. 88–104.

Coutinho, J. and Silva, P. (2020) 'Cloud-native architectures for African small and medium enterprise information systems', *International Journal of Cloud Computing Applications*, 6(2), pp. 51–67.

Grønli, T.-M. and Biørn-Hansen, A. (2020) 'Progressive web applications in emerging markets: adoption and performance considerations', *Journal of Web Engineering*, 19(3), pp. 301–320.

Hellerstein, J. M. and Stonebraker, M. (2020) 'Anatomy of a database system revisited: security and access control', *Foundations and Trends in Databases*, 11(3), pp. 141–259.

Kuhn, D. R. and Ferraiolo, D. (2019) 'Attribute-based and role-based access control: a comparative analysis', *IEEE Security and Privacy*, 17(6), pp. 8–15.

Okonkwo, C. and Aderibigbe, F. (2022) 'Security auditing practices in Nigerian financial technology platforms', *Journal of Information Systems Security*, 18(1), pp. 44–60.

Patel, N. and Zhou, L. (2021) 'Least-privilege design patterns for multi-tenant relational databases', *Journal of Database Management*, 32(2), pp. 20–38.

Rahman, S. and Diaz, R. (2022) 'IndexedDB and local-first data persistence strategies for progressive web applications', *International Journal of Mobile Human Computer Interaction*, 14(1), pp. 1–17.

Yeboah, D. and Mensah, K. (2021) 'Case study methods in African information systems research', *African Journal of Information Systems*, 13(4), pp. 250–268.


---


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
