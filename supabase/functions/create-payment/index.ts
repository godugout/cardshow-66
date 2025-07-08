import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Use service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { cardId } = await req.json();
    if (!cardId) throw new Error("Card ID is required");
    logStep("Request data parsed", { cardId });

    // Fetch card details
    const { data: card, error: cardError } = await supabaseService
      .from('cards')
      .select('id, title, image_url, user_id')
      .eq('id', cardId)
      .single();

    if (cardError || !card) throw new Error("Card not found");
    logStep("Card found", { cardTitle: card.title });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found");
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Create Stripe checkout session for card purchase
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `CRD: ${card.title}`,
              images: card.image_url ? [card.image_url] : undefined
            },
            unit_amount: 99, // $0.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/marketplace?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/marketplace?purchase=cancelled`,
      metadata: {
        card_id: cardId,
        user_id: user.id,
      },
    });

    // Create order record
    const { error: orderError } = await supabaseService
      .from('orders')
      .insert({
        user_id: user.id,
        card_id: cardId,
        stripe_session_id: session.id,
        amount: 99,
        status: 'pending'
      });

    if (orderError) {
      logStep("Error creating order", { error: orderError });
      throw new Error("Failed to create order record");
    }

    logStep("Payment session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});