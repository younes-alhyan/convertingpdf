// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // top-level pages
        index: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        contact: resolve(__dirname, "contact.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        "404": resolve(__dirname, "404.html"),
        // tools pages
        tools: resolve(__dirname, "tools/index.html"),
        merge: resolve(__dirname, "tools/merge.html"),
        split: resolve(__dirname, "tools/split.html"),
        compress: resolve(__dirname, "tools/compress.html"),
        "pdf-to-jpg": resolve(__dirname, "tools/pdf-to-jpg.html"),
        "pdf-to-word": resolve(__dirname, "tools/pdf-to-word.html"),
        edit: resolve(__dirname, "tools/edit.html"),
      },
    },
    outDir: "dist", // your build output
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  base: "./",
});
