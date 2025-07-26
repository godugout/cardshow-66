import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, price, cardIds } = await req.json();
    
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
    if (!title || !price || !cardIds || !Array.isArray(cardIds)) {
      throw new Error("Missing required fields: title, price, and cardIds");
    }

    if (cardIds.length < 2) {
      throw new Error("A bundle must contain at least 2 cards");
    }

    if (cardIds.length > 20) {
      throw new Error("A bundle cannot contain more than 20 cards");
    }

    if (price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    // Verify all cards belong to the user and are available for bundling
    const { data: cards, error: cardsError } = await supabaseClient
      .from('cards')
      .select('id, title, for_sale, bundle_id')
      .eq('user_id', user.id)
      .in('id', cardIds);

    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      throw new Error("Failed to verify card ownership");
    }

    if (!cards || cards.length !== cardIds.length) {
      throw new Error("Some cards not found or you don't have permission to bundle them");
    }

    // Check if any cards are already for sale or in a bundle
    const unavailableCards = cards.filter(card => card.for_sale || card.bundle_id);
    if (unavailableCards.length > 0) {
      throw new Error(`Some cards are already listed for sale or in another bundle: ${unavailableCards.map(c => c.title).join(', ')}`);
    }

    // Create bundle
    const { data: bundle, error: bundleError } = await supabaseClient
      .from('bundles')
      .insert({
        creator_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        price: price,
        status: 'active'
      })
      .select()
      .single();

    if (bundleError) {
      console.error('Error creating bundle:', bundleError);
      throw new Error("Failed to create bundle");
    }

    // Create bundle_cards relationships
    const bundleCardData = cardIds.map(cardId => ({
      bundle_id: bundle.id,
      card_id: cardId
    }));

    const { error: bundleCardsError } = await supabaseClient
      .from('bundle_cards')
      .insert(bundleCardData);

    if (bundleCardsError) {
      console.error('Error adding cards to bundle:', bundleCardsError);
      // Clean up the bundle if bundle_cards creation failed
      await supabaseClient.from('bundles').delete().eq('id', bundle.id);
      throw new Error("Failed to add cards to bundle");
    }

    // Update cards to reference the bundle
    const { error: updateCardsError } = await supabaseClient
      .from('cards')
      .update({ bundle_id: bundle.id })
      .in('id', cardIds);

    if (updateCardsError) {
      console.error('Error updating card bundle references:', updateCardsError);
      // This is not critical, the bundle_cards table maintains the relationship
      console.warn('Cards not updated with bundle_id, but bundle creation succeeded');
    }

    console.log(`Bundle created successfully: ${bundle.id} with ${cardIds.length} cards`);

    return new Response(JSON.stringify({
      message: "Bundle listed successfully",
      bundleId: bundle.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in marketplace-bundles-create:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create bundle"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});