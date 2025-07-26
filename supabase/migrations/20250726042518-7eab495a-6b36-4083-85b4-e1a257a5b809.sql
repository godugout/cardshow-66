-- Create bundles table for card bundles
CREATE TABLE public.bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bundle_cards table for many-to-many relationship
CREATE TABLE public.bundle_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bundle_id, card_id)
);

-- Enable RLS on bundles
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on bundle_cards
ALTER TABLE public.bundle_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for bundles
CREATE POLICY "Creators can manage their own bundles" 
ON public.bundles 
FOR ALL 
USING (auth.uid() = creator_id);

CREATE POLICY "Users can view active bundles" 
ON public.bundles 
FOR SELECT 
USING (status = 'active' OR auth.uid() = creator_id);

-- Create policies for bundle_cards
CREATE POLICY "Bundle cards are viewable with bundle access" 
ON public.bundle_cards 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.bundles b 
    WHERE b.id = bundle_cards.bundle_id 
    AND (b.status = 'active' OR b.creator_id = auth.uid())
  )
);

CREATE POLICY "Creators can manage their bundle cards" 
ON public.bundle_cards 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.bundles b 
    WHERE b.id = bundle_cards.bundle_id 
    AND b.creator_id = auth.uid()
  )
);

-- Add bundle_id to cards table to track if card is in a bundle
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES public.bundles(id) ON DELETE SET NULL;

-- Create index for efficient bundle queries
CREATE INDEX IF NOT EXISTS idx_bundles_creator_id ON public.bundles(creator_id);
CREATE INDEX IF NOT EXISTS idx_bundles_status ON public.bundles(status);
CREATE INDEX IF NOT EXISTS idx_bundle_cards_bundle_id ON public.bundle_cards(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_cards_card_id ON public.bundle_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_cards_bundle_id ON public.cards(bundle_id);

-- Create trigger to update updated_at on bundles
CREATE TRIGGER update_bundles_updated_at
  BEFORE UPDATE ON public.bundles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bundles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bundles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bundle_cards;