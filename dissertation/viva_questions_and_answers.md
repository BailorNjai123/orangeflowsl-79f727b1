# Viva Voce — Anticipated Questions and Model Answers

The following bank of forty questions covers the categories most commonly examined in a Bachelor of Engineering viva on an applied software‑engineering project: motivation and scope; requirements and methodology; architecture; database and security; offline behaviour; testing and evaluation; limitations; ethics; and personal contribution. Model answers are provided in a form suitable to be spoken aloud in three to six sentences.

---

### A. Motivation, Scope and Contribution

**Q1. In one paragraph, what problem does OrangeFlow SL solve, and for whom?**
OrangeFlow SL solves the coordination problem of Base Transceiver Station rollout at Orange Sierra Leone. Under the incumbent workflow, planning, procurement and project administration are coordinated through printed forms, scattered spreadsheet copies and instant‑messaging threads, producing version divergence, weak audit trails, absent role separation, poor field usability and no supervisory visibility. OrangeFlow SL replaces that with a single role‑based, mobile‑first Progressive Web Application backed by a database in which every user‑facing table is protected by Row‑Level Security.

**Q2. Why is this an engineering problem rather than a purely managerial one?**
Because the failure modes — version divergence, audit opacity, absent role separation, absent offline usability, absent real‑time visibility — are structural properties of the tool set in use, not of the people using it. Substituting management pressure for a coherent tool cannot close a version‑divergence gap; substituting a schema, RLS policies, an audit table and an offline queue can.

**Q3. What is your specific contribution?**
Three contributions: a working, evaluated reference implementation that jointly addresses BTS rollout, offline‑first delivery, database‑layer least privilege and signed‑URL document delivery; a concrete demonstration that RLS with a security‑definer role oracle is a sufficient RBAC enforcement point; and a documented end‑to‑end application of software‑engineering, database and security principles to a real operational problem.

**Q4. What is explicitly out of scope?**
Integration with the operator's finance, billing or network‑operations systems; native mobile applications distributed through public stores; automated field surveying; the radio‑network planning calculations themselves; and formal certification against national or international information‑security standards.

### B. Requirements and Methodology

**Q5. How did you elicit requirements?**
Through three methods: structured observation of the incumbent workflow, review of the printed forms and spreadsheet workbooks currently in use, and informal semi‑structured interviews with prospective users of each of the three intended roles. The interviews informed usability requirements; the observation and document review informed the schema and the state model.

**Q6. Why design‑science research?**
Because the deliverable of the study is an artefact — a working system — and design‑science is the paradigm whose evaluative canon addresses artefacts on their own terms. A purely descriptive paradigm would not have been able to accommodate the constructive activity at the centre of the study.

**Q7. Why iterative‑incremental development rather than waterfall?**
Because integration risk — particularly between RLS policies and the query patterns of the frontend — is exposed only at the boundary between tiers, and iterative delivery of vertically integrated slices exposes that risk early rather than at a big‑bang integration event.

**Q8. How did you decide when a requirement had been satisfied?**
Each functional requirement is paired with a role‑based end‑to‑end scenario against a live backend, and each non‑functional requirement with a specific measurement — negative testing for security, IndexedDB inspection for offline, viewport measurement for responsiveness. A requirement is satisfied when its scenario succeeds and its measurement holds.

### C. Architecture

**Q9. Why a three‑tier architecture?**
Because the three concerns — presentation, authenticated business logic and authoritative storage — are cleanly separable and are best expressed in different runtimes: a browser for presentation, an ephemeral serverless runtime for privileged logic and a durable database for storage. Coupling them would sacrifice both testability and security.

**Q10. Why a PWA rather than a native mobile app?**
Because the user population is small, internal and centrally controlled; because the application is form‑oriented and network‑bound rather than dependent on native device capabilities; because PWA delivery avoids two independent build pipelines and app‑store review latency; and because PWAs meet the installability and offline requirements that motivate a native app in the first place.

**Q11. Why the specific frontend stack — React 18, Vite, TypeScript, Tailwind, shadcn/ui, TanStack Query?**
React 18 for its concurrent rendering and mature ecosystem; Vite for near‑instant developer feedback; TypeScript for compile‑time verification of the interfaces between components and the backend types; Tailwind and shadcn/ui for a consistent, accessible component vocabulary; TanStack Query for cache management and periodic background refetch, which supplies the thirty‑second dashboard cadence without bespoke code.

**Q12. Why PostgreSQL specifically?**
Because Row‑Level Security is a first‑class database feature in PostgreSQL and is the mechanism through which the study's least‑privilege claim is discharged. A datastore without RLS would push access enforcement into application code, which is precisely the failure mode this study argues against.

