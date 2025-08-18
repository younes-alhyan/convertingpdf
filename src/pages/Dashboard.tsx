import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Combine,
  Scissors,
  Minimize2,
  Image,
  Edit3,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Conversion {
  id: string;
  original_filename: string;
  converted_filename: string | null;
  conversion_type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  file_size: number | null;
  download_url: string | null;
}

const tools = [
  {
    id: "merge",
    title: "Merge PDF",
    icon: Combine,
    description: "Combine multiple PDFs",
    path: "/tools/merge",
  },
  {
    id: "split",
    title: "Split PDF",
    icon: Scissors,
    description: "Split PDF into pages",
    path: "/tools/split",
  },
  {
    id: "compress",
    title: "Compress PDF",
    icon: Minimize2,
    description: "Reduce file size",
    path: "/tools/compress",
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word",
    icon: FileText,
    description: "Convert to Word document",
    path: "/tools/pdf-to-word",
  },
  {
    id: "pdf-to-jpg",
    title: "PDF to JPG",
    icon: Image,
    description: "Convert to images",
    path: "/tools/pdf-to-jpg",
  },
  {
    id: "edit",
    title: "Edit PDF",
    icon: Edit3,
    description: "Add text and annotations",
    path: "/tools/edit",
  },
];

const Dashboard = () => {
  const { session } = useAuth();
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      setLoading(true);
      fetchConversions();
    }
  }, [session]);

  const fetchConversions = async () => {
    try {
      const token = session?.token;
      const res = await fetch("/api/conversions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch conversions");
      }

      const data: Conversion[] = await res.json();
      setConversions(data);
    } catch (error) {
      console.error("Error fetching conversions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load your conversions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const download = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename; // desired file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      pending: "secondary",
      processing: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please sign in to access your dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your PDF conversions and access your tools.
          </p>
        </div>

        <Tabs defaultValue="tools" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tools">PDF Tools</TabsTrigger>
            <TabsTrigger value="history">Recent Conversions</TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card
                  key={tool.id}
                  className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <tool.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tool.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: `${tool.title} tool will be available soon!`,
                        });
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Use Tool
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversions</CardTitle>
                <CardDescription>
                  Your latest PDF processing history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Loading your conversions...
                    </p>
                  </div>
                ) : conversions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No conversions yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start by using one of our PDF tools above
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversions.map((conversion) => (
                      <div
                        key={conversion.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(conversion.status)}
                          <div>
                            <p className="font-medium text-foreground">
                              {conversion.original_filename}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>
                                {conversion.conversion_type.toUpperCase()}
                              </span>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(
                                  new Date(conversion.created_at),
                                  { addSuffix: true }
                                )}
                              </span>
                              {conversion.file_size && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {(
                                      conversion.file_size /
                                      1024 /
                                      1024
                                    ).toFixed(1)}{" "}
                                    MB
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(conversion.status)}
                          {conversion.status === "completed" &&
                            conversion.converted_filename && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  download(
                                    conversion.download_url,
                                    conversion.converted_filename
                                  );
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
