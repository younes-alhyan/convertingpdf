import PageLayout from "@/components/PageLayout";
import Index from "@/pages/Index";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="home">
      <Index />
    </PageLayout>
  </HelmetProvider>
);
