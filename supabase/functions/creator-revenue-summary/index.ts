import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATOR-REVENUE-SUMMARY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Generate mock revenue data for demonstration
    // In a real implementation, this would query actual sales/transaction data
    const mockRevenueData = {
      balance: Math.floor(Math.random() * 2000) + 500, // $500-$2500
      hasStripeAccount: Math.random() > 0.3, // 70% chance of having Stripe setup
      
      recentTransactions: [
        {
          id: "txn_001",
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          description: "Card Sale",
          amount: 15.99,
          type: "sale",
          cardTitle: "Legendary Dragon Card"
        },
        {
          id: "txn_002", 
          date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          description: "Platform Fee",
          amount: -2.40,
          type: "fee"
        },
        {
          id: "txn_003",
          date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          description: "Card Sale",
          amount: 29.99,
          type: "sale",
          cardTitle: "Epic Warrior Card"
        },
        {
          id: "txn_004",
          date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
          description: "Payout",
          amount: -150.00,
          type: "payout"
        },
        {
          id: "txn_005",
          date: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
          description: "Card Sale",
          amount: 8.99,
          type: "sale",
          cardTitle: "Rare Spell Card"
        }
      ],

      payoutHistory: [
        {
          id: "payout_001",
          date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
          amount: 150.00,
          status: "completed",
          transactionId: "txn_1234567890",
          description: "Weekly payout"
        },
        {
          id: "payout_002",
          date: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
          amount: 75.50,
          status: "completed", 
          transactionId: "txn_0987654321",
          description: "Weekly payout"
        },
        {
          id: "payout_003",
          date: new Date(Date.now() - 1814400000).toISOString(), // 3 weeks ago
          amount: 225.75,
          status: "pending",
          description: "Weekly payout"
        }
      ],

      salesAnalytics: {
        totalEarnings: 1847.23,
        thisMonthEarnings: 342.15,
        
        // Last 30 days earnings chart data
        earningsChart: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
          earnings: Math.floor(Math.random() * 50) + Math.floor(Math.random() * 20)
        })),

        // Top selling cards
        topSellingCards: [
          {
            id: "card_001",
            title: "Legendary Dragon Master",
            sales: 45,
            revenue: 674.55,
            rarity: "legendary"
          },
          {
            id: "card_002", 
            title: "Epic Storm Warrior",
            sales: 32,
            revenue: 479.68,
            rarity: "epic"
          },
          {
            id: "card_003",
            title: "Rare Fire Mage",
            sales: 28,
            revenue: 251.72,
            rarity: "rare"
          },
          {
            id: "card_004",
            title: "Mystic Forest Guardian", 
            sales: 19,
            revenue: 170.81,
            rarity: "epic"
          },
          {
            id: "card_005",
            title: "Common Lightning Bolt",
            sales: 67,
            revenue: 134.00,
            rarity: "common"
          }
        ],

        // Revenue by card type/rarity
        revenueByCardType: [
          { type: "legendary", revenue: 845.20, count: 12 },
          { type: "epic", revenue: 567.89, count: 23 },
          { type: "rare", revenue: 298.45, count: 45 },
          { type: "uncommon", revenue: 97.23, count: 28 },
          { type: "common", revenue: 38.46, count: 67 }
        ],

        // Sales trends over time
        salesTrends: Array.from({ length: 14 }, (_, i) => ({
          date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
          sales: Math.floor(Math.random() * 10) + 1,
          revenue: Math.floor(Math.random() * 150) + 25
        })),

        // Performance metrics
        performanceMetrics: {
          averageSalePrice: 12.45,
          totalCards: 175,
          conversionRate: 8.7,
          topRarity: "legendary"
        }
      }
    };

    logStep("Revenue data generated", { 
      balance: mockRevenueData.balance,
      hasStripeAccount: mockRevenueData.hasStripeAccount 
    });

    return new Response(JSON.stringify(mockRevenueData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});