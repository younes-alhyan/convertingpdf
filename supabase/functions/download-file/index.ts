import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Download function called');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get conversion ID from URL
    const url = new URL(req.url);
    const conversionId = url.pathname.split('/').pop();

    if (!conversionId) {
      throw new Error('Conversion ID is required');
    }

    console.log(`Downloading file for conversion ${conversionId} by user ${user.id}`);

    // Get conversion record
    const { data: conversion, error: dbError } = await supabase
      .from('pdf_conversions')
      .select('*')
      .eq('id', conversionId)
      .eq('user_id', user.id) // Ensure user owns this conversion
      .single();

    if (dbError || !conversion) {
      throw new Error('Conversion not found or access denied');
    }

    if (conversion.status !== 'completed' || !conversion.storage_path) {
      throw new Error('File not ready for download');
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('pdf-converted')
      .download(conversion.storage_path);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      throw new Error('Failed to download file');
    }

    console.log('File downloaded successfully');

    // Return file with proper headers
    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${conversion.converted_filename}"`,
        'Cache-Control': 'no-cache'
      },
      status: 200
    });

  } catch (error) {
    console.error('Error in download function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});