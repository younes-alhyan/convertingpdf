import PageLayout from "@/components/PageLayout";
import AllToolsPage from "@/pages/AllToolsPage";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="tools">
      <AllToolsPage />
    </PageLayout>
  </HelmetProvider>
);
