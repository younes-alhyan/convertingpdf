import { Upload, Settings, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload",
    description: "Drag and drop your PDF files or choose from your device, Google Drive, or Dropbox.",
    color: "bg-primary"
  },
  {
    icon: Settings,
    step: "02", 
    title: "Process",
    description: "Select your preferred settings and let our advanced tools process your documents.",
    color: "bg-accent"
  },
  {
    icon: Download,
    step: "03",
    title: "Download",
    description: "Get your processed files instantly. Files are automatically deleted for your security.",
    color: "bg-success"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Three simple steps to transform your PDF documents
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={step.step} className="relative text-center group">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/4 left-full w-full h-0.5 bg-border z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
                  </div>
                )}
                
                <div className="relative z-10 space-y-6">
                  {/* Icon Circle */}
                  <div className="mx-auto">
                    <div className={`relative w-20 h-20 ${step.color} rounded-full flex items-center justify-center shadow-medium group-hover:shadow-glow transition-all duration-300 group-hover:scale-110`}>
                      <step.icon className="h-8 w-8 text-white" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center text-xs font-bold text-foreground">
                        {step.step}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Message */}
        <div className="mt-16 text-center p-6 bg-primary-light rounded-xl border border-primary/20">
          <p className="text-primary font-medium">
            🔒 Your files are processed securely and automatically deleted after 1 hour for your privacy
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;