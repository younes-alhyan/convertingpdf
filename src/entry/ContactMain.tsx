import PageLayout from "@/components/PageLayout";
import Contact from "@/pages/Contact";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="contact">
      <Contact />
    </PageLayout>
  </HelmetProvider>
);
