import PageLayout from "@/components/PageLayout";
import PDFToWordPage from "@/pages/tools/PDFToWordPage";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout>
    <PDFToWordPage />
  </PageLayout>
);
