import PageLayout from "@/components/PageLayout";
import PDFToWordPage from "@/pages/tools/PDFToWordPage";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="pdfToWord">
      <PDFToWordPage />
    </PageLayout>
  </HelmetProvider>
);
