-- Add missing fields to profiles table for gamification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unlocked_cases TEXT[] DEFAULT ARRAY['penny-sleeve'],
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add length constraints to profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT bio_max_length CHECK (char_length(bio) <= 160);

-- Add missing fields to cards table
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS current_case TEXT DEFAULT 'penny-sleeve',
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS for_sale BOOLEAN DEFAULT false;

-- Add length constraints to cards
ALTER TABLE public.cards 
ADD CONSTRAINT title_max_length CHECK (char_length(title) <= 50),
ADD CONSTRAINT description_max_length CHECK (char_length(description) <= 200);

-- Create collection_items junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  position INTEGER DEFAULT 0,
  UNIQUE(collection_id, card_id)
);

-- Create card_likes table for tracking likes
CREATE TABLE IF NOT EXISTS public.card_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(card_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for collection_items
CREATE POLICY "Users can view collection items for public collections" 
ON public.collection_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.collections 
    WHERE id = collection_items.collection_id 
    AND (is_public = true OR user_id = auth.uid())
  )
);

CREATE POLICY "Users can manage their own collection items" 
ON public.collection_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.collections 
    WHERE id = collection_items.collection_id 
    AND user_id = auth.uid()
  )
);

-- Create RLS policies for card_likes
CREATE POLICY "Users can view all card likes" 
ON public.card_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own likes" 
ON public.card_likes FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_card_id ON public.collection_items(card_id);
CREATE INDEX IF NOT EXISTS idx_card_likes_card_id ON public.card_likes(card_id);
CREATE INDEX IF NOT EXISTS idx_card_likes_user_id ON public.card_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_category ON public.cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_current_case ON public.cards(current_case);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create function to update like_count when likes are added/removed
CREATE OR REPLACE FUNCTION public.update_card_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.cards 
    SET like_count = like_count + 1 
    WHERE id = NEW.card_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.cards 
    SET like_count = like_count - 1 
    WHERE id = OLD.card_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update like counts
CREATE TRIGGER update_card_likes_count
  AFTER INSERT OR DELETE ON public.card_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_card_like_count();

-- Create function to sync profile email from auth.users
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile email when auth user email changes
  UPDATE public.profiles 
  SET email = NEW.email 
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync email from auth.users to profiles
CREATE TRIGGER sync_user_email
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();