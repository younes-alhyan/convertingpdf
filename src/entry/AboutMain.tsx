import PageLayout from "@/components/PageLayout";
import About from "@/pages/About";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="about">
      <About />
    </PageLayout>
  </HelmetProvider>
);
