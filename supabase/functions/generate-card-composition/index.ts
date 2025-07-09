import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const body: CardCompositionRequest = await req.json();
    console.log('Generating card composition for user:', user.id);

    // Generate serial number
    const { data: serialData, error: serialError } = await supabase
      .rpc('get_next_crd_serial');
    
    if (serialError) {
      console.error('Serial generation error:', serialError);
      throw new Error('Failed to generate serial number');
    }

    const serialNumber = serialData || 1;
    const crdSerial = `CRD No. ${serialNumber.toString().padStart(3, '0')}`;

    // Create a simple composition (for now using canvas-like approach)
    // In a real implementation, you'd use a proper image composition library
    const compositeImageData = await createCardComposite(body);

    // Upload composite image to storage
    const fileName = `crd-${serialNumber}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('card-assets')
      .upload(`compositions/${fileName}`, compositeImageData, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload composite image');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('card-assets')
      .getPublicUrl(`compositions/${fileName}`);

    const compositeUrl = urlData.publicUrl;

    // Create card record in database
    const { data: cardData, error: cardError } = await supabase
      .from('cards')
      .insert({
        user_id: user.id,
        title: body.cardData.title,
        description: body.cardData.description,
        image_url: body.imageUrl,
        composite_image_url: compositeUrl,
        serial_number: crdSerial,
        frame_data: { frameId: body.frameId },
        effects_data: body.effects,
        rarity: body.cardData.rarity,
        tags: body.cardData.tags,
        is_public: false,
        creation_session_id: crypto.randomUUID()
      })
      .select()
      .single();

    if (cardError) {
      console.error('Database error:', cardError);
      throw new Error('Failed to save card to database');
    }

    console.log('Card created successfully:', cardData.id, 'Serial:', crdSerial);

    return new Response(
      JSON.stringify({
        success: true,
        card: cardData,
        compositeUrl,
        serialNumber: crdSerial
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Card composition error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function createCardComposite(data: CardCompositionRequest): Promise<Uint8Array> {
  // This is a simplified implementation
  // In a real scenario, you'd use a proper image manipulation library
  // For now, we'll create a simple canvas-based composition
  
  const canvas = new OffscreenCanvas(600, 840); // Standard card dimensions
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  // Set background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 600, 840);

  // Add frame styling based on frameId
  ctx.strokeStyle = '#FF6B4A'; // CRD orange
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, 560, 800);

  // Add title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(data.cardData.title, 300, 60);

  // Add serial number
  ctx.font = '16px Arial';
  ctx.fillText(`Serial: ${data.cardData.rarity.toUpperCase()}`, 300, 800);

  // Convert canvas to blob
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  const arrayBuffer = await blob.arrayBuffer();
  
  return new Uint8Array(arrayBuffer);
}