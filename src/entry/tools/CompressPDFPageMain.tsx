import PageLayout from "@/components/PageLayout";
import CompressPDFPage from "@/pages/tools/CompressPDFPage";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout isProtected={false}>
    <CompressPDFPage />
  </PageLayout>
);
