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

    if (!auctionId) {
      throw new Error("Auction ID is required");
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

    // Check if user is trying to buy their own auction
    if (auction.user_id === user.id) {
      throw new Error("You cannot buy your own auction");
    }

    // Check if auction has ended
    const auctionEndTime = new Date(auction.auction_end_time);
    const now = new Date();
    
    if (now > auctionEndTime) {
      throw new Error("Auction has ended");
    }

    // Check if buy now price is available
    if (!auction.buy_now_price) {
      throw new Error("Buy It Now option is not available for this auction");
    }

    // Process the purchase - this would typically involve:
    // 1. Creating an order record
    // 2. Processing payment
    // 3. Transferring card ownership
    // 4. Ending the auction

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        card_id: auction.card_id,
        amount: Math.round(auction.buy_now_price * 100), // Convert to cents
        status: 'paid', // In a real implementation, this would be pending until payment
        currency: 'usd'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error("Failed to create order");
    }

    // End the auction
    const { error: updateError } = await supabaseClient
      .from('marketplace_listings')
      .update({
        status: 'sold',
        current_bid: auction.buy_now_price,
        updated_at: new Date().toISOString()
      })
      .eq('id', auctionId);

    if (updateError) {
      console.error('Error ending auction:', updateError);
      throw new Error("Failed to complete purchase");
    }

    // Transfer card ownership (if applicable)
    // This depends on your card ownership model
    
    console.log(`Buy Now completed: $${auction.buy_now_price} for auction ${auctionId} by user ${user.id}`);

    return new Response(JSON.stringify({
      message: "Purchase completed successfully",
      orderId: order.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in marketplace-auctions-buy-now:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to complete purchase"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});