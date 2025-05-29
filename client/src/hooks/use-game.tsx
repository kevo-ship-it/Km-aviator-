import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

export type GameState = {
  status: "waiting" | "active" | "crashed";
  countdown?: number;
  multiplier?: number;
  crashPoint?: number;
};

export type Bet = {
  id: number;
  amount: number;
  autoCashout: number | null;
};

export type Game = {
  id: number;
  crashPoint: number;
  createdAt: string;
};

export type UserBet = {
  id: number;
  userId: number;
  gameId: number;
  amount: number;
  cashoutMultiplier: number | null;
  profit: number;
  createdAt: string;
};

export type TopWin = UserBet & {
  user: {
    id: number;
    phone: string;
  };
};

interface GameContextType {
  gameState: GameState;
  gameHistory: Game[];
  userBets: UserBet[];
  topWins: TopWin[];
  activeBet: Bet | null;
  isPlacingBet: boolean;
  isCashingOut: boolean;
  placeBet: (amount: number, autoCashout?: number) => Promise<void>;
  cashout: () => Promise<void>;
  refreshUserBets: () => Promise<void>;
  refreshTopWins: () => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({ status: "waiting" });
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [topWins, setTopWins] = useState<TopWin[]>([]);
  const [activeBet, setActiveBet] = useState<Bet | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Setup WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'gameState') {
        setGameState(data.data);
      } else if (data.type === 'cashout') {
        if (activeBet && data.data.betId === activeBet.id) {
          setActiveBet(null);
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setSocket(null);
    };

    // Load initial data
    loadGameHistory();
    loadTopWins();

    return () => {
      ws.close();
    };
  }, []);

  const loadGameHistory = async () => {
    try {
      const res = await fetch("/api/games/recent");
      const games = await res.json();
      setGameHistory(games);
    } catch (error) {
      console.error("Error loading game history:", error);
    }
  };

  const loadTopWins = async () => {
    try {
      const res = await fetch("/api/bets/top-wins");
      const wins = await res.json();
      setTopWins(wins);
    } catch (error) {
      console.error("Error loading top wins:", error);
    }
  };

  const refreshUserBets = async () => {
    try {
      const res = await fetch("/api/bets/my", { credentials: "include" });
      const bets = await res.json();
      setUserBets(bets);
    } catch (error) {
      console.error("Error loading user bets:", error);
    }
  };

  const refreshTopWins = async () => {
    await loadTopWins();
  };

  const placeBet = async (amount: number, autoCashout?: number) => {
    setIsPlacingBet(true);
    try {
      const res = await apiRequest("POST", "/api/bets/place", {
        amount,
        autoCashout
      });
      const bet = await res.json();
      setActiveBet(bet);
    } finally {
      setIsPlacingBet(false);
    }
  };

  const cashout = async () => {
    if (!activeBet) return;
    
    setIsCashingOut(true);
    try {
      await apiRequest("POST", "/api/bets/cashout", {
        betId: activeBet.id
      });
      setActiveBet(null);
    } finally {
      setIsCashingOut(false);
    }
  };

  const value = {
    gameState,
    gameHistory,
    userBets,
    topWins,
    activeBet,
    isPlacingBet,
    isCashingOut,
    placeBet,
    cashout,
    refreshUserBets,
    refreshTopWins
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === null) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
