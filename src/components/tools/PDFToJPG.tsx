import { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  X, 
  Download, 
  Image,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ConvertedImage {
  pageNumber: number;
  imageUrl: string;
  blob: Blob;
  filename: string;
}

const PDFToJPG = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [quality, setQuality] = useState("0.8");
  const [pageRange, setPageRange] = useState("all");
  const [customRange, setCustomRange] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setConvertedImages([]);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file",
        variant: "destructive"
      });
    }

    // Reset the input
    event.target.value = '';
  }, []);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setConvertedImages([]);
  }, []);

  const convertPDFToJPG = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this tool",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a PDF file first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setConvertedImages([]);

    try {
      console.log('Starting PDF to JPG conversion...');
      
      // Load the PDF
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;

      console.log(`PDF has ${pageCount} pages`);
      setProgress(20);

      // Determine which pages to convert
      let pagesToConvert: number[] = [];
      if (pageRange === 'all') {
        pagesToConvert = Array.from({ length: pageCount }, (_, i) => i + 1);
      } else if (pageRange.includes('-')) {
        const [start, end] = pageRange.split('-').map(n => parseInt(n.trim()));
        for (let i = Math.max(1, start); i <= Math.min(pageCount, end); i++) {
          pagesToConvert.push(i);
        }
      } else {
        const pageNum = parseInt(pageRange);
        if (pageNum >= 1 && pageNum <= pageCount) {
          pagesToConvert = [pageNum];
        }
      }

      if (pagesToConvert.length === 0) {
        throw new Error('No valid pages to convert');
      }

      console.log(`Converting pages: ${pagesToConvert.join(', ')}`);

      const images: ConvertedImage[] = [];
      const qualityValue = parseFloat(quality);

      // Convert each page to JPG
      for (let i = 0; i < pagesToConvert.length; i++) {
        const pageNum = pagesToConvert[i];
        console.log(`Converting page ${pageNum}...`);

        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality

          // Create canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Could not get canvas context');
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render page to canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          };

          await page.render(renderContext).promise;

          // Convert canvas to JPG blob
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create blob'));
                }
              },
              'image/jpeg',
              qualityValue
            );
          });

          const imageUrl = URL.createObjectURL(blob);
          const filename = `${selectedFile.name.replace('.pdf', '')}_page_${pageNum}.jpg`;

          images.push({
            pageNumber: pageNum,
            imageUrl,
            blob,
            filename
          });

          // Update progress
          const progressValue = 20 + (70 * (i + 1)) / pagesToConvert.length;
          setProgress(progressValue);

        } catch (pageError) {
          console.error(`Error converting page ${pageNum}:`, pageError);
          toast({
            title: "Page Conversion Error",
            description: `Failed to convert page ${pageNum}`,
            variant: "destructive"
          });
        }
      }

      if (images.length === 0) {
        throw new Error('Failed to convert any pages');
      }

      setConvertedImages(images);
      setProgress(100);

      // Save conversion record to database
      try {
        const conversionData = {
          user_id: user.id,
          original_filename: selectedFile.name,
          converted_filename: `${selectedFile.name.replace('.pdf', '')}_images.zip`,
          conversion_type: 'pdf-to-jpg',
          status: 'completed',
          completed_at: new Date().toISOString(),
          file_size: selectedFile.size,
          storage_path: `local_conversion_${Date.now()}` // Mark as local conversion
        };

        await supabase
          .from('pdf_conversions')
          .insert(conversionData);

      } catch (dbError) {
        console.error('Database error:', dbError);
        // Don't fail the conversion if DB save fails
      }

      toast({
        title: "Success!",
        description: `Successfully converted ${images.length} page(s) to JPG`,
      });

    } catch (error: any) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadImage = (image: ConvertedImage) => {
    try {
      const a = document.createElement('a');
      a.href = image.imageUrl;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Downloaded",
        description: `${image.filename} has been downloaded`,
      });

    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download image",
        variant: "destructive"
      });
    }
  };

  const downloadAllImages = async () => {
    for (const image of convertedImages) {
      downloadImage(image);
      // Add a small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">PDF to JPG Converter</CardTitle>
          <CardDescription>
            Convert PDF pages to high-quality JPG images. Extract individual pages or convert entire documents.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select PDF File</CardTitle>
          <CardDescription>
            Choose a PDF file to convert to JPG images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-foreground">
                      Drop your PDF here or click to browse
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Only PDF files are supported
                    </p>
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <Button variant="outline" onClick={() => document.getElementById('pdf-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Select PDF File
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Conversion Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quality">Image Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.6">Low (60%)</SelectItem>
                    <SelectItem value="0.8">Medium (80%)</SelectItem>
                    <SelectItem value="0.9">High (90%)</SelectItem>
                    <SelectItem value="1.0">Maximum (100%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pages">Pages to Convert</Label>
                <Select value={pageRange} onValueChange={setPageRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    <SelectItem value="1">First Page Only</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {pageRange === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-range">Custom Page Range</Label>
                <Input
                  id="custom-range"
                  placeholder="e.g., 1-5 or 3"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter page numbers (e.g., "1-5" for pages 1 to 5, or "3" for page 3 only)
                </p>
              </div>
            )}

            <Button 
              onClick={convertPDFToJPG}
              disabled={!selectedFile || isProcessing || !user}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Converting to JPG...
                </>
              ) : (
                <>
                  <Image className="h-4 w-4 mr-2" />
                  Convert to JPG
                </>
              )}
            </Button>

            {!user && (
              <p className="text-sm text-muted-foreground text-center">
                Please sign in to use this tool
              </p>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Converting to JPG...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {convertedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Conversion Completed</span>
            </CardTitle>
            <CardDescription>
              {convertedImages.length} page(s) have been converted to JPG images successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {convertedImages.length} JPG image(s) created
              </Badge>
              <Button onClick={downloadAllImages} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download All JPGs
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {convertedImages.map((image) => (
                <div key={image.pageNumber} className="border rounded-lg p-4 space-y-3">
                  <div className="aspect-[3/4] bg-secondary/50 rounded overflow-hidden">
                    <img 
                      src={image.imageUrl} 
                      alt={`Page ${image.pageNumber}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Page {image.pageNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {image.filename}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => downloadImage(image)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download JPG
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Important Notes:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Images are converted directly in your browser for privacy</li>
                <li>• Higher quality settings result in larger file sizes</li>
                <li>• Files are processed locally and not uploaded to servers</li>
                <li>• Maximum file size: 50MB for optimal performance</li>
                <li>• Output format: High-quality JPG images</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFToJPG;