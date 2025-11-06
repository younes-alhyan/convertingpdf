import PageLayout from "@/components/PageLayout";
import AllToolsPage from "@/pages/AllToolsPage";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout>
    <AllToolsPage />
  </PageLayout>
);
