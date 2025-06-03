import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log, setupVite, serveStatic } from "./vite";

const app = express();

// Enhanced JSON parsing middleware with error handling
app.use(express.json({ 
  limit: '10mb',
  strict: true,
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf.toString());
    } catch (err) {
      const error = new Error('Invalid JSON format') as any;
      error.status = 400;
      error.type = 'entity.parse.failed';
      throw error;
    }
  }
}));

// JSON parsing error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError && error.status === 400) {
    console.error('JSON Parse Error:', error.message);
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format',
      message: 'Request body contains invalid JSON',
      timestamp: new Date().toISOString()
    });
  }
  next(error);
});

// Ensure consistent response headers
app.use((req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function(data: any) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, data);
  };
  next();
});

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
    
    // Enhanced global error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      log(`Error: ${err.message}`, "error");
      
      // Don't send response if headers already sent
      if (res.headersSent) {
        return next(err);
      }
      
      res.status(500).json({ 
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred",
        timestamp: new Date().toISOString()
      });
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
