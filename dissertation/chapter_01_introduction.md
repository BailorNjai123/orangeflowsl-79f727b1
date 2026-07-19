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
