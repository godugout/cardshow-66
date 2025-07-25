-- Check if storage policies exist and create them for card-assets bucket
-- Users should be able to upload to their own folder in card-assets

-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload to their own folder in card-assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'card-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view files in card-assets (public bucket)
CREATE POLICY "Anyone can view card-assets files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'card-assets');

-- Allow users to update their own files
CREATE POLICY "Users can update their own files in card-assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'card-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files in card-assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'card-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);