import PageLayout from "@/components/PageLayout";
import Contact from "@/pages/Contact";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout>
    <Contact />
  </PageLayout>
);
