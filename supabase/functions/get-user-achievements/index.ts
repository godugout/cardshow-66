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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all achievement definitions
    const { data: definitions, error: definitionsError } = await supabaseClient
      .from('achievement_definitions')
      .select('*')
      .eq('is_active', true)
      .order('category, target')

    if (definitionsError) {
      console.error('Error fetching achievement definitions:', definitionsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch achievement definitions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's achievement progress
    const { data: userProgress, error: progressError } = await supabaseClient
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)

    if (progressError) {
      console.error('Error fetching user progress:', progressError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user progress' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a map of achievement progress for easy lookup
    const progressMap = new Map()
    userProgress?.forEach(progress => {
      progressMap.set(progress.achievement_id, progress)
    })

    // Combine definitions with user progress
    const userAchievements = definitions?.map(definition => {
      const progress = progressMap.get(definition.id)
      
      return {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        iconUrl: definition.icon_url,
        progress: {
          current: progress?.current_progress || 0,
          target: definition.target
        },
        unlockedAt: progress?.unlocked_at || undefined
      }
    }) || []

    return new Response(
      JSON.stringify(userAchievements),
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