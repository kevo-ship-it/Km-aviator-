
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(1000),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  phone: true,
  password: true,
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  crashPoint: doublePrecision("crash_point").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).pick({
  crashPoint: true,
});

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").notNull().references(() => games.id),
  amount: integer("amount").notNull(),
  cashoutMultiplier: doublePrecision("cashout_multiplier"),
  profit: integer("profit").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBetSchema = createInsertSchema(bets).pick({
  userId: true,
  gameId: true,
  amount: true,
});

export const updateBetSchema = z.object({
  cashoutMultiplier: z.number(),
  profit: z.number(),
});

export const phoneSchema = z.string()
  .regex(/^\+254\d{9}$/, "Phone number must be in format +254XXXXXXXXX")
  .or(z.string().regex(/^0\d{9}$/, "Phone number must be in format 0XXXXXXXXX")
    .transform(val => `+254${val.substring(1)}`));

export const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

export const registerSchema = loginSchema;

export const resetPasswordSchema = z.object({
  phone: phoneSchema,
});

export const betAmountSchema = z.number()
  .min(10, "Minimum bet is KSh 10")
  .max(20000, "Maximum bet is KSh 20,000");

export const cashoutSchema = z.object({
  betId: z.number(),
  multiplier: z.number(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type UpdateBet = z.infer<typeof updateBetSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type CashoutRequest = z.infer<typeof cashoutSchema>;
