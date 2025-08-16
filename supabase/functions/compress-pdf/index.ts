import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

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
    console.log('PDF compress function called');

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

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const compressionLevel = formData.get('compressionLevel') as string || 'medium';

    if (!file) {
      throw new Error('PDF file is required');
    }

    if (!file.type.includes('pdf')) {
      throw new Error('File must be a PDF');
    }

    console.log(`Compressing PDF file ${file.name} for user ${user.id} with ${compressionLevel} compression`);

    // Load the PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Apply compression settings based on level
    let compressionOptions = {};
    
    switch (compressionLevel) {
      case 'low':
        // Minimal compression - preserve more quality
        compressionOptions = {
          useObjectStreams: false,
          addDefaultPage: false,
        };
        break;
      case 'high':
        // Maximum compression - more size reduction
        compressionOptions = {
          useObjectStreams: true,
          addDefaultPage: false,
          updateMetadata: false,
        };
        break;
      default: // medium
        // Balanced compression
        compressionOptions = {
          useObjectStreams: true,
          addDefaultPage: false,
        };
    }

    // Save the compressed PDF
    const compressedPdfBytes = await pdfDoc.save(compressionOptions);
    
    // Calculate compression ratio
    const originalSize = arrayBuffer.byteLength;
    const compressedSize = compressedPdfBytes.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`Compression completed: ${originalSize} bytes -> ${compressedSize} bytes (${compressionRatio}% reduction)`);

    // Create filename for compressed PDF
    const timestamp = Date.now();
    const originalName = file.name.replace('.pdf', '');
    const compressedFilename = `${originalName}_compressed_${timestamp}.pdf`;
    const storagePath = `${user.id}/${compressedFilename}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('pdf-converted')
      .upload(storagePath, compressedPdfBytes, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to save compressed PDF');
    }

    // Create conversion record
    const conversionData = {
      user_id: user.id,
      original_filename: file.name,
      converted_filename: compressedFilename,
      conversion_type: 'compress',
      status: 'completed',
      completed_at: new Date().toISOString(),
      file_size: compressedPdfBytes.length,
      storage_path: storagePath,
      metadata: {
        originalSize,
        compressedSize,
        compressionRatio: parseFloat(compressionRatio),
        compressionLevel
      }
    };

    const { data: conversion, error: dbError } = await supabase
      .from('pdf_conversions')
      .insert(conversionData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to record conversion');
    }

    console.log('PDF compression completed successfully');

    return new Response(JSON.stringify({
      success: true,
      conversion_id: conversion.id,
      filename: compressedFilename,
      originalSize,
      compressedSize,
      compressionRatio: parseFloat(compressionRatio),
      message: `PDF compressed successfully with ${compressionRatio}% size reduction`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in compress-pdf function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to compress PDF' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});