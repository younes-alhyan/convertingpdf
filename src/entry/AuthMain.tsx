import PageLayout from "@/components/PageLayout";
import Auth from "../pages/Auth"; // your Auth component
import { createRoot } from "react-dom/client";
import "@/App.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <PageLayout isProtected={false}>
    <Auth />
  </PageLayout>
);
