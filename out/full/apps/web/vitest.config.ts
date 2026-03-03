import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "json"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/main.tsx",
        "src/app/router.tsx",
        "**/node_modules/**"
      ]
    },
    setupFiles: ["./src/test/setup.ts"]
  },
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@modules": path.resolve(__dirname, "src/modules"),
      "@shared": path.resolve(__dirname, "src/shared")
    }
  }
});
