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
