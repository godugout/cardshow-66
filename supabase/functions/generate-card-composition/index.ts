import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface CardCompositionRequest {
  imageUrl: string;
  frameId: string;
  effects: Record<string, any>;
  cardData: {
    title: string;
    description?: string;
    rarity: string;
    tags: string[];
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting card composition generation...');
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const requestData: CardCompositionRequest = await req.json();
    console.log('Request data:', requestData);

    // Generate a serial number for the card
    const serialNumber = `CRD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // For now, we'll create a basic card entry without actual image composition
    // In a real implementation, this would involve:
    // 1. Downloading the source image
    // 2. Applying frame and effects
    // 3. Generating the composite image
    // 4. Uploading to storage
    
    const { data: newCard, error: insertError } = await supabase
      .from('cards')
      .insert({
        user_id: user.id,
        title: requestData.cardData.title,
        description: requestData.cardData.description || '',
        rarity: requestData.cardData.rarity,
        tags: requestData.cardData.tags,
        image_url: requestData.imageUrl, // For now, use the original image
        thumbnail_url: requestData.imageUrl,
        is_public: true,
        creator_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Card created successfully:', newCard);

    // Format response to match expected interface
    const createdCard = {
      id: newCard.id,
      serial_number: serialNumber,
      composite_image_url: newCard.image_url,
      title: newCard.title,
      rarity: newCard.rarity,
      frame_data: { frameId: requestData.frameId },
      effects_data: requestData.effects,
      created_at: newCard.created_at
    };

    return new Response(
      JSON.stringify({
        success: true,
        card: createdCard,
        serialNumber: serialNumber
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Card composition error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});