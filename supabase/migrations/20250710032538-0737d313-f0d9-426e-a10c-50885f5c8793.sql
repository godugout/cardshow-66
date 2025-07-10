-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view card images" ON storage.objects;
DROP POLICY IF EXISTS "Allow CORS access to card images" ON storage.objects;

-- Create new public read access policy for card images
CREATE POLICY "Public read access to card images"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-images');

-- Ensure the bucket allows public file access
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'card-images';