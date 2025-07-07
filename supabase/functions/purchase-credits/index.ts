import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PURCHASE-CREDITS] ${step}${detailsStr}`);
};

// Credit packages with pricing
const CREDIT_PACKAGES = {
  small: { credits: 100, price: 999, name: "100 CRD Tokens" }, // $9.99
  medium: { credits: 500, price: 3999, name: "500 CRD Tokens" }, // $39.99 (20% bonus)
  large: { credits: 1200, price: 7999, name: "1200 CRD Tokens" }, // $79.99 (50% bonus)
  mega: { credits: 2500, price: 14999, name: "2500 CRD Tokens" } // $149.99 (67% bonus)
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { packageType } = await req.json();
    if (!packageType || !CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES]) {
      throw new Error("Invalid package type");
    }
    
    const selectedPackage = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];
    logStep("Package selected", { packageType, package: selectedPackage });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found");
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: selectedPackage.name,
              description: `${selectedPackage.credits} CRD Tokens for card creation and marketplace transactions`
            },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/credits`,
      metadata: {
        user_id: user.id,
        credits: selectedPackage.credits.toString(),
        package_type: packageType,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in purchase-credits", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});