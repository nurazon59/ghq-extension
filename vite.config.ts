import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/content/index.ts"),
      name: "ghqExtension",
      formats: ["iife"],
      fileName: () => "content.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "content.[ext]",
      },
    },
    sourcemap: false,
    minify: true,
  },
});
