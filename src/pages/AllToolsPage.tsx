import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Combine,
  Scissors,
  Minimize2,
  FileText,
  Image,
  Edit3,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";

const tools = [
  {
    icon: Combine,
    title: "Merge PDF",
    description:
      "Combine multiple PDF files into a single document easily and quickly.",
    color: "text-primary",
    status: "available",
    route: "/tools/merge",
  },
  {
    icon: Scissors,
    title: "Split PDF",
    description:
      "Separate pages from your PDF or split one file into multiple documents.",
    color: "text-accent",
    status: "available",
    route: "/tools/split",
  },
  {
    icon: Minimize2,
    title: "Compress PDF",
    description:
      "Reduce file size while maintaining quality for easier sharing and storage.",
    color: "text-warning",
    status: "available",
    route: "/tools/compress",
  },
  {
    icon: FileText,
    title: "PDF to Word",
    description:
      "Convert PDF documents to editable Word files with precision formatting.",
    color: "text-primary",
    status: "available",
    route: "/tools/pdf-to-word",
  },
  {
    icon: Image,
    title: "PDF to JPG",
    description:
      "Extract images from PDF or convert PDF pages to high-quality images.",
    color: "text-accent",
    status: "available",
    route: "/tools/pdf-to-jpg",
  },
  {
    icon: Edit3,
    title: "Edit PDF",
    description:
      "Add text, images, signatures, and annotations to your PDF documents.",
    color: "text-success",
    status: "available",
    route: "/tools/edit",
  },
];

const AllToolsPage = () => {
  const handleToolClick = (tool: (typeof tools)[0]) => {
    if (tool.status !== "available") return;
    window.location.href = tool.route;
  };

  const availableTools = tools.filter((tool) => tool.status === "available");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-24">
        <div className="container px-4">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              All PDF Tools
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete suite of professional PDF tools to handle all your
              document needs. Convert, edit, merge, split, and optimize your
              PDFs with ease.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>{availableTools.length} Tools Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-warning" />
                <span>More Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Available Tools */}
          <section className="mb-16">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                Available Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {availableTools.map((tool, index) => (
                  <Card
                    key={tool.title}
                    className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50 cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleToolClick(tool)}
                  >
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div
                          className={`p-3 rounded-lg bg-secondary ${tool.color} transition-colors group-hover:scale-110 duration-300`}
                        >
                          <tool.icon className="h-6 w-6" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className="bg-success/10 text-success border-success/20"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {tool.description}
                      </CardDescription>
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        Use Tool
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="mb-16">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-medium bg-gradient-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">
                    Why Choose Our PDF Tools?
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Professional-grade features designed for efficiency and
                    reliability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">High Quality</h3>
                      <p className="text-sm text-muted-foreground">
                        Maintain document quality with professional-grade
                        processing
                      </p>
                    </div>
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">Fast Processing</h3>
                      <p className="text-sm text-muted-foreground">
                        Quick conversion and processing with real-time progress
                      </p>
                    </div>
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                        <Edit3 className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">Easy to Use</h3>
                      <p className="text-sm text-muted-foreground">
                        Intuitive interface designed for both beginners and
                        professionals
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose any tool above to begin working with your PDF documents.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllToolsPage;
