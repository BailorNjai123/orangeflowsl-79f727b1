# Appendices

## Appendix A — Database Schema DDL Extract

The following abridged (but faithful) `CREATE TYPE`/`CREATE TABLE` statements represent the core public-schema objects, each protected by Row-Level Security with explicit GRANTs.

```sql
CREATE TYPE public.app_role AS ENUM ('planning_team','procurement_team','power_team','rollout_team','project_team');
CREATE TYPE public.site_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.feedback_status AS ENUM ('pending','accepted','rejected');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, email TEXT, phone TEXT, department TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id_code TEXT NOT NULL, site_name TEXT NOT NULL,
  region TEXT, district TEXT, chiefdom TEXT, town TEXT, address TEXT,
  latitude NUMERIC, longitude NUMERIC, elevation NUMERIC, dimensions TEXT,
  tower_type TEXT, tower_material TEXT, tower_height NUMERIC, foundation_depth NUMERIC,
  terrain_type TEXT, access_road_condition TEXT,
  antenna_type TEXT, number_of_antennas INTEGER, transmission_type TEXT, distance_nearest_bts NUMERIC,
  power_source TEXT, backup_power TEXT, power_backup_type TEXT, battery_bank_type TEXT,
  number_of_battery_banks INTEGER, earthing_resistance NUMERIC,
  grid_transformer_capacity NUMERIC, solar_capacity NUMERIC, generator_capacity NUMERIC,
  power_rfi_status TEXT, power_certificate_url TEXT,
  handover_to_vendor BOOLEAN, soil_test BOOLEAN, site_implementation_design BOOLEAN,
  cast_status BOOLEAN, tower_rig BOOLEAN, civil_rfi BOOLEAN, power_rfi BOOLEAN, on_air BOOLEAN,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  status public.site_status NOT NULL DEFAULT 'pending',
  submitted_by UUID REFERENCES auth.users(id), reviewed_by UUID REFERENCES auth.users(id),
  review_notes JSONB, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sites REPLICA IDENTITY FULL;

CREATE TABLE public.procurement_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  land_identified BOOLEAN, ownership_verified BOOLEAN, land_acquisition_approved BOOLEAN,
  lease_negotiation_completed BOOLEAN, land_lease_signed BOOLEAN, lease_registration_completed BOOLEAN,
  handover_to_vendor BOOLEAN, road_access_available BOOLEAN, vendor_contract_signed BOOLEAN,
  site_handover_to_vendor_completed BOOLEAN,
  land_identified_doc_url TEXT, ownership_verified_doc_url TEXT, land_acquisition_approved_doc_url TEXT,
  lease_negotiation_doc_url TEXT, land_lease_signed_doc_url TEXT, lease_registration_doc_url TEXT,
  handover_to_vendor_doc_url TEXT, road_access_doc_url TEXT, vendor_contract_doc_url TEXT,
  site_handover_completed_doc_url TEXT,
  vendor_name TEXT, supplier_company TEXT, contact_person TEXT, phone_number TEXT, email_address TEXT,
  po_number TEXT, po_date DATE, po_status TEXT, material_delivery_status TEXT,
  expected_delivery_date DATE, actual_delivery_date DATE, invoice_number TEXT, payment_status TEXT,
  procurement_status TEXT,
  purchase_order_doc_url TEXT, delivery_note_doc_url TEXT, grn_doc_url TEXT,
  vendor_delivery_cert_doc_url TEXT, material_handover_form_doc_url TEXT, material_inspection_report_doc_url TEXT,
  status public.site_status NOT NULL DEFAULT 'pending', notes TEXT, review_notes JSONB,
  submitted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.procurement_submissions REPLICA IDENTITY FULL;

CREATE TABLE public.procurement_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status public.feedback_status NOT NULL DEFAULT 'pending',
  feedback_notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id), user_name TEXT,
  action TEXT NOT NULL, description TEXT, entity_type TEXT, entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- append-only: no UPDATE/DELETE policies exist for this table

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL, message TEXT NOT NULL, type TEXT, is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- no DELETE policy exists for this table

CREATE TABLE public.deleted_users_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id UUID, email TEXT, full_name TEXT, department TEXT, phone TEXT,
  role TEXT, was_active BOOLEAN,
  deleted_by UUID, deleted_by_name TEXT, deleted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT
);

CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL, caller_user_id UUID, caller_role TEXT,
  arguments JSONB, error_message TEXT, error_code TEXT, severity TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.sites TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.procurement_submissions TO authenticated;
GRANT SELECT, INSERT ON public.procurement_feedback TO authenticated;
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT ON public.security_audit_log TO authenticated;
GRANT ALL ON public.deleted_users_archive TO service_role;
```

