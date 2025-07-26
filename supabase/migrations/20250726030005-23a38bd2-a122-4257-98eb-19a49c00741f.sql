-- First check the current bucket configuration
SELECT * FROM storage.buckets WHERE id = 'card-assets';

-- Ensure the bucket is public and has correct settings
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 52428800, -- 50MB limit
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'card-assets';

-- Delete any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view card assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own card assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own card assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own card assets" ON storage.objects;

-- Create new comprehensive storage policies
CREATE POLICY "Public read access for card assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'card-assets');

CREATE POLICY "Authenticated users can upload to card assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'card-assets' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own card assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'card-assets' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own card assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'card-assets' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);