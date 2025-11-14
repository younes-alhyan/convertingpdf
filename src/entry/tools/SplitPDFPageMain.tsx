import PageLayout from "@/components/PageLayout";
import SplitPDFPage from "@/pages/tools/SplitPDFPage";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="split">
      <SplitPDFPage />
    </PageLayout>
  </HelmetProvider>
);
