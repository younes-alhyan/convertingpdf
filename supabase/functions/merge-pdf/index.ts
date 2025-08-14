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
    console.log('PDF merge function called');

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
    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      throw new Error('At least 2 PDF files are required for merging');
    }

    console.log(`Merging ${files.length} PDF files for user ${user.id}`);

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each PDF file
    for (const file of files) {
      if (!file.type.includes('pdf')) {
        throw new Error(`File ${file.name} is not a PDF`);
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    // Generate the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    
    // Create filename for merged PDF
    const timestamp = Date.now();
    const mergedFilename = `merged_${timestamp}.pdf`;
    const storagePath = `${user.id}/${mergedFilename}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('pdf-converted')
      .upload(storagePath, mergedPdfBytes, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to save merged PDF');
    }

    // Create conversion record
    const conversionData = {
      user_id: user.id,
      original_filename: files.map(f => f.name).join(', '),
      converted_filename: mergedFilename,
      conversion_type: 'merge',
      status: 'completed',
      completed_at: new Date().toISOString(),
      file_size: mergedPdfBytes.length,
      storage_path: storagePath
    };

    const { data: conversion, error: dbError } = await supabase
      .from('pdf_conversions')
      .insert(conversionData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save conversion record');
    }

    console.log('PDF merge completed successfully');

    return new Response(JSON.stringify({
      success: true,
      conversion: conversion,
      downloadUrl: `/api/download/${conversion.id}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in merge-pdf function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});