import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  loginSchema, registerSchema, resetPasswordSchema, phoneSchema,
  betAmountSchema, cashoutSchema, insertGameSchema
} from "@shared/schema";
import { ZodError } from "zod";
import crypto from "crypto";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";

// Type for game state broadcasted to clients
type GameState = {
  status: "waiting" | "active" | "crashed";
  countdown?: number;
  multiplier?: number;
  crashPoint?: number;
};

// Current game state
let currentGame: {
  state: GameState;
  gameId?: number;
  activeBets: Map<number, { userId: number; amount: number; autoCashout: number | null }>;
  startTime?: number;
  intervalId?: NodeJS.Timeout;
} = {
  state: { status: "waiting", countdown: 10 },
  activeBets: new Map()
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time game updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Setup session middleware
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // Utility to handle async routes
  const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => 
    (req: Request, res: Response) => {
      Promise.resolve(fn(req, res)).catch(err => {
        console.error("Error in route handler:", err);
        
        // Handle validation errors
        if (err instanceof ZodError) {
          const validationError = fromZodError(err);
          return res.status(400).json({ 
            message: "Validation error",
            errors: validationError.details || validationError.message
          });
        }
        
        res.status(500).json({ message: "Internal server error" });
      });
    };

  // Authentication Middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Broadcast game state to all connected clients
  const broadcastGameState = () => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ 
          type: 'gameState', 
          data: currentGame.state 
        }));
      }
    });
  };

  // Start game countdown
  const startGameCountdown = () => {
    currentGame.state = { status: "waiting", countdown: 10 };
    broadcastGameState();
    
    let countdown = 10;
    currentGame.intervalId = setInterval(() => {
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(currentGame.intervalId);
        startGame();
      } else {
        currentGame.state.countdown = countdown;
        broadcastGameState();
      }
    }, 1000);
  };

  // Start new game
  const startGame = async () => {
    // Generate crash point (between 1.1 and 10.0)
    const crashPoint = 1.1 + Math.random() * 8.9;
    
    // Create new game in database
    const game = await storage.createGame({ 
      crashPoint
    });
    
    currentGame.gameId = game.id;
    currentGame.startTime = Date.now();
    currentGame.state = { 
      status: "done"});
