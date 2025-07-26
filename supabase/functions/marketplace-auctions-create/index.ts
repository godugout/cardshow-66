import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cardId, startingPrice, durationHours, buyNowPrice } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authentication required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user) throw new Error("Invalid authentication");

    // Validate input
    if (!cardId || !startingPrice || !durationHours) {
      throw new Error("Missing required fields");
    }

    if (startingPrice <= 0) {
      throw new Error("Starting price must be greater than 0");
    }

    if (buyNowPrice && buyNowPrice <= startingPrice) {
      throw new Error("Buy Now price must be higher than starting price");
    }

    // Verify card ownership
    const { data: card, error: cardError } = await supabaseClient
      .from('cards')
      .select('id, user_id, title')
      .eq('id', cardId)
      .eq('user_id', user.id)
      .single();

    if (cardError || !card) {
      throw new Error("Card not found or you don't have permission to list it");
    }

    // Calculate auction end time
    const auctionEndTime = new Date();
    auctionEndTime.setHours(auctionEndTime.getHours() + durationHours);

    // Create auction in marketplace_listings table
    const { data: auction, error: auctionError } = await supabaseClient
      .from('marketplace_listings')
      .insert({
        user_id: user.id,
        card_id: cardId,
        price: startingPrice, // Starting price
        listing_type: 'auction',
        status: 'active',
        starting_bid: startingPrice,
        current_bid: startingPrice,
        auction_end_time: auctionEndTime.toISOString(),
        ...(buyNowPrice && { 
          // Store buy now price in a metadata field if needed
          // For now, we'll use the price field for buy now price tracking
        })
      })
      .select()
      .single();

    if (auctionError) {
      console.error('Error creating auction:', auctionError);
      throw new Error("Failed to create auction");
    }

    console.log('Auction created successfully:', auction.id);

    return new Response(JSON.stringify({
      message: "Auction created successfully",
      auctionId: auction.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in marketplace-auctions-create:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create auction"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});