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
  status: "waiting" | "active" | "crashed" | "done";
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

// Enhanced response helper functions
const sendSuccess = (res: Response, data: any, message = 'Success') => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res: Response, statusCode: number, error: string, message: string, details?: any) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(statusCode).json({
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Setup session middleware
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    store: new SessionStore({
      checkPeriod: 86400000
    })
  }));

  // Helper to catch async errors with enhanced error handling
  const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response) => {
      Promise.resolve(fn(req, res)).catch(err => {
        console.error("Error in route handler:", err);
        if (err instanceof ZodError) {
          const validationError = fromZodError(err);
          return sendError(res, 400, 'Validation error', 'Invalid request data', {
            errors: validationError.details || validationError.message
          });
        }
        sendError(res, 500, 'Internal server error', 'An unexpected error occurred');
      });
    };

  // Auth middleware with enhanced error handling
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return sendError(res, 401, 'Authentication required', 'Please login to continue');
    }
    next();
  };

  // Broadcast to all clients with error handling
  const broadcastGameState = () => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify({
            type: "gameState",
            data: currentGame.state,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('Error broadcasting game state:', error);
        }
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

  // Start game
  const startGame = async () => {
    try {
      const crashPoint = 1.1 + Math.random() * 8.9;

      const game = await storage.createGame({
        crashPoint
      });

      currentGame.gameId = game.id;
      currentGame.startTime = Date.now();
      currentGame.state = {
        status: "done"
      };
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  // ========== ROUTES ==========

  // Register
  app.post("/api/register", asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw parsed.error;
    }

    const { phone, password } = parsed.data;

    const existingUser = await storage.getUserByPhone(phone);
    if (existingUser) {
      return sendError(res, 400, 'Registration failed', 'User with this phone number already exists');
    }

    const user = await storage.createUser({ phone, password });

    req.session.userId = user.id;

    return sendSuccess(res, {
      user: {
        id: user.id,
        phone: user.phone,
      }
    }, 'Registration successful');
  }));

  // Login
  app.post("/api/login", asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw parsed.error;
    }

    const { phone, password } = parsed.data;

    const user = await storage.getUserByPhone(phone);

    if (!user || user.password !== password) {
      return sendError(res, 401, 'Authentication failed', 'Invalid phone number or password');
    }

    req.session.userId = user.id;

    return sendSuccess(res, {
      user: {
        id: user.id,
        phone: user.phone,
      }
    }, 'Login successful');
  }));

  // Enhanced WebSocket connection handling
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');
    
    // Send current game state immediately
    try {
      ws.send(JSON.stringify({
        type: "gameState",
        data: currentGame.state,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error sending initial game state:', error);
    }

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        // Handle WebSocket messages here
        console.log('Received WebSocket message:', message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
             }
