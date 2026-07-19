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
