import PageLayout from "@/components/PageLayout";
import MergePDFPage from "@/pages/tools/MergePDFPage";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout>
    <MergePDFPage />
  </PageLayout>
);
