import PageLayout from "@/components/PageLayout";
import Index from "@/pages/Index";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout isProtected={false}>
    <Index />
  </PageLayout>
);
