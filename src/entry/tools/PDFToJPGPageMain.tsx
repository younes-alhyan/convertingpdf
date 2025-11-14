import PageLayout from "@/components/PageLayout";
import PDFToJPGPage from "@/pages/tools/PDFToJPGPage";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="pdfToJpg">
      <PDFToJPGPage />
    </PageLayout>
  </HelmetProvider>
);
