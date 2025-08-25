import PageLayout from "@/components/PageLayout";
import NotFound from "@/pages/NotFound";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout isProtected={false}>
    <NotFound />
  </PageLayout>
);
