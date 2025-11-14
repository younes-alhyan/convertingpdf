import PageLayout from "@/components/PageLayout";
import EditPDFPage from "@/pages/tools/EditPDFPage";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="edit">
      <EditPDFPage />
    </PageLayout>
  </HelmetProvider>
);
