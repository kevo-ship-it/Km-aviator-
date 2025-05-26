import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log, setupVite, serveStatic } from "./vite";

const app = express();

// Body parser middleware
app.use(express.json());

// Register API routes
(async () => {
  try {
    // Setup session middleware and API routes
    const server = await registerRoutes(app);
    
    // Setup Vite dev server in development mode
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      // Serve static files in production
      serveStatic(app);
    }
    
    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      log(`Error: ${err.message}`, "error");
      res.status(500).json({ message: "Internal server error" });
    });
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      log(`serving on port ${PORT}`);
    });
    
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
