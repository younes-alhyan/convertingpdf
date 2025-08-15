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
    console.log('PDF split function called');

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
    const splitType = formData.get('splitType') as string || 'pages';
    const splitValue = formData.get('splitValue') as string || '1';

    if (!file) {
      throw new Error('PDF file is required');
    }

    if (!file.type.includes('pdf')) {
      throw new Error('File must be a PDF');
    }

    console.log(`Splitting PDF ${file.name} for user ${user.id}`);

    // Load the PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();

    console.log(`PDF has ${pageCount} pages`);

    const splitFiles: any[] = [];
    const timestamp = Date.now();

    // Split based on type
    if (splitType === 'pages') {
      const pagesPerFile = parseInt(splitValue);
      
      for (let i = 0; i < pageCount; i += pagesPerFile) {
        const newPdf = await PDFDocument.create();
        const endPage = Math.min(i + pagesPerFile, pageCount);
        
        const pagesToCopy = [];
        for (let j = i; j < endPage; j++) {
          pagesToCopy.push(j);
        }
        
        const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
        copiedPages.forEach((page) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const fileName = `${file.name.replace('.pdf', '')}_part_${Math.floor(i / pagesPerFile) + 1}_${timestamp}.pdf`;
        const storagePath = `${user.id}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('pdf-converted')
          .upload(storagePath, pdfBytes, {
            contentType: 'application/pdf',
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        splitFiles.push({
          filename: fileName,
          storagePath: storagePath,
          size: pdfBytes.length,
          pageRange: `${i + 1}-${endPage}`
        });
      }
    } else if (splitType === 'ranges') {
      // Parse ranges like "1-3,5-7,9"
      const ranges = splitValue.split(',').map(r => r.trim());
      
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const newPdf = await PDFDocument.create();
        
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(n => parseInt(n.trim()) - 1);
          const pagesToCopy = [];
          for (let j = Math.max(0, start); j <= Math.min(pageCount - 1, end); j++) {
            pagesToCopy.push(j);
          }
          
          if (pagesToCopy.length > 0) {
            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
            copiedPages.forEach((page) => newPdf.addPage(page));
            
            const pdfBytes = await newPdf.save();
            const fileName = `${file.name.replace('.pdf', '')}_pages_${start + 1}-${Math.min(pageCount, end + 1)}_${timestamp}.pdf`;
            const storagePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('pdf-converted')
              .upload(storagePath, pdfBytes, {
                contentType: 'application/pdf',
                cacheControl: '3600'
              });

            if (!uploadError) {
              splitFiles.push({
                filename: fileName,
                storagePath: storagePath,
                size: pdfBytes.length,
                pageRange: `${start + 1}-${Math.min(pageCount, end + 1)}`
              });
            }
          }
        } else {
          // Single page
          const pageIndex = parseInt(range) - 1;
          if (pageIndex >= 0 && pageIndex < pageCount) {
            const copiedPages = await newPdf.copyPages(pdfDoc, [pageIndex]);
            newPdf.addPage(copiedPages[0]);
            
            const pdfBytes = await newPdf.save();
            const fileName = `${file.name.replace('.pdf', '')}_page_${pageIndex + 1}_${timestamp}.pdf`;
            const storagePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('pdf-converted')
              .upload(storagePath, pdfBytes, {
                contentType: 'application/pdf',
                cacheControl: '3600'
              });

            if (!uploadError) {
              splitFiles.push({
                filename: fileName,
                storagePath: storagePath,
                size: pdfBytes.length,
                pageRange: `${pageIndex + 1}`
              });
            }
          }
        }
      }
    }

    if (splitFiles.length === 0) {
      throw new Error('Failed to split PDF');
    }

    // Create conversion record
    const conversionData = {
      user_id: user.id,
      original_filename: file.name,
      converted_filename: `${file.name.replace('.pdf', '')}_split_${timestamp}.zip`,
      conversion_type: 'split-pdf',
      status: 'completed',
      completed_at: new Date().toISOString(),
      file_size: file.size,
      storage_path: JSON.stringify(splitFiles)
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

    console.log('PDF split completed successfully');

    return new Response(JSON.stringify({
      success: true,
      conversion: conversion,
      files: splitFiles,
      message: `Successfully split PDF into ${splitFiles.length} files`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in split-pdf function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});