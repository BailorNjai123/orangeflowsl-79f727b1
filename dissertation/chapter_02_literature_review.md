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
