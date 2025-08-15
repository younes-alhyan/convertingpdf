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
  Combine,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface SelectedFile {
  file: File;
  id: string;
}

const MergePDF = () => {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Filter only PDF files
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Only PDF files are allowed",
        variant: "destructive"
      });
    }

    const newFiles: SelectedFile[] = pdfFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    // Reset the input
    event.target.value = '';
  }, []);

  const removeFile = useCallback((id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  const mergePDFs = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this tool",
        variant: "destructive"
      });
      return;
    }

    if (selectedFiles.length < 2) {
      toast({
        title: "More Files Needed",
        description: "Select at least 2 PDF files to merge",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      // Prepare form data
      const formData = new FormData();
      selectedFiles.forEach(({ file }) => {
        formData.append('files', file);
      });

      setProgress(30);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }

      setProgress(50);

      // Call the merge function
      const { data, error } = await supabase.functions.invoke('merge-pdf', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      setProgress(80);

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Failed to merge PDFs');
      }

      if (!data.success) {
        throw new Error(data.error || 'Merge operation failed');
      }

      setProgress(100);
      setResult(data);

      toast({
        title: "Success!",
        description: "PDFs have been merged successfully",
      });

      // Clear files after successful merge
      setSelectedFiles([]);

    } catch (error: any) {
      console.error('Merge error:', error);
      toast({
        title: "Merge Failed",
        description: error.message || "Failed to merge PDFs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadFile = async () => {
    if (!result?.conversion?.id || !user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }

      const response = await fetch(
        `https://qhmllrbocnungavzdswn.supabase.co/functions/v1/download-file/${result.conversion.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Edge Function returned a non-2xx status code: ${response.status}`);
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.conversion.converted_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Downloaded",
        description: "Your merged PDF has been downloaded",
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
            <Combine className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Merge PDF Files</CardTitle>
          <CardDescription>
            Combine multiple PDF files into a single document. Upload your files and merge them in seconds.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select PDF Files</CardTitle>
          <CardDescription>
            Choose 2 or more PDF files to merge. Files will be combined in the order they are added.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <span className="text-lg font-medium text-foreground">
                    Drop PDF files here or click to browse
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Only PDF files are supported
                  </p>
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <Button variant="outline" onClick={() => document.getElementById('pdf-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Select Files
              </Button>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                <Badge variant="secondary">
                  {selectedFiles.length >= 2 ? 'Ready to merge' : 'Need more files'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {selectedFiles.map(({ file, id }, index) => (
                  <div key={id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(id)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Merge Button */}
          <div className="pt-4">
            <Button 
              onClick={mergePDFs}
              disabled={selectedFiles.length < 2 || isProcessing || !user}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Merging PDFs...
                </>
              ) : (
                <>
                  <Combine className="h-4 w-4 mr-2" />
                  Merge {selectedFiles.length} PDFs
                </>
              )}
            </Button>
            
            {!user && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please sign in to use this tool
              </p>
            )}
          </div>

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

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Merge Completed</span>
            </CardTitle>
            <CardDescription>
              Your PDFs have been successfully merged into a single document.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-success" />
                <div>
                  <p className="font-medium">{result.conversion.converted_filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {(result.conversion.file_size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <Button onClick={downloadFile}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
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
                <li>• Files are merged in the order they appear in the list</li>
                <li>• Your files are processed securely and automatically deleted after download</li>
                <li>• Maximum file size: 10MB per file for free accounts</li>
                <li>• Supported format: PDF files only</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MergePDF;