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
