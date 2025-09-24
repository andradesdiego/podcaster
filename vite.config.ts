import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // RSS Top 100 (añadimos /us/ en la reescritura)
      "/rss": {
        target: "https://itunes.apple.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss/, "/us/rss"),
      },
      // Lookup + episodes
      "/itunes": {
        target: "https://itunes.apple.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/itunes/, ""),
      },
    },
  },
});
