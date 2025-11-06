import PageLayout from "@/components/PageLayout";
import Dashboard from "@/pages/Dashboard";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout>
    <Dashboard />
  </PageLayout>
);
