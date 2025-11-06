import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PDFToWord from "@/components/tools/PDFToWord";

const PDFToWordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="./">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </a>
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="font-semibold text-lg">PDF to Word</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-8">
        <PDFToWord />
      </div>
    </div>
  );
};

export default PDFToWordPage;
