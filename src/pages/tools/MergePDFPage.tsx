import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MergePDF from "@/components/tools/MergePDF";

const MergePDFPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </a>
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="font-semibold text-lg">Merge PDF</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-8">
        <MergePDF />
      </div>
    </div>
  );
};

export default MergePDFPage;