## Appendix B — Row-Level Security Policy Extract

```sql
-- sites: Planning may insert and edit only its own pending records
CREATE POLICY "Planning team can insert sites" ON public.sites
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'planning_team') AND auth.uid() = submitted_by);

CREATE POLICY "Planning team can update own pending sites" ON public.sites
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'planning_team') AND auth.uid() = submitted_by AND status = 'pending');

-- sites: Power and Rollout may update any site that is not rejected
CREATE POLICY "Power team can update sites" ON public.sites
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'power_team') AND status <> 'rejected');

CREATE POLICY "Rollout team can update sites" ON public.sites
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'rollout_team') AND status <> 'rejected');

-- sites: Project/Admin has full control including delete
CREATE POLICY "Admins can update any site" ON public.sites
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'project_team'));

CREATE POLICY "Admins can delete sites" ON public.sites
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'project_team'));

CREATE POLICY "Workflow roles can view sites" ON public.sites
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'planning_team') OR public.has_role(auth.uid(), 'procurement_team')
      OR public.has_role(auth.uid(), 'power_team') OR public.has_role(auth.uid(), 'rollout_team')
      OR public.has_role(auth.uid(), 'project_team'));

-- user_roles: self-view only; only Project/Admin may manage
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'project_team'));

-- notifications: self-insert only, cross-user delivery only via RPC
CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- storage.objects: private buckets, scoped read/write, project_team global
CREATE POLICY "Owners can manage own site documents" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'site-documents' AND (owner = auth.uid() OR public.has_role(auth.uid(), 'project_team')));

CREATE POLICY "Power and Rollout can read scoped site documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'site-documents'
     AND (public.has_role(auth.uid(), 'power_team') OR public.has_role(auth.uid(), 'rollout_team')
          OR public.has_role(auth.uid(), 'project_team') OR owner = auth.uid()));

CREATE POLICY "Owners can manage own procurement documents" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'procurement-documents' AND (owner = auth.uid() OR public.has_role(auth.uid(), 'project_team')));
```

