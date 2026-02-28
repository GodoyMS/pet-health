import type { PluginOption } from "vite";

declare module "@tailwindcss/vite" {
  export default function tailwindcss(): PluginOption;
}

