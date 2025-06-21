// demo/vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // point to the LIBRARY ROOT (which contains index.ts),
      // not to the .tsx file itself:
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
