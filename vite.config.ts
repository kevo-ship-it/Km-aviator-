import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tailwindcss } from "@tailwindcss/vite";
import cartographer from "@replit/vite-plugin-cartographer";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cartographer(),
    runtimeErrorModal(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./client/assets"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
