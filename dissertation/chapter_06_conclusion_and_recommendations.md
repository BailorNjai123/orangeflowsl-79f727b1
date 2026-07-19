# Chapter Six — Conclusion and Recommendations

## 6.1 Summary of the Study

This dissertation set out to design, implement and evaluate a role‑based, offline‑capable Progressive Web Application that consolidates the Base Transceiver Station (BTS) site rollout workflow into a single auditable digital pipeline. Chapter One framed the problem, articulated the aim and objectives and stated the research questions. Chapter Two reviewed the relevant literature on telecommunications site rollout, Progressive Web Applications, offline‑first design, Row‑Level Security and secure document delivery, and identified the research gap at their intersection. Chapter Three set out the applied, design‑science methodology, the functional and non‑functional requirements, the three‑tier architecture and the accompanying data, use‑case, activity and flow diagrams. Chapter Four documented the concrete implementation module by module. Chapter Five reported the results of functional, security, offline and responsive verification, and compared the delivered system against the prior manual workflow.

## 6.2 Conclusion

OrangeFlow SL demonstrates that a small, well‑scoped engineering effort — an installable Progressive Web Application on top of a managed PostgreSQL backend — can replace a fragmented, paper‑driven telecommunications rollout workflow with a single auditable digital pipeline that enforces least‑privilege access at the database layer, preserves data integrity under intermittent connectivity, and provides supervisory visibility that the incumbent workflow could not. Each research question posed in Chapter One is answered by the delivered artefact:

- The structural and operational deficiencies of the manual workflow (**RQ1**) were identified and each is addressed by a specific feature of the system.
- The three‑tier architecture, normalised schema, RLS policies and signed‑URL storage together constitute the design that best supports the identified workflow (**RQ2**).
- Least‑privilege access is enforced at the database layer, not merely in the client, through RLS policies scoped to role and ownership, a `SECURITY DEFINER` helper and a role‑escalation trigger (**RQ3**).
- Actions initiated while offline are captured to an IndexedDB queue and replayed idempotently on reconnection, without loss, duplication or corruption (**RQ4**).
- Functional, security, offline and responsive verification (**RQ5**) each confirmed that the implemented system satisfies its requirements.

The dissertation therefore closes the research gap identified in Chapter Two by providing a documented, evaluated implementation that addresses all four concerns — BTS rollout coordination, offline‑first delivery, database‑layer least privilege and private‑bucket document delivery — as a single coherent case.

## 6.3 Contribution to Knowledge

The specific contributions of this study are:

1. A documented case study, situated in the Sierra Leonean operating environment, of applying design‑science principles to the digitisation of a telecommunications rollout workflow.
2. A concrete demonstration that Row‑Level Security, `SECURITY DEFINER` helpers and role‑escalation triggers, in combination, are sufficient to enforce least‑privilege access without bespoke server code.
3. An implementation pattern for offline‑first PWA behaviour in which queued actions are treated as first‑class data with their own lifecycle, enabling idempotent replay through the same code path as online operations.
4. A verification protocol combining role‑based end‑to‑end scenarios, migration‑level negative testing and multi‑viewport responsive checks that other student engineering projects may reuse.

## 6.4 Recommendations for Future Work

Building on the delivered artefact, the following extensions are recommended:

1. **Integration with external systems.** Integrating with the operator's Network Operations Centre, Geographic Information System and Enterprise Resource Planning platform would eliminate the remaining manual handovers at the perimeter of the workflow.
2. **Native mobile shell.** While the installed PWA satisfies present needs, packaging the same codebase as a native iOS and Android application would enable deeper device integration, including background synchronisation and richer offline capabilities.
3. **Advanced analytics.** The activity log already captures the raw material for descriptive and predictive analytics on rollout throughput, bottlenecks and rejection rates; a dedicated analytics module would surface these insights to management.
4. **Multi‑tenant expansion.** The role and schema model generalises straightforwardly to other operators and to adjacent utilities workflows. A tenant‑scoped extension would enable the same system to serve multiple organisations from a single deployment.
5. **Field measurement integration.** Ingesting RF drive‑test data, IoT sensor telemetry and photographic evidence directly from field instruments would further reduce the manual burden on planning and procurement staff.
6. **Automated financial reconciliation.** Coupling the procurement checklist to the operator's finance ledger would close the loop between operational sign‑off and financial commitment.

These extensions, taken together, would evolve OrangeFlow SL from a rollout coordination tool into a full lifecycle management platform for BTS infrastructure in Sierra Leone and comparable markets.
