import PageLayout from "@/components/PageLayout";
import CompressPDFPage from "@/pages/tools/CompressPDFPage";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="compress">
      <CompressPDFPage />
    </PageLayout>
  </HelmetProvider>
);
