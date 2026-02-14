
-- Create storage buckets for site documents and procurement documents
INSERT INTO storage.buckets (id, name, public) VALUES ('site-documents', 'site-documents', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('procurement-documents', 'procurement-documents', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for site-documents
CREATE POLICY "Authenticated users can upload site docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-documents');
CREATE POLICY "Anyone can view site docs" ON storage.objects FOR SELECT USING (bucket_id = 'site-documents');
CREATE POLICY "Users can update own site docs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-documents');

-- Storage policies for procurement-documents
CREATE POLICY "Authenticated users can upload procurement docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'procurement-documents');
CREATE POLICY "Anyone can view procurement docs" ON storage.objects FOR SELECT USING (bucket_id = 'procurement-documents');
CREATE POLICY "Users can update own procurement docs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'procurement-documents');
