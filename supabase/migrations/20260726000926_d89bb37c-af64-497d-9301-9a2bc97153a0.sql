ALTER TABLE public.sites REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sites;