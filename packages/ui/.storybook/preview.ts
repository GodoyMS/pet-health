import type { Preview } from "@storybook/react";
import "../src/index.css";
import "../src/assets/material-symbols.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "oklch(1 0 0)" }],
    },
  },
};

export default preview;
