import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: varchar("id").primaryKey(),
  symbol: varchar("symbol").notNull(),
  name: varchar("name").notNull(),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  priceChange24h: decimal("price_change_24h", { precision: 10, scale: 4 }),
  priceChangePercentage24h: decimal("price_change_percentage_24h", { precision: 10, scale: 4 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
  image: varchar("image"),
  rank: integer("rank"),
});

export const watchlistItems = pgTable("watchlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cryptoId: varchar("crypto_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cryptoId: varchar("crypto_id").notNull(),
  targetPrice: decimal("target_price", { precision: 20, scale: 8 }).notNull(),
  condition: varchar("condition").notNull(), // 'above' or 'below'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  triggeredAt: timestamp("triggered_at"),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cryptoId: varchar("crypto_id").notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 20, scale: 8 }).notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cryptoId: varchar("crypto_id").notNull(),
  timeframe: varchar("timeframe").notNull(), // '24h', '7d', '30d'
  predictedPrice: decimal("predicted_price", { precision: 20, scale: 8 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  technicalIndicators: jsonb("technical_indicators"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const historicalPrices = pgTable("historical_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cryptoId: varchar("crypto_id").notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  timestamp: timestamp("timestamp").notNull(),
});

export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies);
export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).omit({ id: true, createdAt: true });
export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true, createdAt: true, triggeredAt: true });
export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({ id: true, createdAt: true });
export const insertPredictionSchema = createInsertSchema(predictions).omit({ id: true, createdAt: true });

export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptocurrency = z.infer<typeof insertCryptocurrencySchema>;
export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type HistoricalPrice = typeof historicalPrices.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
