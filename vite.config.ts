import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "./client",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
