import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  X,
  Download,
  CheckCircle,
  Loader2,
  FileEdit,
  Info,
} from "lucide-react";

interface Result {
  conversion_id: string;
  converted_filename: string;
  converted_file_size: number;
  downloadUrl: string;
  status: string;
  message: string;
}

const PDFToWord = () => {
  const { user,session } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File",
          description: "Only PDF files are allowed",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 50MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      event.target.value = "";
    },
    []
  );

  const removeFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const convertToWord = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this tool",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to convert",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      // Get JWT
      const token = session?.token;
      if (!token) throw new Error("No valid session");

      const formData = new FormData();
      formData.append("file", selectedFile);

      setProgress(40);

      const response = await fetch("/api/pdf-to-word", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-ID":user.id
        },
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      // Expecting a Word file (.docx) as a blob
      const data = await response.json();
      setResult(data);

      setProgress(100);
      toast({
        title: "Conversion Complete",
        description: `Your PDF has been converted to Word.`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  const downloadFile = () => {
    if (!result) return;

    const link = document.createElement("a");
    link.href = result.downloadUrl;
    link.download = result.converted_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: "Your Word document is downloading",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
          Convert your PDF documents to editable Word files. Extract text and
          maintain document structure for easy editing.
        </p>
      </div>

      {/* File Upload */}
      <Card>
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
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Drop your PDF file here</p>
              <p className="text-muted-foreground">or click to browse files</p>
              <Input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="mt-4 cursor-pointer"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
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
                    Converting...
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span>Conversion Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileEdit className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{result.converted_filename}</p>
                  <p className="text-sm text-muted-foreground">Word Document</p>
                </div>
              </div>
              <Button onClick={downloadFile} className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-primary" />
            <span>About PDF to Word Conversion</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Works best with text-based PDFs. Scanned documents may need OCR.
            Save original files as backup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFToWord;