Supporting function definitions:

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() = NEW.user_id AND NOT public.has_role(auth.uid(), 'project_team') THEN
    RAISE EXCEPTION 'Users may not modify their own role assignment';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_workflow_notification(
  _user_ids UUID[], _title TEXT, _message TEXT, _type TEXT, _link TEXT DEFAULT NULL
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _count INTEGER := 0; _safe_message TEXT; _uid UUID;
BEGIN
  IF _link IS NOT NULL AND _link !~ '^/' THEN
    RAISE EXCEPTION 'External links are not permitted in workflow notifications';
  END IF;
  _safe_message := regexp_replace(_message, '<[^>]*>', '', 'g');
  FOREACH _uid IN ARRAY _user_ids LOOP
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (_uid, _title, _safe_message, _type, _link);
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$$;
```

## Appendix C — Edge Function Source Extract

Abridged `manage-users` (Deno Edge Function; service-role key; caller must hold `project_team`):

```ts
serve(async (req) => {
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
  const { data: callerRole } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', caller.id).single();
  if (!callerRole || callerRole.role !== 'project_team') throw new Error('Unauthorized: Admin only');

  const body = await req.json();
  if (body.action === 'create_user') {
    const validated = createUserSchema.parse(body); // Zod: strong-password regex, role enum
    const { data: authData } = await supabaseAdmin.auth.admin.createUser({
      email: validated.email, password: validated.password, email_confirm: true,
      user_metadata: { full_name: validated.full_name },
    });
    await supabaseAdmin.from('profiles').upsert({ user_id: authData.user.id, ...validated }, { onConflict: 'user_id' });
    await supabaseAdmin.from('user_roles').delete().eq('user_id', authData.user.id);
    await supabaseAdmin.from('user_roles').insert({ user_id: authData.user.id, role: validated.role });
    return jsonResponse({ success: true, user_id: authData.user.id });
  }
  if (body.action === 'delete_user') {
    const validated = deleteUserSchema.parse(body);
    if (validated.user_id === caller.id) throw new Error('Cannot delete your own account');
    const [profileRes, roleRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('user_id', validated.user_id).single(),
      supabaseAdmin.from('user_roles').select('role').eq('user_id', validated.user_id).single(),
    ]);
    await supabaseAdmin.from('deleted_users_archive').insert({ original_user_id: validated.user_id,
      email: profileRes.data.email, full_name: profileRes.data.full_name, role: roleRes.data?.role || '',
      was_active: profileRes.data.is_active, deleted_by: caller.id,
      deleted_by_name: validated.deleted_by_name, reason: validated.reason });
    await Promise.all([
      supabaseAdmin.from('profiles').delete().eq('user_id', validated.user_id),
      supabaseAdmin.from('user_roles').delete().eq('user_id', validated.user_id),
    ]);
    await supabaseAdmin.auth.admin.deleteUser(validated.user_id);
    return jsonResponse({ success: true, archived: true });
  }
  // toggle_active and reset_password actions follow the same authorisation and Zod-validation pattern
});
```

Abridged `seed-users` (provisions the initial six role accounts with strong generated passwords, admin-only):

```ts
function generateStrongPassword(): string {
  // 20-byte cryptographically random password drawn from upper/lower/digit/symbol pools,
  // guaranteed to contain at least one character from each pool
}

const userTemplates = [
  { email: 'admin@orangeflow.sl', full_name: 'Admin User', role: 'project_team', department: 'Project Management' },
  { email: 'planning@orangeflow.sl', full_name: 'James Kamara', role: 'planning_team', department: 'Network Planning' },
  { email: 'procurement@orangeflow.sl', full_name: 'Mohamed Bangura', role: 'procurement_team', department: 'Procurement' },
  // ... (six templates in total, two per seeded role: project_team, planning_team, procurement_team)
];

