import { useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  Edit3,
  Type,
  Image as ImageIcon,
  Square,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Result {
  conversion_id: string;
  converted_filename: string;
  converted_file_size: number;
  downloadUrl: string;
  status: string;
  message: string;
}

const EditPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [editType, setEditType] = useState<string>("");
  const [textContent, setTextContent] = useState("");
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      if (selectedFile.size > 50 * 1024 * 1024) {
        // 50MB limit
        toast({
          title: "File too large",
          description: "Please select a PDF file smaller than 50MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      if (droppedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a PDF file smaller than 50MB",
          variant: "destructive",
        });
        return;
      }
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const editPDF = async () => {
    if (!file || !editType) {
      toast({
        title: "Missing information",
        description: "Please select a file and edit type",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("editType", editType);
      if (editType === "add-image") {
        if (!imageFile) {
          toast({
            title: "No image selected",
            description: "Please select an image to add",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        formData.append("imageFile", imageFile);
      }
      // Prepare edit data based on type
      let editData = {};
      if (editType === "add-text") {
        editData = { content: textContent, x: position.x, y: position.y };
      } else if (editType === "add-signature") {
        editData = { content: textContent, x: position.x, y: position.y };
      } else if (editType === "add-annotation") {
        editData = { content: textContent, x: position.x, y: position.y };
      } else {
        editData = { x: position.x, y: position.y };
      }

      formData.append("editData", JSON.stringify(editData));

      const response = await fetch("https://convertingpdf.onrender.com/edit", {
        method: "POST",
        body: formData,
      });
      // TODO
      
      setProgress(70);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Compression failed");
      }

      const data = await response.json();

      setResult(data);
      setProgress(100);
      toast({
        title: "PDF edited successfully!",
        description: `Your edited PDF is ready for download`,
      });
    } catch (error) {
      console.error("Edit error:", error);
      toast({
        title: "Edit failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while editing the PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadFile = async () => {
    if (!result || !result.downloadUrl) return;
    // Fetch the file as a blob
    toast({
      title: "Preparing download...",
      description: "Please wait while your PDF is being processed.",
    });
    const response = await fetch(result.downloadUrl);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = result.converted_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const resetTool = () => {
    setFile(null);
    setResult(null);
    setEditType("");
    setTextContent("");
    setPosition({ x: 100, y: 100 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl shadow-soft">
            <Edit3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Edit PDF</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Add text, annotations, signatures, and other elements to your PDF
          documents
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload Section */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload PDF</span>
            </CardTitle>
            <CardDescription>
              Select a PDF file to edit (max 50MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF files only, up to 50MB
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {file && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Selected: {file.name} ({formatFileSize(file.size)})
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Edit Options */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5" />
              <span>Edit Options</span>
            </CardTitle>
            <CardDescription>
              Choose what you want to add to your PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Edit Type</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select edit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add-text">
                    <div className="flex items-center space-x-2">
                      <Type className="h-4 w-4" />
                      <span>Add Text</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="add-signature">
                    <div className="flex items-center space-x-2">
                      <Edit3 className="h-4 w-4" />
                      <span>Add Signature</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="add-annotation">
                    <div className="flex items-center space-x-2">
                      <Square className="h-4 w-4" />
                      <span>Add Annotation</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="add-image">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>Add Image</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editType &&
              ["add-text", "add-signature", "add-annotation"].includes(
                editType
              ) && (
                <div className="space-y-2">
                  <Label htmlFor="text-content">
                    {editType === "add-text"
                      ? "Text Content"
                      : editType === "add-signature"
                      ? "Signature Text"
                      : "Annotation"}
                  </Label>
                  <Textarea
                    id="text-content"
                    placeholder={`Enter ${
                      editType === "add-text"
                        ? "text"
                        : editType === "add-signature"
                        ? "signature"
                        : "annotation"
                    } content...`}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            {editType === "add-image" && (
              <div className="space-y-2">
                <Label htmlFor="image-upload">Select Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                {imageFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {imageFile.name} ({formatFileSize(imageFile.size)}
                    )
                  </p>
                )}
              </div>
            )}

            {editType && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position-x">X Position</Label>
                  <Input
                    id="position-x"
                    type="number"
                    value={position.x}
                    onChange={(e) =>
                      setPosition({
                        ...position,
                        x: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position-y">Y Position</Label>
                  <Input
                    id="position-y"
                    type="number"
                    value={position.y}
                    onChange={(e) =>
                      setPosition({
                        ...position,
                        y: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="100"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={editPDF}
              disabled={!file || !editType || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Editing PDF...
                </>
              ) : (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isProcessing && (
        <Card className="shadow-medium">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Editing PDF...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>PDF Edited Successfully!</span>
            </CardTitle>
            <CardDescription>
              Your PDF has been edited and is ready for download
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{result.converted_filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(result.converted_file_size)} • {editType}
                  </p>
                </div>
              </div>
              <Button onClick={downloadFile}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button onClick={resetTool} variant="outline" className="flex-1">
                Edit Another PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EditPDF;
