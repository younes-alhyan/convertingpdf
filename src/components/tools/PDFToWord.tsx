import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  AlertCircle,
  CheckCircle,
  Loader2,
  FileEdit,
  Info
} from 'lucide-react';

interface ConversionResult {
  conversion_id: string;
  filename: string;
  originalPages: number;
  message: string;
}

const PDFToWord = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Check if it's a PDF
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Only PDF files are allowed",
        variant: "destructive"
      });
      return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 50MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);
    
    // Reset the input
    event.target.value = '';
  }, []);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
  }, []);

  const convertToWord = async () => {
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
        title: "No File Selected",
        description: "Please select a PDF file to convert",
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

      setProgress(30);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }

      setProgress(50);

      // Call the conversion function
      const { data, error } = await supabase.functions.invoke('pdf-to-word', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      setProgress(80);

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to convert PDF to Word');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Conversion failed');
      }

      setProgress(100);
      setResult(data);

      toast({
        title: "Conversion Complete",
        description: `PDF converted to Word with ${data.originalPages} pages`,
      });

    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadFile = async (conversionId: string, filename: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }

      const { data, error } = await supabase.functions.invoke('download-file', {
        body: { conversion_id: conversionId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error || !data?.download_url) {
        throw new Error('Failed to get download URL');
      }

      // Create download link
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your Word document is downloading",
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <FileEdit className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          PDF to Word Converter
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Convert your PDF documents to editable Word files. Extract text and maintain document structure for easy editing.
        </p>
      </div>

      {/* File Upload */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-primary" />
            <span>Upload PDF File</span>
          </CardTitle>
          <CardDescription>
            Select a PDF file to convert to Word format (Maximum 50MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your PDF file here</p>
                <p className="text-muted-foreground">or click to browse files</p>
              </div>
              <Input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="mt-4 cursor-pointer"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/20">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Button 
                onClick={convertToWord}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting to Word...
                  </>
                ) : (
                  <>
                    <FileEdit className="mr-2 h-4 w-4" />
                    Convert to Word
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Converting...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span>Conversion Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-4 rounded-lg bg-success/10">
              <p className="text-sm text-muted-foreground">Pages Converted</p>
              <p className="text-2xl font-semibold text-success">{result.originalPages}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                <div className="flex items-center space-x-3">
                  <FileEdit className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{result.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      Word Document (RTF format)
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => downloadFile(result.conversion_id, result.filename)}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              </div>
            </div>

            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <p className="text-success font-medium">{result.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="bg-muted/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-primary" />
            <span>About PDF to Word Conversion</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Extracts text from PDF documents</li>
                <li>• Preserves document structure</li>
                <li>• Creates editable Word files</li>
                <li>• Supports RTF format for compatibility</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Best practices</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Works best with text-based PDFs</li>
                <li>• Scanned documents may need OCR</li>
                <li>• Review formatting after conversion</li>
                <li>• Save original files as backup</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFToWord;