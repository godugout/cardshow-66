-- Add CORS policy for card-images bucket to allow browser access
CREATE POLICY IF NOT EXISTS "Allow CORS access to card images"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-images');

-- Update existing policies to be more permissive for public access
DROP POLICY IF EXISTS "Anyone can view card images" ON storage.objects;

CREATE POLICY "Public read access to card images"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-images');

-- Ensure the bucket allows public file access
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'card-images';