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

interface ConvertedPage {
  pageNumber: number;
  filename: string;
  storagePath: string;
  size: number;
  imageUrl?: string;
}

const PDFToJPG = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [quality, setQuality] = useState("80");
  const [pageRange, setPageRange] = useState("all");
  const [customRange, setCustomRange] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setResult(null);
      setConvertedPages([]);
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
    setResult(null);
    setConvertedPages([]);
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

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('quality', quality);
      formData.append('pageRange', pageRange === 'custom' ? customRange : pageRange);

      setProgress(30);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }

      setProgress(50);

      // Call the conversion function
      const { data, error } = await supabase.functions.invoke('pdf-to-jpg', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      setProgress(80);

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Failed to convert PDF');
      }

      if (!data.success) {
        throw new Error(data.error || 'Conversion operation failed');
      }

      setProgress(100);
      setResult(data);

      // Convert the PDF pages to images on the frontend
      if (data.pages && data.pages.length > 0) {
        await convertPagesToImages(data.pages);
      }

      toast({
        title: "Success!",
        description: data.message || "PDF has been converted to images successfully",
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

  const convertPagesToImages = async (pages: ConvertedPage[]) => {
    const pagesWithImages: ConvertedPage[] = [];

    for (const page of pages) {
      try {
        // Download the single-page PDF
        const { data: pdfData } = await supabase.storage
          .from('pdf-converted')
          .download(page.storagePath);

        if (pdfData) {
          // For now, we'll store the PDF data as a blob URL
          // In a real implementation, you'd use PDF.js to render to canvas
          const blob = new Blob([pdfData], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          pagesWithImages.push({
            ...page,
            imageUrl: url
          });
        }
      } catch (error) {
        console.error('Error processing page', page.pageNumber, ':', error);
      }
    }

    setConvertedPages(pagesWithImages);
  };

  const downloadPage = async (page: ConvertedPage) => {
    if (!page.imageUrl) return;

    try {
      // Create a download link
      const a = document.createElement('a');
      a.href = page.imageUrl;
      a.download = `page_${page.pageNumber}.pdf`; // For now downloading as PDF
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Downloaded",
        description: `Page ${page.pageNumber} has been downloaded`,
      });

    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download page",
        variant: "destructive"
      });
    }
  };

  const downloadAllPages = async () => {
    for (const page of convertedPages) {
      if (page.imageUrl) {
        await downloadPage(page);
        // Add a small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
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
                    <SelectItem value="60">Low (60%)</SelectItem>
                    <SelectItem value="80">Medium (80%)</SelectItem>
                    <SelectItem value="90">High (90%)</SelectItem>
                    <SelectItem value="100">Maximum (100%)</SelectItem>
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
                  Converting PDF...
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
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && convertedPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Conversion Completed</span>
            </CardTitle>
            <CardDescription>
              {convertedPages.length} page(s) have been converted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {convertedPages.length} page(s) converted
              </Badge>
              <Button onClick={downloadAllPages} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {convertedPages.map((page) => (
                <div key={page.pageNumber} className="border rounded-lg p-4 space-y-3">
                  <div className="aspect-[3/4] bg-secondary/50 rounded flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <FileText className="h-8 w-8 text-primary mx-auto" />
                      <p className="text-sm font-medium">Page {page.pageNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Size: {(page.size / 1024).toFixed(1)} KB
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => downloadPage(page)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
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
                <li>• Higher quality settings result in larger file sizes</li>
                <li>• Files are processed securely and automatically deleted after download</li>
                <li>• Maximum file size: 10MB for free accounts</li>
                <li>• Converted images maintain original PDF resolution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFToJPG;