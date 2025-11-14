import PageLayout from "@/components/PageLayout";
import NotFound from "@/pages/NotFound";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PageLayout page="notFound">
      <NotFound />
    </PageLayout>
  </HelmetProvider>
);
