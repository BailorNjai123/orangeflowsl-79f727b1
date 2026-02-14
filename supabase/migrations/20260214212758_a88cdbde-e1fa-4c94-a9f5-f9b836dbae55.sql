
-- Add DELETE policies for storage buckets so files can be replaced/removed
CREATE POLICY "Authenticated users can delete site docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-documents');

CREATE POLICY "Authenticated users can delete procurement docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'procurement-documents');
