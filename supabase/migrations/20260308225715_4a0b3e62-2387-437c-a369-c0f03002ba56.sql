
UPDATE storage.buckets 
SET file_size_limit = 52428800
WHERE id = 'procurement-documents';

UPDATE storage.buckets 
SET file_size_limit = 52428800
WHERE id = 'site-documents';
