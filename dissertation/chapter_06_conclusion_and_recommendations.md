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
