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

  // Helper to catch async errors
  const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response) => {
      Promise.resolve(fn(req, res)).catch(err => {
        console.error("Error in route handler:", err);
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

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Broadcast to all clients
  const broadcastGameState = () => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: "gameState",
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

  // Start game
  const startGame = async () => {
    const crashPoint = 1.1 + Math.random() * 8.9;

    const game = await storage.createGame({
      crashPoint
    });

    currentGame.gameId = game.id;
    currentGame.startTime = Date.now();
    currentGame.state = {
      status: "done"
    };
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
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await storage.createUser({ phone, password });

    req.session.userId = user.id;

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        phone: user.phone,
      },
    });
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
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = user.id;

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        phone: user.phone,
      },
    });
  }));

  return httpServer;
  }
    
