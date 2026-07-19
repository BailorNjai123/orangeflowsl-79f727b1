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
