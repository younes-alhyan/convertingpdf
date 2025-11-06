import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Zap,
  Users,
  Globe,
  Award,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your files are processed securely and automatically deleted after conversion. We prioritize your privacy above all.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Advanced processing engines ensure your PDF conversions are completed in seconds, not minutes.",
  },
  {
    icon: Globe,
    title: "Cloud-Based",
    description:
      "Access your tools from anywhere, on any device. No software installation required.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Share converted files with your team and collaborate on documents seamlessly.",
  },
];

const stats = [
  { number: "10M+", label: "Files Processed" },
  { number: "99.9%", label: "Uptime" },
  { number: "150+", label: "Countries" },
  { number: "24/7", label: "Support" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-primary text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="mb-4">
              <Award className="h-4 w-4 mr-2" />
              Trusted by millions worldwide
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Revolutionizing PDF Management
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 leading-relaxed">
              We're on a mission to make PDF tools accessible, fast, and secure
              for everyone. From students to enterprises, we power productivity
              worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => (window.location.href = "/auth")}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => (window.location.href = "/")}
              >
                View Our Tools
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We believe that working with PDF files shouldn't be
                  complicated or expensive. That's why we've built a
                  comprehensive suite of tools that are not only powerful but
                  also incredibly easy to use.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Every day, millions of people trust us with their documents
                  because we've made security, speed, and simplicity our core
                  principles. Whether you're a student working on assignments or
                  a business professional handling contracts, we're here to make
                  your life easier.
                </p>
                <div className="flex items-center space-x-2 text-primary">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">
                    Founded in 2020, serving users globally
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-card rounded-2xl p-8 shadow-soft">
                  <div className="h-full flex items-center justify-center">
                    <FileText className="h-32 w-32 text-primary/20" />
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-accent/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Why Choose ConvertingPDF?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We've built our platform with your needs in mind, focusing on
                the features that matter most to our users.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-border/50 shadow-soft hover:shadow-medium transition-all duration-300"
                >
                  <CardHeader className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to Transform Your PDF Workflow?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join millions of users who trust ConvertingPDF for all their
              document needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                onClick={() => (window.location.href = "/auth")}
              >
                Start Converting Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                Explore Tools
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
