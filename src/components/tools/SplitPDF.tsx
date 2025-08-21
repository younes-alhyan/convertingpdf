import JSZip from "jszip";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  X,
  Download,
  Scissors,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
} from "lucide-react";

interface SplitFile {
  filename: string;
  size: number;
  pageRange: string;
  url: string;
}

interface Result {
  conversion_id: string;
  converted_filename: string;
  converted_file_size: number;
  downloadUrl: string;
  status: string;
  message: string;
}

const SplitPDF = () => {
  const { user, session } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [splitFiles, setsplitFiles] = useState<SplitFile[]>([]);
  const [splitType, setSplitType] = useState("pages");
  const [splitValue, setSplitValue] = useState("1");

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file && file.type === "application/pdf") {
        setSelectedFile(file);
        setResult(null);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a PDF file",
          variant: "destructive",
        });
      }

      event.target.value = "";
    },
    []
  );

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
  }, []);

  const splitPDF = async () => {
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
        title: "File Required",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    if (!splitValue.trim()) {
      toast({
        title: "Split Configuration Required",
        description: "Please specify how to split the PDF",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setResult(null);

    try {
      const token = session?.token;

      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use this tool",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("splitType", splitType);
      formData.append("splitValue", splitValue);

      setProgress(30);

      const response = await fetch("https://convertingpdf.onrender.com/split-pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-ID": user.id,
        },
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Split failed");
      }

      const data = await response.json();

      setResult(data);

      const zipFile = await fetch(data.downloadUrl);

      if (!zipFile.ok) {
        const errText = await zipFile.text();
        console.error("Download failed:", errText);
        throw new Error(`Failed to fetch zip: ${zipFile.status}`);
      }

      const arrayBuffer = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const files: SplitFile[] = [];
      const ranges = splitType === "ranges" ? splitValue.split(",") : [];
      let pageIndex = 0;
      const filenames = Object.keys(zip.files).sort((a, b) => {
        // Extract the number from "pages_X_to_Y.pdf"
        const numA = parseInt(
          a.match(/pages_(\d+)_to_\d+\.pdf/)?.[1] || "0",
          10
        );
        const numB = parseInt(
          b.match(/pages_(\d+)_to_\d+\.pdf/)?.[1] || "0",
          10
        );
        return numA - numB;
      });

      for (const filename of filenames) {
        const fileBlob = await zip.files[filename].async("blob");
        let pageRange = "";

        if (splitType === "pages") {
          const start = pageIndex + 1;
          const end = start + parseInt(splitValue, 10) - 1;
          pageRange = `${start}-${end}`;
          pageIndex += parseInt(splitValue, 10);
        } else if (splitType === "ranges") {
          pageRange = ranges.shift() || "";
        }

        const url = URL.createObjectURL(fileBlob);

        files.push({
          filename,
          size: fileBlob.size,
          url,
          pageRange,
        });
      }
      setsplitFiles(files);
      setProgress(100);

      toast({
        title: "Split Complete",
        description: "Your PDF was split successfully",
      });
    } catch (error) {
      console.error("Split error:", error);
      toast({
        title: "Split Failed",
        description: error.message || "Failed to split PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadFile = (file: SplitFile) => {
    toast({
          title: "Preparing download...",
          description: "Please wait while your PDF is being processed.",
          variant: "destructive",
        });
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
            Split PDF files into smaller documents. Extract specific pages or
            divide into equal parts.
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
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                >
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
                    <SelectItem value="pages">
                      Split by Pages per File
                    </SelectItem>
                    <SelectItem value="ranges">Split by Page Ranges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="split-value">
                  {splitType === "pages" ? "Pages per File" : "Page Ranges"}
                </Label>
                <Input
                  id="split-value"
                  placeholder={
                    splitType === "pages"
                      ? "e.g., 2 (2 pages per file)"
                      : "e.g., 1-3,5-7,9 (specific ranges)"
                  }
                  value={splitValue}
                  onChange={(e) => setSplitValue(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  {splitType === "pages"
                    ? "Number of pages each split file should contain"
                    : "Comma-separated page ranges (e.g., 1-3,5-7,9)"}
                </p>
              </div>
            </div>

            <Button
              onClick={splitPDF}
              disabled={
                !selectedFile || isProcessing || !session || !splitValue.trim()
              }
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

            {!session && (
              <p className="text-sm text-muted-foreground text-center">
                Please sign in to use this tool
              </p>
            )}

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
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {splitFiles.length} file(s) created
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {splitFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.filename}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pages: {file.pageRange} •{" "}
                        {(file.size / 1024).toFixed(1)} KB
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
                <li>
                  • <strong>Pages per File:</strong> Split into files with equal
                  number of pages
                </li>
                <li>
                  • <strong>Page Ranges:</strong> Extract specific page ranges
                  (e.g., 1-3,5-7,9)
                </li>
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
