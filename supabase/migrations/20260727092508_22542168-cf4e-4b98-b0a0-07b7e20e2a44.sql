ALTER TABLE public.procurement_submissions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.procurement_submissions;