### D. Database and Security

**Q13. Why hold roles in a separate `user_roles` table rather than as a column on `profiles`?**
Because role assignment is more security‑critical than profile editing, and separating the concerns permits distinct, tighter RLS policies to apply to `user_roles`. It also naturally accommodates multi‑role users if that becomes a requirement.

**Q14. What is a security‑definer function and why do you use one?**
A `SECURITY DEFINER` function executes under the authority of the function's owner rather than of the caller, and can therefore read tables the caller could not otherwise reach. `has_role` uses this to look up `user_roles` from inside RLS policies without triggering recursive policy evaluation on `user_roles` itself.

**Q15. How do you prevent privilege escalation via `user_roles`?**
Two layers. First, the insert, update and delete policies on `user_roles` admit only administrators. Second, defensively, a `BEFORE INSERT OR UPDATE` trigger `prevent_role_self_escalation` refuses any operation issued by a non‑administrator, so a future policy regression cannot silently open the escalation surface.

**Q16. Why do you `SET search_path = public` on your definer functions?**
To defeat a class of attack in which an attacker temporarily prepends a schema of their own to the session `search_path`, so that an unqualified reference inside the definer function resolves to attacker‑controlled objects. Pinning `search_path` inside the function makes the resolution deterministic.

**Q17. Why signed URLs rather than a proxied download endpoint?**
Signed URLs let the browser fetch the object directly from the storage service, so download bandwidth does not traverse the application server; access checks are concentrated at the moment of URL issuance, where the caller's identity and role are already known; and if a URL fragment leaks it expires within minutes.

**Q18. What is the concrete threat that route guards do *not* address?**
Route guards address usability: they prevent users from seeing screens they cannot use. They do not address security, because a determined caller can invoke the backend directly, bypassing the frontend entirely. Security is enforced at the database layer, where the caller cannot bypass it.

**Q19. Walk me through what happens when a Planning user tries to delete a site.**
The frontend does not surface a delete button on the Planning dashboard. If the user nevertheless issues a `DELETE` directly against PostgREST, the request reaches the database with the user's JWT. The RLS `DELETE` policy on `sites` requires `has_role(auth.uid(), 'project_team')`, which returns false. The database refuses the operation; the row remains; no data is lost.

**Q20. How do you handle passwords?**
Passwords are managed by the auth service, not by the application code. Leaked‑password protection is enabled, so passwords appearing in known breach corpora are refused at registration. The seed function generates strong random passwords rather than embedding them in source.

### E. Offline and Synchronisation

**Q21. What exactly happens when a user submits a site while offline?**
The submission is written to a durable outbox in IndexedDB — the data payload in one object store and any attached files as Blobs in another — carrying the Site ID, the role, a timestamp, a snapshot of the record's last-modified value and a synchronisation status. A floating indicator shows the record as pending. When the browser next reports `online`, the synchronisation hook flushes the outbox in insertion order: files are uploaded first and marked individually, the database mutation is then matched to the central row by Site ID, and the record is deleted from the outbox only after the write commits.

**Q22. What if two mutations depend on each other — a site create followed by a note on that site?**
Insertion order is preserved, so the site is created before the note is issued. If the create fails, the dependent mutation is not applied and remains on the queue for retry once the underlying cause is resolved.

**Q23. What if synchronisation is interrupted midway?**
Successfully applied records have already been deleted from the outbox; unapplied records remain in insertion order, and within a partially completed record each uploaded file is individually marked so the upload resumes rather than restarting. On next connectivity the flush resumes where it stopped. No record is silently discarded and no record is applied twice.

**Q23a. How do you prevent one device silently overwriting another's work?**
Each queued edit stores the target row's last-modified timestamp as it stood when editing began. At replay time that snapshot is compared with the value now held centrally; if they differ, the write is withheld and the record is marked as a conflict for explicit review rather than being applied. Duplicate creation is prevented separately: replay matches on the Site ID, so a queued insert for a site that meanwhile exists centrally is converted into an update.

**Q24. Could the client be tricked into submitting a mutation as another user via the offline queue?**
No. The queue holds payloads only; authentication is carried at replay time by the current session's JWT. A mutation captured under user A's session but replayed under user B's session will be evaluated against user B's role and will be refused by RLS if it does not qualify.

### F. Testing and Evaluation

**Q25. How did you verify security?**
Two ways. Migration‑level audit — inspection of the SQL policies themselves so that compliance is attached to the schema rather than to any particular version of the client code. And negative testing — for each protected table, an authenticated user in an unauthorised role attempted each of the four write operations, all of which were refused.

