import { useState, useCallback } from 'react';
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
  Scissors,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';

interface SplitFile {
  filename: string;
  storagePath: string;
  size: number;
  pageRange: string;
}

interface ConversionResult {
  success: boolean;
  conversion: any;
  files: SplitFile[];
  message: string;
}

const SplitPDF = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [splitType, setSplitType] = useState("pages");
  const [splitValue, setSplitValue] = useState("1");

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setResult(null);
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
  }, []);

  const splitPDF = async () => {
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

    if (!splitValue.trim()) {
      toast({
        title: "Split Configuration Required",
        description: "Please specify how to split the PDF",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setResult(null);

    try {
      console.log('Starting PDF split...');
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('splitType', splitType);
      formData.append('splitValue', splitValue);

      setProgress(30);

      // Call the split function
      const { data, error } = await supabase.functions.invoke('split-pdf', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      setProgress(80);

      if (error) {
        throw new Error(error.message || 'Split failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Split failed');
      }

      setResult(data);
      setProgress(100);

      toast({
        title: "Success!",
        description: data.message,
      });

    } catch (error: any) {
      console.error('Split error:', error);
      toast({
        title: "Split Failed",
        description: error.message || "Failed to split PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadFile = async (file: SplitFile) => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }

      const response = await fetch(
        `https://qhmllrbocnungavzdswn.supabase.co/functions/v1/download-file/${result?.conversion?.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Downloaded",
        description: `${file.filename} has been downloaded`,
      });

    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download file",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">PDF Splitter</CardTitle>
          <CardDescription>
            Split PDF files into smaller documents. Extract specific pages or divide into equal parts.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select PDF File</CardTitle>
          <CardDescription>
            Choose a PDF file to split into smaller documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Split Settings */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Split Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="split-type">Split Method</Label>
                <Select value={splitType} onValueChange={setSplitType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select split method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pages">Split by Pages per File</SelectItem>
                    <SelectItem value="ranges">Split by Page Ranges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="split-value">
                  {splitType === 'pages' ? 'Pages per File' : 'Page Ranges'}
                </Label>
                <Input
                  id="split-value"
                  placeholder={
                    splitType === 'pages' 
                      ? "e.g., 2 (2 pages per file)" 
                      : "e.g., 1-3,5-7,9 (specific ranges)"
                  }
                  value={splitValue}
                  onChange={(e) => setSplitValue(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  {splitType === 'pages' 
                    ? "Number of pages each split file should contain"
                    : "Comma-separated page ranges (e.g., 1-3,5-7,9)"
                  }
                </p>
              </div>
            </div>

            <Button 
              onClick={splitPDF}
              disabled={!selectedFile || isProcessing || !user || !splitValue.trim()}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Splitting PDF...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4 mr-2" />
                  Split PDF
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
                  <span>Splitting PDF...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Split Completed</span>
            </CardTitle>
            <CardDescription>
              {result.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {result.files.length} file(s) created
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.files.map((file, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        Pages: {file.pageRange} • {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => downloadFile(file)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
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
              <p className="text-sm font-medium">Split Options:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Pages per File:</strong> Split into files with equal number of pages</li>
                <li>• <strong>Page Ranges:</strong> Extract specific page ranges (e.g., 1-3,5-7,9)</li>
                <li>• Files are processed securely on our servers</li>
                <li>• Maximum file size: 50MB for optimal performance</li>
                <li>• Output format: Individual PDF files</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SplitPDF;