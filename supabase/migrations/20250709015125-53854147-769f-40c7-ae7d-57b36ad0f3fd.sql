-- Create storage bucket for card assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('card-assets', 'card-assets', true);

-- Create RLS policies for card-assets bucket
CREATE POLICY "Users can upload their own card assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'card-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Card assets are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'card-assets');

CREATE POLICY "Users can update their own card assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'card-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own card assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'card-assets' AND auth.uid()::text = (storage.foldername(name))[1]);