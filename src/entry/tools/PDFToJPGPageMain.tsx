import PageLayout from "@/components/PageLayout";
import PDFToJPGPage from "@/pages/tools/PDFToJPGPage";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout>
    <PDFToJPGPage />
  </PageLayout>
);
