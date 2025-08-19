import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    host: true, // allow external host
    port: 4173, // or whatever port
    allowedHosts: ["quick-doc-tool.onrender.com"], // <-- add your Render domain
  },
});
