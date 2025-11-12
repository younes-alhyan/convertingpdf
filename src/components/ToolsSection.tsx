import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combine,
  Scissors,
  Minimize2,
  FileText,
  Image,
  Edit3,
  ArrowRight,
} from "lucide-react";

const tools = [
  {
    icon: Combine,
    title: "Merge PDF",
    description:
      "Combine multiple PDF files into a single document easily and quickly.",
    color: "text-primary",
  },
  {
    icon: Scissors,
    title: "Split PDF",
    description:
      "Separate pages from your PDF or split one file into multiple documents.",
    color: "text-accent",
  },
  {
    icon: Minimize2,
    title: "Compress PDF",
    description:
      "Reduce file size while maintaining quality for easier sharing and storage.",
    color: "text-warning",
  },
  {
    icon: FileText,
    title: "PDF to Word",
    description:
      "Convert PDF documents to editable Word files with precision formatting.",
    color: "text-primary",
  },
  {
    icon: Image,
    title: "PDF to JPG",
    description:
      "Extract images from PDF or convert PDF pages to high-quality images.",
    color: "text-accent",
  },
  {
    icon: Edit3,
    title: "Edit PDF",
    description:
      "Add text, images, signatures, and annotations to your PDF documents.",
    color: "text-success",
  },
];

const ToolsSection = () => {
  return (
    <section id="tools" className="py-24 bg-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Professional PDF Tools
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Everything you need to work with PDF files, powered by advanced
            technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tools.map((tool, index) => (
            <Card
              key={tool.title}
              className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 rounded-lg bg-secondary ${tool.color} transition-colors group-hover:scale-110 duration-300`}
                  >
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  onClick={() => {
                    if (tool.title === "Merge PDF") {
                      window.location.href = "tools/merge";
                    } else if (tool.title === "Split PDF") {
                      window.location.href = "tools/split";
                    } else if (tool.title === "PDF to JPG") {
                      window.location.href = "tools/pdf-to-jpg";
                    } else if (tool.title === "Compress PDF") {
                      window.location.href = "tools/compress";
                    } else if (tool.title === "PDF to Word") {
                      window.location.href = "tools/pdf-to-word";
                    } else if (tool.title === "Edit PDF") {
                      window.location.href = "tools/edit";
                    } else {
                      alert(
                        `${tool.title} tool coming soon! Backend integration in progress.`
                      );
                    }
                  }}
                >
                  Start Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button
            variant="default"
            size="lg"
            onClick={() => {
              window.location.href = "tools/";
            }}
          >
            View All Tools
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
