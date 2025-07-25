/**
 * Secure File Upload Edge Function
 * Provides server-side validation, virus scanning, and secure file processing
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileUploadRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileData: string; // Base64 encoded file data
  userId: string;
  fileType: 'image' | 'psd' | 'document';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: FileUploadRequest = await req.json();
    const { fileName, fileSize, mimeType, fileData, userId, fileType } = body;

    // Validate user ownership
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized file upload' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      user_identifier: userId,
      action_type: 'file_upload',
      max_attempts: 10,
      time_window_minutes: 60
    });

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Upload rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file using database function
    const { data: isValidFile } = await supabase.rpc('validate_file_upload', {
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType
    });

    if (!isValidFile) {
      return new Response(
        JSON.stringify({ error: 'File validation failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode base64 file data
    const fileBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Basic virus scanning - check for suspicious file patterns
    const suspiciousPatterns = [
      new Uint8Array([0x4D, 0x5A]), // MZ (Windows executable)
      new Uint8Array([0x50, 0x4B, 0x03, 0x04]), // ZIP file
      new Uint8Array([0x7F, 0x45, 0x4C, 0x46]), // ELF (Linux executable)
    ];

    for (const pattern of suspiciousPatterns) {
      if (fileBuffer.length >= pattern.length) {
        const fileStart = fileBuffer.slice(0, pattern.length);
        if (fileStart.every((byte, i) => byte === pattern[i])) {
          return new Response(
            JSON.stringify({ error: 'Suspicious file detected' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Verify file header matches declared MIME type
    const isValidHeader = verifyFileHeader(fileBuffer, mimeType);
    if (!isValidHeader) {
      return new Response(
        JSON.stringify({ error: 'File header does not match declared type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure file path
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const sanitizedName = sanitizeFileName(fileName);
    const extension = sanitizedName.split('.').pop();
    const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.'));
    const filePath = `${userId}/${fileType}/${timestamp}_${random}_${nameWithoutExt}.${extension}`;

    // Upload file to Supabase Storage
    const bucket = fileType === 'psd' ? 'crd-templates' : 'card-images';
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'File upload failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    // Log successful upload for audit
    await supabase.from('security_audit_log').insert({
      user_id: userId,
      event_type: 'file_upload_success',
      event_data: {
        fileName: sanitizedName,
        fileSize,
        mimeType,
        filePath: uploadData.path
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        path: uploadData.path,
        publicUrl
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Secure file upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions
function verifyFileHeader(fileBuffer: Uint8Array, mimeType: string): boolean {
  if (fileBuffer.length < 12) return false;

  switch (mimeType) {
    case 'image/jpeg':
      return fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8 && fileBuffer[2] === 0xFF;
    case 'image/png':
      return fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47;
    case 'image/webp':
      return fileBuffer[0] === 0x52 && fileBuffer[1] === 0x49 && fileBuffer[2] === 0x46 && fileBuffer[3] === 0x46 &&
             fileBuffer[8] === 0x57 && fileBuffer[9] === 0x45 && fileBuffer[10] === 0x42 && fileBuffer[11] === 0x50;
    case 'image/gif':
      return fileBuffer[0] === 0x47 && fileBuffer[1] === 0x49 && fileBuffer[2] === 0x46;
    case 'application/vnd.adobe.photoshop':
      return fileBuffer[0] === 0x38 && fileBuffer[1] === 0x42 && fileBuffer[2] === 0x50 && fileBuffer[3] === 0x53;
    default:
      return false;
  }
}

function sanitizeFileName(fileName: string): string {
  let sanitized = fileName.replace(/[\/\\]/g, '');
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_');
  
  const maxLength = 100;
  if (sanitized.length > maxLength) {
    const extension = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, maxLength - extension!.length - 1) + '.' + extension;
  }
  
  return sanitized;
}