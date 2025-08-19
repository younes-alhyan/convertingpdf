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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  X,
  Download,
  Image,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import JSZip from "jszip";

interface ImageInterface {
  filename: string;
  blob: Blob;
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

const PDFToJPGServer = () => {
  const { user, session } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<ImageInterface[]>([]);
  const [result, setResult] = useState<Result | null>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type === "application/pdf") {
        setSelectedFile(file);
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
  }, []);

  const convertPDFServerSide = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in",
        variant: "destructive",
      });
      return;
    }
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      const token = session?.token;

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("https://convertingpdf.onrender.com/pdf-to-jpg", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-ID": user.id,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Conversion failed");

      const data = await response.json();
      setResult(data);
      setProgress(70);

      const zipFile = await fetch(data.downloadUrl);
      const zipBlob = await zipFile.blob();
      // Parse ZIP
      const zip = await JSZip.loadAsync(zipBlob);
      const images: ImageInterface[] = [];
      for (const filename of Object.keys(zip.files)) {
        const blob = await zip.files[filename].async("blob");
        images.push({ filename, blob, url: URL.createObjectURL(blob) });
      }

      setConvertedImages(images);
      setProgress(100);
      toast({
        title: "Success!",
        description: "PDF converted to JPG successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Conversion Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadImage = (image: ImageInterface) => {
    const a = document.createElement("a");
    a.href = image.url;
    a.download = image.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Downloaded", description: `${image.filename} downloaded` });
  };

  const downloadAll = async () => {
    if (!result.downloadUrl) return;

    try {
      const response = await fetch(result.downloadUrl);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = result.converted_filename; // your desired filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
      toast({
        title: "Downloaded",
        description: `${result.converted_filename} downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">PDF to JPG Converter</CardTitle>
          <CardDescription>
            Converts PDF pages to JPG using server-side processing
          </CardDescription>
        </CardHeader>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Select PDF File</CardTitle>
          <CardDescription>Choose a PDF file to convert</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
              <label htmlFor="pdf-upload" className="cursor-pointer block mt-4">
                <span className="text-lg font-medium text-foreground">
                  Click to select PDF
                </span>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
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

      {/* Convert Button */}
      {selectedFile && (
        <Button
          onClick={convertPDFServerSide}
          className="w-full"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            <>Convert to JPG</>
          )}
        </Button>
      )}

      {/* Progress */}
      {isProcessing && <Progress value={progress} className="w-full mt-2" />}

      {/* Results */}
      {convertedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Conversion Completed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {convertedImages.length} JPG(s) created
              </Badge>
              <Button onClick={downloadAll} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {convertedImages.map((img, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full object-contain h-48"
                  />
                  <p className="text-sm truncate">{img.filename}</p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => downloadImage(img)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download JPG
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardContent>
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Notes:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Conversion is done on the server, returning a ZIP with JPGs
                </li>
                <li>• You can download individual JPGs or the full ZIP</li>
                <li>• Maximum PDF size depends on server limits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFToJPGServer;
