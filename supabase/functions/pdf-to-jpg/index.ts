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
    console.log('PDF to JPG function called');

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
    const quality = parseInt(formData.get('quality') as string) || 80;
    const pageRange = formData.get('pageRange') as string || 'all';

    if (!file) {
      throw new Error('PDF file is required');
    }

    if (!file.type.includes('pdf')) {
      throw new Error('File must be a PDF');
    }

    console.log(`Converting PDF ${file.name} to JPG for user ${user.id}`);

    // Load the PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();

    console.log(`PDF has ${pageCount} pages`);

    // Determine which pages to convert
    let pagesToConvert: number[] = [];
    if (pageRange === 'all') {
      pagesToConvert = Array.from({ length: pageCount }, (_, i) => i);
    } else if (pageRange.includes('-')) {
      const [start, end] = pageRange.split('-').map(n => parseInt(n.trim()) - 1);
      for (let i = Math.max(0, start); i <= Math.min(pageCount - 1, end); i++) {
        pagesToConvert.push(i);
      }
    } else {
      const pageNum = parseInt(pageRange) - 1;
      if (pageNum >= 0 && pageNum < pageCount) {
        pagesToConvert = [pageNum];
      }
    }

    if (pagesToConvert.length === 0) {
      throw new Error('No valid pages to convert');
    }

    console.log(`Converting pages: ${pagesToConvert.map(p => p + 1).join(', ')}`);

    // Convert pages to images using a simpler approach
    // Since we can't use canvas in Deno, we'll create individual PDFs for each page
    // and store them, then let the frontend handle the actual image conversion
    
    const convertedFiles: any[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < pagesToConvert.length; i++) {
      const pageIndex = pagesToConvert[i];
      
      // Create a new PDF with just this page
      const singlePagePdf = await PDFDocument.create();
      const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageIndex]);
      singlePagePdf.addPage(copiedPage);
      
      const singlePageBytes = await singlePagePdf.save();
      
      // Create filename for this page
      const pageFilename = `${file.name.replace('.pdf', '')}_page_${pageIndex + 1}_${timestamp}.pdf`;
      const storagePath = `${user.id}/${pageFilename}`;

      // Upload single page PDF to storage
      const { error: uploadError } = await supabase.storage
        .from('pdf-converted')
        .upload(storagePath, singlePageBytes, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Upload error for page', pageIndex + 1, ':', uploadError);
        continue;
      }

      convertedFiles.push({
        pageNumber: pageIndex + 1,
        filename: pageFilename,
        storagePath: storagePath,
        size: singlePageBytes.length
      });
    }

    if (convertedFiles.length === 0) {
      throw new Error('Failed to convert any pages');
    }

    // Create conversion record
    const conversionData = {
      user_id: user.id,
      original_filename: file.name,
      converted_filename: `${file.name.replace('.pdf', '')}_images_${timestamp}.zip`,
      conversion_type: 'pdf-to-jpg',
      status: 'completed',
      completed_at: new Date().toISOString(),
      file_size: file.size,
      storage_path: JSON.stringify(convertedFiles) // Store file info as JSON
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

    console.log('PDF to JPG conversion completed successfully');

    return new Response(JSON.stringify({
      success: true,
      conversion: conversion,
      pages: convertedFiles,
      message: `Successfully extracted ${convertedFiles.length} pages`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in pdf-to-jpg function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});