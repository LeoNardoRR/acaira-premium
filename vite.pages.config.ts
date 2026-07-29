import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "/acaira-premium/",
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "pages-out",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(process.cwd(), "github-pages-src/index.html"),
    },
  },
});
