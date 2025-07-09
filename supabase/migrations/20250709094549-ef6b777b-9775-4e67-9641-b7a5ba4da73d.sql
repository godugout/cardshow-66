-- Create card-images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view card images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own card images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own card images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own card images" ON storage.objects;

-- Create storage policies for card images
CREATE POLICY "Anyone can view card images"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-images');

CREATE POLICY "Users can upload their own card images"
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