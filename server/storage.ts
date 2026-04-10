import { 
  type Cryptocurrency, 
  type InsertCryptocurrency,
  type WatchlistItem,
  type InsertWatchlistItem,
  type PriceAlert,
  type InsertPriceAlert,
  type PortfolioItem,
  type InsertPortfolioItem,
  type Prediction,
  type InsertPrediction,
  type HistoricalPrice,
  type User, 
  type InsertUser 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Cryptocurrency operations
  getAllCryptocurrencies(): Promise<Cryptocurrency[]>;
  getCryptocurrency(id: string): Promise<Cryptocurrency | undefined>;
  updateCryptocurrency(id: string, data: Partial<InsertCryptocurrency>): Promise<Cryptocurrency>;
  getCryptocurrenciesBySymbol(symbols: string[]): Promise<Cryptocurrency[]>;
  searchCryptocurrencies(query: string): Promise<Cryptocurrency[]>;

  // Watchlist operations
  getWatchlist(userId: string): Promise<WatchlistItem[]>;
  addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem>;
  removeFromWatchlist(userId: string, cryptoId: string): Promise<void>;

  // Price alert operations
  getPriceAlerts(userId: string): Promise<PriceAlert[]>;
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  updatePriceAlert(id: string, data: Partial<PriceAlert>): Promise<PriceAlert>;
  getActivePriceAlerts(): Promise<PriceAlert[]>;

  // Portfolio operations
  getPortfolio(userId: string): Promise<PortfolioItem[]>;
  addPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  removePortfolioItem(id: string): Promise<void>;

  // Prediction operations
  getPredictions(cryptoId: string): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getLatestPredictions(): Promise<Prediction[]>;

  // Historical data operations
  getHistoricalPrices(cryptoId: string, days: number): Promise<HistoricalPrice[]>;
  addHistoricalPrice(price: Omit<HistoricalPrice, 'id'>): Promise<HistoricalPrice>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cryptocurrencies: Map<string, Cryptocurrency>;
  private watchlistItems: Map<string, WatchlistItem>;
  private priceAlerts: Map<string, PriceAlert>;
  private portfolioItems: Map<string, PortfolioItem>;
  private predictions: Map<string, Prediction>;
  private historicalPrices: Map<string, HistoricalPrice>;

  constructor() {
    this.users = new Map();
    this.cryptocurrencies = new Map();
    this.watchlistItems = new Map();
    this.priceAlerts = new Map();
    this.portfolioItems = new Map();
    this.predictions = new Map();
    this.historicalPrices = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    return Array.from(this.cryptocurrencies.values()).sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }

  async getCryptocurrency(id: string): Promise<Cryptocurrency | undefined> {
    return this.cryptocurrencies.get(id);
  }

  async updateCryptocurrency(id: string, data: Partial<InsertCryptocurrency>): Promise<Cryptocurrency> {
    const existing = this.cryptocurrencies.get(id);
    if (!existing) {
      throw new Error(`Cryptocurrency with id ${id} not found`);
    }
    const updated = { ...existing, ...data, lastUpdated: new Date() };
    this.cryptocurrencies.set(id, updated);
    return updated;
  }

  async getCryptocurrenciesBySymbol(symbols: string[]): Promise<Cryptocurrency[]> {
    return Array.from(this.cryptocurrencies.values()).filter(crypto => 
      symbols.includes(crypto.symbol.toLowerCase())
    );
  }

  async searchCryptocurrencies(query: string): Promise<Cryptocurrency[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.cryptocurrencies.values()).filter(crypto => 
      crypto.name.toLowerCase().includes(lowerQuery) || 
      crypto.symbol.toLowerCase().includes(lowerQuery)
    );
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    return Array.from(this.watchlistItems.values()).filter(item => item.userId === userId);
  }

  async addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem> {
    const id = randomUUID();
    const watchlistItem: WatchlistItem = { ...item, id, createdAt: new Date() };
    this.watchlistItems.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(userId: string, cryptoId: string): Promise<void> {
    for (const [id, item] of Array.from(this.watchlistItems.entries())) {
      if (item.userId === userId && item.cryptoId === cryptoId) {
        this.watchlistItems.delete(id);
        break;
      }
    }
  }

  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return Array.from(this.priceAlerts.values()).filter(alert => alert.userId === userId);
  }

  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const id = randomUUID();
    const priceAlert: PriceAlert = { 
      ...alert, 
      id, 
      createdAt: new Date(),
      triggeredAt: null,
      isActive: true
    };
    this.priceAlerts.set(id, priceAlert);
    return priceAlert;
  }

  async updatePriceAlert(id: string, data: Partial<PriceAlert>): Promise<PriceAlert> {
    const existing = this.priceAlerts.get(id);
    if (!existing) {
      throw new Error(`Price alert with id ${id} not found`);
    }
    const updated = { ...existing, ...data };
    this.priceAlerts.set(id, updated);
    return updated;
  }

  async getActivePriceAlerts(): Promise<PriceAlert[]> {
    return Array.from(this.priceAlerts.values()).filter(alert => alert.isActive);
  }

  async getPortfolio(userId: string): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values()).filter(item => item.userId === userId);
  }

  async addPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = randomUUID();
    const portfolioItem: PortfolioItem = { ...item, id, createdAt: new Date() };
    this.portfolioItems.set(id, portfolioItem);
    return portfolioItem;
  }

  async removePortfolioItem(id: string): Promise<void> {
    this.portfolioItems.delete(id);
  }

  async getPredictions(cryptoId: string): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(pred => pred.cryptoId === cryptoId);
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const id = randomUUID();
    const pred: Prediction = { 
      ...prediction, 
      id, 
      createdAt: new Date(),
      technicalIndicators: prediction.technicalIndicators || null
    };
    this.predictions.set(id, pred);
    return pred;
  }

  async getLatestPredictions(): Promise<Prediction[]> {
    return Array.from(this.predictions.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 10);
  }

  async getHistoricalPrices(cryptoId: string, days: number): Promise<HistoricalPrice[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return Array.from(this.historicalPrices.values())
      .filter(price => 
        price.cryptoId === cryptoId && 
        new Date(price.timestamp) >= cutoffDate
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async addHistoricalPrice(price: Omit<HistoricalPrice, 'id'>): Promise<HistoricalPrice> {
    const id = randomUUID();
    const historicalPrice: HistoricalPrice = { ...price, id };
    this.historicalPrices.set(id, historicalPrice);
    return historicalPrice;
  }
}

export const storage = new MemStorage();
