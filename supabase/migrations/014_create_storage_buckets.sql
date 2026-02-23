-- Create storage buckets for file uploads

-- Progress Photos Bucket (10 MB limit per file)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('progress-photos', 'progress-photos', true, 10485760)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 10485760;

-- Documents Bucket (50 MB limit per file)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', true, 52428800)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 52428800;

-- Set up RLS policies for progress-photos bucket
CREATE POLICY "Allow authenticated users to upload progress photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'progress-photos' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow authenticated users to view progress photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'progress-photos');

CREATE POLICY "Allow authenticated users to delete their progress photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'progress-photos' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Set up RLS policies for documents bucket
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow authenticated users to view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to delete their documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);
