import PageLayout from "@/components/PageLayout";
import SplitPDFPage from "@/pages/tools/SplitPDFPage";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout>
    <SplitPDFPage />
  </PageLayout>
);
