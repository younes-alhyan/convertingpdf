import PageLayout from "@/components/PageLayout";
import EditPDFPage from "@/pages/tools/EditPDFPage";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout>
    <EditPDFPage />
  </PageLayout>
);
