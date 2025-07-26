import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auctionId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    if (!auctionId) {
      throw new Error("Auction ID is required");
    }

    // Get auction details with related data
    const { data: auction, error: auctionError } = await supabaseClient
      .from('marketplace_listings')
      .select(`
        *,
        cards (
          id,
          title,
          image_url,
          rarity
        ),
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('id', auctionId)
      .eq('listing_type', 'auction')
      .single();

    if (auctionError || !auction) {
      throw new Error("Auction not found");
    }

    // Get bid history with anonymized bidder info
    const { data: bids, error: bidsError } = await supabaseClient
      .rpc('get_auction_bids_anonymized', { auction_listing_id: auctionId });

    if (bidsError) {
      console.error('Error fetching bids:', bidsError);
      // Continue without bid history rather than failing
    }

    // If the RPC doesn't exist, fall back to a simple query
    let bidHistory = bids || [];
    if (!bids) {
      // Simple fallback query without anonymization
      const { data: fallbackBids } = await supabaseClient
        .from('auction_bids')
        .select('*')
        .eq('listing_id', auctionId)
        .order('created_at', { ascending: false });
      
      bidHistory = fallbackBids?.map((bid, index) => ({
        ...bid,
        bidder_display_name: `Bidder #${index + 1}`
      })) || [];
    }

    // Transform auction data to match expected interface
    const transformedAuction = {
      id: auction.id,
      card_id: auction.card_id,
      seller_id: auction.user_id,
      starting_price: auction.starting_bid || auction.price,
      current_bid: auction.current_bid || auction.price,
      buy_now_price: auction.buy_now_price,
      auction_end_time: auction.auction_end_time,
      status: auction.status,
      bid_count: bidHistory.length,
      created_at: auction.created_at,
      updated_at: auction.updated_at,
      card: auction.cards,
      seller: auction.profiles
    };

    return new Response(JSON.stringify({
      auction: transformedAuction,
      bidHistory
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in marketplace-auctions-get:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to fetch auction details"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});