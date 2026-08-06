import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// @ts-expect-error -- plain .mjs build helper shared with the web app
import { preloadIconFont } from "../../scripts/vite-plugins.mjs";

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadIconFont()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@modules": path.resolve(__dirname, "src/modules"),
      "@shared": path.resolve(__dirname, "src/shared")
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Routes are lazily imported (see src/app/router.tsx), which splits the
        // pages but would otherwise leave every shared dependency duplicated
        // across route chunks or dragged into the entry. Pinning the big, rarely
        // changing libraries to their own chunks keeps the first load small and
        // lets them stay cached across deploys.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query", "axios"]
        }
      }
    }
  },
  server: {
    port: 5174
  }
});