**Q26. Why is migration‑level audit important?**
Because policy compliance attached to the schema survives independently of the client. Any future regression in the frontend cannot silently expand the authority of any role, because the database will refuse the excess. This is a genuine multiplier on ongoing safety.

**Q27. What is negative testing?**
Testing that a system correctly refuses an operation it should not permit. In this study, an authenticated user in an unauthorised role was made to attempt every write against every protected table; each attempt was expected — and observed — to be refused.

**Q28. What did you measure for responsiveness?**
Three viewport widths — 390, 820 and 1440 CSS pixels — were rendered, and each was inspected for horizontal overflow, clipping and legibility of controls. The absence of horizontal overflow at every width is the operational criterion.

**Q29. How would you scale the evaluation to production traffic?**
By instrumenting representative endpoints for latency and error rate, by running a scripted load generator at the target concurrency, and by comparing measured latency against a service‑level objective agreed with the operator. This is signposted in Chapter Six as recommended further work.

### G. Limitations, Ethics and Reflection

**Q30. What are the principal limitations of the study?**
The evaluation was conducted against a live backend with authored scenarios rather than against a historical corpus of production records; load testing at operator‑scale concurrency was not performed; behaviour on legacy browsers below the modern evergreen baseline is not characterised; integration with the operator's downstream systems is out of scope; and formal external certification of the security posture was not undertaken.

**Q31. What are the ethical considerations?**
User data captured by the system is confined to what is operationally necessary; access is enforced at the database layer; documents are delivered exclusively through short‑lived signed URLs. Interviews used to inform usability requirements were conducted informally and no personally identifying information from them is reproduced in the dissertation.

**Q32. What would you do differently if you started over?**
I would introduce a small end‑to‑end test harness earlier in the schedule, so that RLS regressions could be caught by continuous integration rather than by manual verification. I would also decompose the largest React components into smaller units at first authoring rather than after the fact.

**Q33. What was the hardest technical decision?**
The choice to enforce access at the database layer rather than in a bespoke application server. It required investing in RLS discipline early, but paid off in the migration‑level audit strand of the security verification and in the confinement of the service role to a single Edge Function trusted‑code path.

### H. Domain and Broader Implications

**Q34. Why is this particularly relevant to Sierra Leone?**
Because BTS rollout is a live engineering activity across the country, because field connectivity cannot be assumed at candidate sites, and because the operator's audit posture and rollout throughput materially affect the pace of network expansion. The specific structural shape of the workflow — hand‑over between distinct roles, evidentiary upload, field capture under intermittent connectivity — is present in comparable coordination workflows in electricity, water and public works.

**Q35. Could this system be adopted by another operator or another sector?**
Yes, with modification. The three domain roles and the nine‑point checklist are specific to the studied workflow, but the architectural spine — PWA plus IndexedDB queue plus PostgreSQL with RLS plus signed‑URL storage — generalises to any small‑to‑medium coordination workflow of comparable structural shape.

**Q36. What is the single most defensible technical claim in the dissertation?**
That least‑privilege access is enforced at the database layer through RLS bound to a dedicated role table, and that this enforcement is verified at the migration level so that its compliance persists independently of any particular version of the client code.

### I. Personal Contribution

**Q37. What role did tooling play in the outcome, and what is the substance of your own contribution?**
Tooling accelerates typing but not thinking. The substance of the contribution — the choice of a three‑tier architecture with database‑layer access control, the design of the role oracle and self‑escalation trigger, the design of the offline queue, the elicitation of the requirements and the design of the four‑axis verification strategy — is the researcher's own, and would be equally substantive in any tool environment.

**Q38. Which parts of the codebase did you author personally?**
The full schema and all RLS policies, the security‑definer functions and the anti‑self‑escalation trigger, the offline queue and synchronisation hook, the auth context and route guard, the dashboard pages and the shared presentation components. The generated backend client module and the third‑party UI primitives are, of course, not authored by the researcher.

**Q39. If a supervisor asked you to defend one line of code, which would it be?**
The `SET search_path = public` clause on the `has_role` and `get_user_role` definer functions. It is small, easy to overlook, and its absence would open the functions to a schema‑poisoning attack. Its presence closes that class of attack deterministically.

**Q40. In one sentence, why does this dissertation matter?**
It demonstrates that a disciplined, small engineering effort — applied to a well‑characterised operational problem with correct choice of architectural primitives — can produce a system that substantively supersedes the manual workflow it replaces along every operational dimension examined.
