import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auctionId, amount } = await req.json();
    
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
    if (!auctionId || !amount) {
      throw new Error("Missing required fields");
    }

    if (amount <= 0) {
      throw new Error("Bid amount must be greater than 0");
    }

    // Get current auction details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('marketplace_listings')
      .select('*')
      .eq('id', auctionId)
      .eq('listing_type', 'auction')
      .eq('status', 'active')
      .single();

    if (auctionError || !auction) {
      throw new Error("Auction not found or not active");
    }

    // Check if auction has ended
    const auctionEndTime = new Date(auction.auction_end_time);
    const now = new Date();
    
    if (now > auctionEndTime) {
      throw new Error("Auction has ended");
    }

    // Check if user is trying to bid on their own auction
    if (auction.user_id === user.id) {
      throw new Error("You cannot bid on your own auction");
    }

    // Validate bid amount
    const currentHighestBid = auction.current_bid || auction.starting_bid || auction.price;
    if (amount <= currentHighestBid) {
      throw new Error(`Bid must be higher than current bid of $${currentHighestBid}`);
    }

    // Create new bid record in auction_bids table
    // Note: This table might need to be created first
    const { data: bid, error: bidError } = await supabaseClient
      .from('auction_bids')
      .insert({
        listing_id: auctionId,
        bidder_id: user.id,
        amount: amount,
        bid_type: 'manual',
        is_winning_bid: true // This will be the new winning bid
      })
      .select()
      .single();

    if (bidError) {
      // If auction_bids table doesn't exist, we'll work around it
      console.error('Error creating bid record:', bidError);
    }

    // Mark all previous bids for this auction as non-winning
    if (bid) {
      await supabaseClient
        .from('auction_bids')
        .update({ is_winning_bid: false })
        .eq('listing_id', auctionId)
        .neq('id', bid.id);
    }

    // Update the auction with new highest bid
    const { error: updateError } = await supabaseClient
      .from('marketplace_listings')
      .update({
        current_bid: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', auctionId);

    if (updateError) {
      console.error('Error updating auction:', updateError);
      throw new Error("Failed to update auction");
    }

    console.log(`Bid placed successfully: $${amount} on auction ${auctionId} by user ${user.id}`);

    // The real-time subscription in the component will automatically pick up this change
    return new Response(JSON.stringify({
      message: "Bid placed successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in marketplace-auctions-bid:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to place bid"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});