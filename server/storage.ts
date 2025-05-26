
import { 
  users, games, bets, 
  type User, type InsertUser,
  type Game, type InsertGame,
  type Bet, type InsertBet, type UpdateBet
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amount: number): Promise<User | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  getRecentGames(limit: number): Promise<Game[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  getBet(id: number): Promise<Bet | undefined>;
  updateBet(id: number, update: UpdateBet): Promise<Bet | undefined>;
  getUserBets(userId: number, limit: number): Promise<Bet[]>;
  getTopWins(limit: number): Promise<(Bet & { user: User })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private bets: Map<number, Bet>;
  private currentUserId: number;
  private currentGameId: number;
  private currentBetId: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.bets = new Map();
    this.currentUserId = 1;
    this.currentGameId = 1;
    this.currentBetId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      balance: 1000, 
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      balance: user.balance + amount 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createGame(game: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    const now = new Date();
    const newGame: Game = { ...game, id, createdAt: now };
    this.games.set(id, newGame);
    return newGame;
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getRecentGames(limit: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const id = this.currentBetId++;
    const now = new Date();
    const newBet: Bet = { 
      ...bet, 
      id, 
      cashoutMultiplier: null, 
      profit: -bet.amount,
      createdAt: now 
    };
    this.bets.set(id, newBet);
    return newBet;
  }

  async getBet(id: number): Promise<Bet | undefined> {
    return this.bets.get(id);
  }

  async updateBet(id: number, update: UpdateBet): Promise<Bet | undefined> {
    const bet = await this.getBet(id);
    if (!bet) return undefined;
    
    const updatedBet = { 
      ...bet, 
      ...update 
    };
    this.bets.set(id, updatedBet);
    return updatedBet;
  }

  async getUserBets(userId: number, limit: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter(bet => bet.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getTopWins(limit: number): Promise<(Bet & { user: User })[]> {
    const betsWithUsers = await Promise.all(
      Array.from(this.bets.values())
        .filter(bet => bet.profit > 0)
        .sort((a, b) => b.profit - a.profit)
        .slice(0, limit)
        .map(async bet => {
          const user = await this.getUser(bet.userId);
          if (!user) throw new Error("User not found");
          return { ...bet, user };
        })
    );
    
    return betsWithUsers;
  }
}

export const storage = new MemStorage();
