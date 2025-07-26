-- Create storage bucket for card assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('card-assets', 'card-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create policies for card-assets bucket to allow public read access
CREATE POLICY "Anyone can view card assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'card-assets');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own card assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'card-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own card assets
CREATE POLICY "Users can update their own card assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'card-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own card assets
CREATE POLICY "Users can delete their own card assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'card-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);