serve(async (req) => {
  // verifies caller holds project_team, as in manage-users
  for (const u of users) {
    const exists = (await supabaseAdmin.auth.admin.listUsers()).data.users.find(eu => eu.email === u.email);
    if (exists) { results.push({ email: u.email, status: 'already_exists' }); continue; }
    const { data: authData } = await supabaseAdmin.auth.admin.createUser({
      email: u.email, password: u.password, email_confirm: true, user_metadata: { full_name: u.full_name } });
    await supabaseAdmin.from('profiles').update({ full_name: u.full_name, department: u.department }).eq('user_id', authData.user.id);
    await supabaseAdmin.from('user_roles').insert({ user_id: authData.user.id, role: u.role });
    results.push({ email: u.email, status: 'created', password: u.password });
  }
  return jsonResponse({ success: true, results });
});
```

## Appendix D — Planning Parameter Dictionary

The sixty-one planning parameters are organised into seven accordion modules within `src/pages/PlanningDashboard.tsx`. Modules 5–7 render conditionally on the technology selected in Module 2.

| Module | Field (Label) | Type | Unit | Required |
|---|---|---|---|---|
| 1. Basic Site & Location | Site ID Code | Text | — | Yes |
| 1 | Site Name | Text | — | Yes |
| 1 | Region | Select | — | Yes |
| 1 | District | Select | — | Yes |
| 1 | Chiefdom | Text | — | No |
| 1 | Town / City / Location | Text | — | Yes |
| 1 | Location Updated | Date | — | No |
| 1 | Latitude | Number | decimal degrees | Yes |
| 1 | Longitude | Number | decimal degrees | Yes |
| 1 | Elevation | Number | m | No |
| 1 | Dimensions | Text | m | No |
| 1 | Distance from Nearest BTS | Number | km | No |
| 2. Governance & Classification | Site Classification | Select | — | No |
| 2 | NAtCa Sites Classification | Select | — | No |
| 2 | Owner / Site Sharing Status | Select | — | No |
| 2 | Site Type | Select | — | No |
| 2 | Technology Classification (2G/3G/4G/5G) | Multi-select | — | No |
| 3. Civil & Infrastructure | Tower Height | Number | m | Yes |
| 3 | Tower Type | Select | — | No |
| 3 | Tower Material | Select | — | No |
| 3 | Foundation Depth | Number | cm | No |
| 3 | Terrain Type | Select | — | No |
| 3 | Access Road Condition | Select | — | No |
| 3 | Equipment Shelter Type | Select | — | No |
| 4. RF Hardware & Physical Antenna | Antenna Type | Text | — | No |
| 4 | Number of Antennas | Number | count | No |
| 4 | RRU Type / Model | Text | — | No |
| 4 | RF Antenna Height | Number | m | No |
| 4 | RF Antenna Azimuth | Number | degrees | No |
| 4 | RF Mechanical Tilt | Number | degrees | No |
| 4 | RF Electrical Tilt | Number | degrees | No |
| 4 | Cluster ID | Text | — | No |
| 4 | High Speed Flag | Select | — | No |
| 5. 2G Radio Network (conditional) | 2G NE Name / BSC Name | Text | — | No |
| 5 | 2G BTS ID | Number | — | No |
| 5 | 2G Cell Name | Text | — | No |
| 5 | 2G Cell ID | Number | — | No |
| 5 | 2G Cell Type | Select | — | No |
| 5 | Frequency Band | Select | — | No |
| 5 | G900 TRX Number | Number | count | No |
| 5 | G1800 TRX Number | Number | count | No |
| 5 | 2G BCCH, NCC, BCC | Text | — | No |
| 5 | HSN_900M, MA_900, MAIO_900M | Text | — | No |
| 5 | HSN_1800M, MA_1800, MAIO_1800M | Text | — | No |
| 5 | BCH, SDCCH, PDTCH Channels | Text | — | No |
| 5 | Transmitter Power (POWT) | Number | dBm | No |
| 5 | 2G Identifiers (MCC, MNC, LAC, RAC, CGI) | Text | — | No |
| 6. 3G Radio Network (conditional) | 3G RNC Name & RNC ID | Text | — | No |
| 6 | 3G NodeB Name & NodeB ID | Text | — | No |
| 6 | 3G Cell Name & Cell ID | Text | — | No |
| 6 | Max Power & Pilot Power | Text | 0.1 dBm | No |
| 6 | Primary Scrambling Code (PSC) | Number | — | No |
| 6 | 3G TxRxMode | Select | — | No |
| 6 | 3G DL Bandwidth & DL EARFCN | Text | — | No |
| 6 | 3G Identifiers (MCC, MNC, LAC, RAC, SAC, CGI) | Text | — | No |
| 7. 4G LTE Radio Network (conditional) | 4G eNodeB Name & eNodeB ID | Text | — | No |
| 7 | 4G Cell Name, Cell ID & Local Cell ID | Text | — | No |
| 7 | RS Power, PA, PB | Text | 0.1 dBm | No |
| 7 | Massive MIMO Cell & 4T6S Flag | Select | — | No |
| 7 | Cell FDD / TDD Indication | Select | — | No |
| 7 | 4G TxRxMode | Select | — | No |
| 7 | 4G Frequency Band | Select | — | No |
| 7 | 4G DL & UL Bandwidth | Select | — | No |
| 7 | 4G DL EARFCN | Number | — | No |
| 7 | TAC, PCI, Root Sequence Index | Text | — | No |
| 7 | Cell Radius | Number | m | No |
| 7 | 4G Identifiers (ECI, ECGI, MCC, MNC) | Text | — | No |

Parameters lacking a native `sites` column are serialised into the `notes` field under the `<<PLANNING_JSON>>…<<END>>` sentinel via `src/lib/planningNotes.ts`, so that downstream viewers display only the human-readable planner remark. An "Additional Notes / Remarks" free-text field is also captured at the foot of the form.

## Appendix E — Test Case Log

Consolidated test log referenced in Chapter Four (representative entries; full log retained in the project test records).

| ID | Category | Description | Expected Result | Outcome |
|---|---|---|---|---|
| F-01 | Functional | Planning: submit new site with all mandatory fields | Site record created with status `pending` | Pass |
| F-02 | Functional | Planning: Excel import, key/value layout | Fields correctly mapped and populated | Pass |
| F-03 | Functional | Planning: Excel import, header/data table layout | Fields correctly mapped and populated | Pass |
| F-04 | Functional | Planning: extended field round-trip via notes sentinel | Planner remark and JSON payload both recovered intact | Pass |
| F-05 | Functional | Procurement: accept Planning handover | `procurement_feedback` row created, status `accepted` | Pass |
| F-06 | Functional | Procurement: complete nine-point checklist with documents | All nine items and documents saved | Pass |
| F-07 | Functional | Procurement: submit triggers dual notification | project_team and rollout_team both notified | Pass |
| F-08 | Functional | Power: earthing resistance 4.2 Ω | Flagged as pass (≤ 5.0 Ω) | Pass |
| F-09 | Functional | Power: earthing resistance 6.8 Ω | Flagged as fail, field highlighted | Pass |
| F-10 | Functional | Power: RFI approval mirrors to rollout milestone | `power_rfi` = true, `progress_percent` recalculated | Pass |
| F-11 | Functional | Rollout: accept Procurement handover | Auto-switch to Rollout Form tab | Pass |
| F-12 | Functional | Rollout: restricted document view | Commercial documents show "Status Only" | Pass |
| F-13 | Functional | Admin: approve/reject with mandatory reason | Rejection blocked without reason text | Pass |
| F-14 | Functional | Admin: Site Monitor renders all fields | No abbreviations, correct colour coding | Pass |
| F-15 | Functional | Admin: user deletion archives record | Row present in `deleted_users_archive`, auth user removed | Pass |
| S-01 | Security | Non-planning role attempts site insert | Rejected by RLS | Pass |
| S-02 | Security | Planning attempts to delete own site | Rejected by RLS and UI | Pass |
| S-03 | Security | User attempts self-role escalation | Rejected by `prevent_role_self_escalation` trigger | Pass |
| S-04 | Security | User attempts to insert notification for another user | Rejected by RLS; only `send_workflow_notification` succeeds | Pass |
| S-05 | Security | `send_workflow_notification` called with external link | Rejected with exception | Pass |
| S-06 | Security | Non-admin bearer token calls `manage-users` | HTTP 403 Unauthorized | Pass |
| S-07 | Security | Malformed payload sent to `manage-users` | HTTP 422 with Zod validation message | Pass |
| S-08 | Security | Direct unauthenticated storage object request | Denied; only signed URLs succeed | Pass |
| S-09 | Security | Power/Rollout attempt to update rejected site | Rejected by RLS | Pass |
| O-01 | Offline | Submit Rollout form while offline | Record written to IndexedDB outbox with status `pending` | Pass |
| O-02 | Offline | Reconnect after offline submission | Record replayed automatically, matched by Site ID, no duplication | Pass |
| O-03 | Offline | View previously loaded dashboard offline | Cached shell and data displayed | Pass |
| O-06 | Offline | Upload Planning Excel workbook offline, then reconnect | Workbook stored as a Blob and later uploaded byte-identical | Pass |
| O-07 | Offline | Submit Rollout Extra Work with photographs offline | Data and images synchronise into Project/Admin → Rollout Review | Pass |
| O-08 | Offline | Close and reopen the browser with records queued | Outbox and attached files survive restart and synchronise | Pass |
| O-09 | Offline | Central edit of a site while an offline edit is queued | Record flagged `conflict`; central data not overwritten | Pass |
| O-10 | Offline | Synchronisation indicator through an offline-online cycle | Offline, Pending, Syncing and Synced states shown correctly | Pass |
| O-04 | Synchronisation | Power RFI update observed on Rollout dashboard | Realtime update within seconds | Pass |
| O-05 | Synchronisation | Realtime event missed (simulated drop) | TanStack Query 30 s poll recovers state | Pass |
| C-01 | Cross-Browser | Site Monitor table on mobile viewport | No horizontal scroll, stacked cards | Pass (after remediation) |
| C-02 | Cross-Browser | Signed URL document open in Edge | Blob/Object URL fallback used, document opens | Pass (after remediation) |
| C-03 | Cross-Browser | Install prompt on iOS Safari | Fallback instructions displayed | Pass |
| U-01 | Usability | Planning user completes site submission unaided | Task completed within acceptable time, no critical errors | Pass |
| U-02 | Usability | Admin user locates a specific site via Site Monitor | Task completed without external guidance | Pass |

## Appendix F — Sample Excel Import Template and Figure Index

### F.1 Planning Excel Import Template

The Planning Excel import routine (`src/pages/PlanningDashboard.tsx`) recognises column or row headers matching the full field label, the label with units removed, the label before a slash or ampersand, or a defined set of header aliases (for example, `Site ID`, `Lat`, `Long`, `Elevation (m)`). Recommended template column headers, grouped by module, are:

`Site ID Code`, `Site Name`, `Region`, `District`, `Chiefdom`, `Town / City / Location`, `Latitude`, `Longitude`, `Elevation (m)`, `Dimensions (m)`, `Distance from Nearest BTS (km)`, `Site Classification`, `NAtCa Sites Classification`, `Owner / Site Sharing Status`, `Site Type`, `Tower Height (m)`, `Tower Type`, `Tower Material`, `Foundation Depth (cm)`, `Terrain Type`, `Access Road Condition`, `Equipment Shelter Type`, `Antenna Type`, `Number of Antennas`, `RRU Type / Model`, followed by the relevant 2G, 3G and/or 4G radio-network columns as required.

Two layouts are accepted:

1. **Key/value layout** — any worksheet in which a recognisable field name appears in one cell and its value appears in a subsequent cell of the same row (order and position elsewhere on the sheet are immaterial).
2. **Header-row/data-row table layout** — a conventional header row (at least two recognised headers) immediately followed by one data row per site.

Technology-specific worksheets are auto-detected by sheet name (containing "2G"/"GSM", "3G"/"UMTS"/"WCDMA", or "4G"/"LTE") or by the presence of populated technology-specific fields, and populate the `technology_classification` selection accordingly. Values are type-coerced for numbers, dates and constrained select options; unrecognised select values are discarded rather than silently guessed.

### F.2 Figure Index

| Figure | Source File (`public/dissertation/`) |
|---|---|
| System Architecture Diagram | `system_architecture.svg` |
| Database Schema Diagram | `database_schema.svg` |
| Entity–Relationship Diagram | `entity_relationship_diagram.svg` |
| Use Case Diagram | `use_case_diagram.svg` |
| Activity Diagram | `activity_diagram.svg` |
| System Flowchart | `system_flowchart.svg` |
| Existing (Prior) Manual Workflow Diagram | `existing_workflow.svg` |
| Dashboard Summary Table Mockup | `dashboard_table_mockup.svg` |
| Planning Workspace UI | `ui_planning_workspace.svg` |
| Procurement Checklist UI | `ui_procurement_checklist.svg` |
| Power Dashboard UI | `ui_power_dashboard.svg` |
| Rollout Dashboard UI | `ui_rollout_dashboard.svg` |
| Admin Pipeline UI | `ui_admin_pipeline.svg` |
| Sequence Diagram (Cross-Module Synchronisation) | `sequence_diagram.svg` |
| Data Flow Diagram | `data_flow_diagram.svg` |

