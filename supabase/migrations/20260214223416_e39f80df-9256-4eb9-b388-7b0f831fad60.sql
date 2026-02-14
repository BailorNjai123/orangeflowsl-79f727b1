
-- Drop existing foreign keys and recreate with ON DELETE CASCADE
ALTER TABLE public.procurement_submissions
  DROP CONSTRAINT IF EXISTS procurement_submissions_site_id_fkey;

ALTER TABLE public.procurement_submissions
  ADD CONSTRAINT procurement_submissions_site_id_fkey
  FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;

ALTER TABLE public.procurement_feedback
  DROP CONSTRAINT IF EXISTS procurement_feedback_site_id_fkey;

ALTER TABLE public.procurement_feedback
  ADD CONSTRAINT procurement_feedback_site_id_fkey
  FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
