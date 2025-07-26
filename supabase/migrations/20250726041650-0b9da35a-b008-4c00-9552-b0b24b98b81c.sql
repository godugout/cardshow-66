-- Create auction_bids table for tracking auction bids
CREATE TABLE public.auction_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  bid_type TEXT NOT NULL DEFAULT 'manual' CHECK (bid_type IN ('manual', 'proxy', 'auto_increment')),
  is_winning_bid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on auction_bids
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;

-- Create policies for auction_bids
CREATE POLICY "Users can view bids for active auctions" 
ON public.auction_bids 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_listings ml 
    WHERE ml.id = auction_bids.listing_id 
    AND ml.listing_type = 'auction'
    AND ml.status = 'active'
  )
);

CREATE POLICY "Authenticated users can create bids" 
ON public.auction_bids 
FOR INSERT 
WITH CHECK (
  auth.uid() = bidder_id
  AND EXISTS (
    SELECT 1 FROM public.marketplace_listings ml 
    WHERE ml.id = auction_bids.listing_id 
    AND ml.listing_type = 'auction'
    AND ml.status = 'active'
    AND ml.user_id != auth.uid() -- Can't bid on own auction
  )
);

-- Add auction-specific columns to marketplace_listings if not exists
ALTER TABLE public.marketplace_listings 
ADD COLUMN IF NOT EXISTS starting_bid NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS current_bid NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS buy_now_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS auction_end_time TIMESTAMP WITH TIME ZONE;

-- Create index for efficient auction queries
CREATE INDEX IF NOT EXISTS idx_auction_bids_listing_id ON public.auction_bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_created_at ON public.auction_bids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_auction_end ON public.marketplace_listings(auction_end_time) 
WHERE listing_type = 'auction';

-- Create function to get anonymized auction bids
CREATE OR REPLACE FUNCTION public.get_auction_bids_anonymized(auction_listing_id UUID)
RETURNS TABLE (
  id UUID,
  listing_id UUID,
  amount NUMERIC,
  bid_type TEXT,
  is_winning_bid BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  bidder_display_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ab.id,
    ab.listing_id,
    ab.amount,
    ab.bid_type,
    ab.is_winning_bid,
    ab.created_at,
    CASE 
      WHEN ab.bidder_id = auth.uid() THEN 'You'
      ELSE 'Bidder #' || (ROW_NUMBER() OVER (ORDER BY ab.created_at DESC))::TEXT
    END as bidder_display_name
  FROM public.auction_bids ab
  WHERE ab.listing_id = auction_listing_id
  ORDER BY ab.created_at DESC;
END;
$function$;

-- Create trigger to update updated_at on auction_bids
CREATE TRIGGER update_auction_bids_updated_at
  BEFORE UPDATE ON public.auction_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for auction_bids table
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_bids;