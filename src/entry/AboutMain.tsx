import PageLayout from "@/components/PageLayout";
import About from "@/pages/About";
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout isProtected={false}>
    <About />
  </PageLayout>
);
