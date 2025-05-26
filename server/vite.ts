import type { Express } from "express";
import { Server } from "http";
import { createServer as createViteServer } from "vite";
import express from "express";
import path from "path";

export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: {
        server
      }
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  log("Vite middleware configured");
}

export function serveStatic(app: Express) {
  const clientDist = path.resolve(process.cwd(), "dist/client");
  
  app.use(express.static(clientDist));
  
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(clientDist, "index.html"));
  });
  
  log("Static file middleware configured");
    }
