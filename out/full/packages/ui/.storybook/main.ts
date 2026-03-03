import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";
import { mergeConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ], 

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {},
  viteFinal(config, { configType }) {
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: { 
        alias: {
          "@": path.resolve(__dirname, "../src"),
        },
      },
      // Exclude stories from library build; keep bundle focused on components
      build:
        configType === "PRODUCTION"
          ? {
              rollupOptions: {
                output: {
                  manualChunks: (id) => {
                    if (id.includes("node_modules")) return "vendor";
                    return undefined;
                  },
                },
              },
            }
          : undefined,
    });
  },
};

export default config;
