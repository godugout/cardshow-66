import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { eventType, userId, eventData = {} } = await req.json()

    if (!eventType || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: eventType and userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing achievement event: ${eventType} for user: ${userId}`)

    // Log the user action event
    const { error: eventError } = await supabaseClient
      .from('user_action_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData
      })

    if (eventError) {
      console.error('Error logging user action event:', eventError)
    }

    // Process achievement progress
    const { error: processError } = await supabaseClient
      .rpc('process_achievement_progress', {
        _user_id: userId,
        _event_type: eventType,
        _event_data: eventData
      })

    if (processError) {
      console.error('Error processing achievement progress:', processError)
      return new Response(
        JSON.stringify({ error: 'Failed to process achievement progress' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully processed achievement event: ${eventType} for user: ${userId}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Achievement progress updated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})