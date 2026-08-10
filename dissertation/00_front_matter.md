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

The application is delivered as an installable, offline-first Progressive Web Application. Every data-mutating action in all four operational domains is routed through a durable store-and-forward outbox held in IndexedDB, which persists both the submission payload and its binary attachments — original Excel workbooks, certificates, supporting documents and site photographs — so that field staff in areas without coverage may complete forms, upload files and record unexpected site conditions without loss of work when the browser is closed. On reconnection the outbox is flushed automatically: attachments are uploaded first and marked individually so partially completed records resume, database writes are matched to the central row by the business Site ID so that no duplicate records are created, and a last-modified snapshot captured at the start of editing is compared against the central value so that a concurrent modification is flagged as a conflict for review rather than silently overwritten. Queued mutations are replayed through the ordinary authenticated client and remain subject to the same row-level security policies as online writes, so offline capability extends availability without widening privilege, and a synchronisation indicator reports the offline, pending, synchronising, synchronised, failed and conflict states to the user throughout.

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
3.18a Offline-First Synchronisation Design
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
4.16 Progressive Web Application and Offline-First Capability
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
