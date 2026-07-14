import PaperSheet from './PaperSheet';

export default function ChapterThree() {
  return (
    <PaperSheet>
      <header className="mb-10 text-center border-b-2 border-slate-800 pb-6">
        <p className="uppercase tracking-[0.35em] text-xs text-slate-500 mb-2">Chapter Three</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>
          Research Methodology
        </h1>
        <p className="mt-3 italic text-slate-600 text-sm">
          The OrangeFlow Platform — A Progressive Web Application for BTS Site Workflow Orchestration
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.1 Introduction</h2>
        <p className="text-justify indent-8">
          This chapter presents the systematic methodology adopted for the design, engineering and evaluation of
          <em> OrangeFlow</em>, a role-based, mobile-first Progressive Web Application (PWA) developed to centralise the
          Base Transceiver Station (BTS) site rollout workflow. The chapter articulates the research paradigm, data
          collection strategy, requirements analysis, architectural blueprint, and validation protocol used to
          transform an unstructured, paper-driven telecom rollout process into an auditable, offline-capable digital
          pipeline.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.2 Research Design</h2>
        <p className="text-justify indent-8">
          The study adopts an <strong>applied, design-science research</strong> approach fusing descriptive,
          constructive and evaluative components. Descriptive analysis was used to model the incumbent manual workflow;
          constructive research produced the OrangeFlow artefact itself; and evaluative research validated the artefact
          against the elicited functional and non-functional requirements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.3 Data Collection Methods</h2>
        <p className="text-justify indent-8">
          Data was gathered via process observation of the current BTS rollout lifecycle, review of internal handover
          documents, structured requirements elicitation with prospective Planning, Procurement and Project
          Administration users, and iterative feedback loops taken directly from the running Lovable Cloud
          implementation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.4 Analysis of the Existing System</h2>
        <p className="text-justify indent-8">
          The existing workflow relied on printed forms, disparate spreadsheets and informal messaging channels.
          Consequences included fragmented handover, silent data loss and duplication, absence of an audit trail,
          insecure document handling, no role-based access control, poor field usability, and no real-time status
          visibility for supervisors.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.5 Proposed System (OrangeFlow)</h2>
        <p className="text-justify indent-8">
          OrangeFlow is proposed as a mobile-first, role-scoped PWA that consolidates site submission, procurement
          feedback, and approval into one auditable pipeline shared by three roles: <em>Planning Team</em>,
          <em> Procurement Team</em>, and <em>Project Administrator</em>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.6 Functional Requirements</h2>
        <ol className="list-decimal ml-8 space-y-1">
          <li>Authenticated login for all users.</li>
          <li>Deterministic role assignment (Planning, Procurement, Project Admin).</li>
          <li>Site proposal submission with structured technical, geographic and power data.</li>
          <li>Nine-point procurement compliance checklist with document upload.</li>
          <li>Final approval / rejection stage with reason capture.</li>
          <li>Offline capture with queued replay on reconnection.</li>
          <li>Real-time in-app notifications on state transitions.</li>
          <li>Immutable, chronological activity log.</li>
          <li>Administrator user management via secure Edge Function.</li>
          <li>Signed, time-limited URLs for private document retrieval.</li>
          <li>Auto-refreshing dashboards for supervisory visibility.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.7 Non-Functional Requirements</h2>
        <p className="text-justify indent-8">
          Security is enforced through Row-Level Security (RLS), private storage buckets and privileged Edge Functions.
          Usability is guaranteed by a mobile-first layout with no horizontal scrolling. Availability is provided by a
          service-worker enabled PWA with offline capture. Performance is preserved by a 30-second background refresh.
          Maintainability is achieved through TypeScript, modular components and a normalised schema. Auditability and
          data integrity are enforced via activity logs and referential constraints.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.8 System Architecture</h2>
        <figure className="my-6">
          <img src="/dissertation/system_architecture.svg" alt="System Architecture" className="w-full border border-slate-200 rounded-md bg-white" />
          <figcaption className="text-center text-xs italic text-slate-500 mt-2">Figure 3.1 — Three-tier system architecture of OrangeFlow.</figcaption>
        </figure>
        <p className="text-justify indent-8">
          OrangeFlow uses a three-tier architecture: a React 18 + Vite PWA presentation tier; a backend-as-a-service
          middleware tier composed of PostgREST, JWT authentication, Deno Edge Functions and an IndexedDB offline
          queue; and a data tier consisting of PostgreSQL secured by RLS with two private storage buckets,
          <code>site-documents</code> and <code>procurement-documents</code>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.9 Database Design</h2>
        <figure className="my-6">
          <img src="/dissertation/database_schema.svg" alt="Database Schema" className="w-full border border-slate-200 rounded-md bg-white" />
          <figcaption className="text-center text-xs italic text-slate-500 mt-2">Figure 3.2 — Normalised relational schema.</figcaption>
        </figure>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.10 Use Case Diagram</h2>
        <figure className="my-6">
          <img src="/dissertation/use_case_diagram.svg" alt="Use Case Diagram" className="w-full border border-slate-200 rounded-md bg-white" />
          <figcaption className="text-center text-xs italic text-slate-500 mt-2">Figure 3.3 — Actor–use case model.</figcaption>
        </figure>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.11 Activity Diagram</h2>
        <figure className="my-6">
          <img src="/dissertation/activity_diagram.svg" alt="Activity Diagram" className="w-full border border-slate-200 rounded-md bg-white" />
          <figcaption className="text-center text-xs italic text-slate-500 mt-2">Figure 3.4 — Swimlane activity flow.</figcaption>
        </figure>
        <figure className="my-6">
          <img src="/dissertation/dashboard_table_mockup.svg" alt="Empirical Data Grid Mockup" className="w-full border border-slate-200 rounded-md bg-white" />
          <figcaption className="text-center text-xs italic text-slate-500 mt-2">Figure 3.5 — Empirical data grid mockup of the site monitor.</figcaption>
        </figure>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.12 System Flowchart</h2>
        <figure className="my-6">
          <img src="/dissertation/system_flowchart.svg" alt="System Flowchart" className="w-full border border-slate-200 rounded-md bg-white" />
          <figcaption className="text-center text-xs italic text-slate-500 mt-2">Figure 3.6 — Runtime online/offline flow.</figcaption>
        </figure>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.13 Entity Relationship Diagram</h2>
        <figure className="my-6">
          <img src="/dissertation/entity_relationship_diagram.svg" alt="ER Diagram" className="w-full border border-slate-200 rounded-md bg-white" />
          <figcaption className="text-center text-xs italic text-slate-500 mt-2">Figure 3.7 — Crow's-foot ERD.</figcaption>
        </figure>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.14 Software Development Methodology</h2>
        <p className="text-justify indent-8">
          An iterative, agile-inspired workflow was employed. Each increment was integrated continuously into the
          Lovable Cloud backend, permitting fast validation of migrations, RLS policies and UI changes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.15 Technologies Used</h2>
        <p className="text-justify indent-8">
          React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, a PWA service worker,
          <code> idb-keyval</code>, and the Lovable Cloud backend built on PostgreSQL, Auth, Storage and Deno Edge Functions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.16 Testing Strategy</h2>
        <p className="text-justify indent-8">
          Static analysis (TypeScript, ESLint), Vitest unit tests, manual role-based end-to-end testing, security
          verification via migrations and policy enforcement, offline/PWA testing, and responsive testing on multiple
          viewport sizes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>3.17 Chapter Summary</h2>
        <p className="text-justify indent-8">
          The chapter documented the methodology, requirements and design that underpin OrangeFlow. The next chapter
          transitions from design to concrete implementation and empirical verification.
        </p>
      </section>
    </PaperSheet>
  );
}
