-- Check and fix storage policies for card-images bucket
-- First ensure the bucket exists and is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'card-images';

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read access to card images" ON storage.objects;
DROP POLICY IF EXISTS "Allow CORS access to card images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view card images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own card images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own card images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own card images" ON storage.objects;

-- Create comprehensive policies for card-images bucket
CREATE POLICY "Public read access to card images"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-images');

CREATE POLICY "Users can upload card images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'card-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own card images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'card-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own card images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'card-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);