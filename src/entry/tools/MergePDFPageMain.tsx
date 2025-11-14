import PageLayout from "@/components/PageLayout";
import MergePDFPage from "@/pages/tools/MergePDFPage";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="merge">
      <MergePDFPage />
    </PageLayout>
  </HelmetProvider>
);
