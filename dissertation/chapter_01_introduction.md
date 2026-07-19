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
