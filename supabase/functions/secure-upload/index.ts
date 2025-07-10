import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SECURE-UPLOAD] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Secure upload function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Use service role for validation and storage operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Rate limiting check
    const { data: rateLimitResult } = await supabaseService.rpc('check_rate_limit', {
      user_identifier: user.id,
      action_type: 'file_upload',
      max_attempts: 10,
      time_window_minutes: 5
    });

    if (!rateLimitResult) {
      throw new Error("Upload rate limit exceeded. Please wait before trying again.");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    
    if (!file) throw new Error("No file provided");
    if (!bucket) throw new Error("No bucket specified");

    // Validate file using our security function
    const { data: isValid } = await supabaseService.rpc('validate_file_upload', {
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type
    });

    if (!isValid) {
      throw new Error("File validation failed. Check file type, size, and format.");
    }

    // Generate secure filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabaseService.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      logStep("Upload error", { error: uploadError });
      throw new Error("Failed to upload file");
    }

    // Log successful upload
    await supabaseService
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        event_type: 'file_upload',
        event_data: {
          bucket,
          file_name: fileName,
          file_size: file.size,
          mime_type: file.type
        }
      });

    logStep("File uploaded successfully", { fileName, bucket });

    return new Response(JSON.stringify({ 
      success: true, 
      path: uploadData.path,
      url: `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/${bucket}/${uploadData.path}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in secure-upload", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: "Upload failed. Please check your file and try again." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});