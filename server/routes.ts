import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { cryptoService } from "./services/cryptoService";
import { predictionService } from "./services/predictionService";
import { insertWatchlistItemSchema, insertPriceAlertSchema, insertPortfolioItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active WebSocket connections
  const activeConnections = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    activeConnections.add(ws);

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      activeConnections.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      activeConnections.delete(ws);
    });

    // Send initial data
    ws.send(JSON.stringify({ type: 'connected', message: 'Real-time connection established' }));
  });

  // Function to broadcast price updates to all connected clients
  const broadcastPriceUpdate = (data: any) => {
    const message = JSON.stringify({ type: 'priceUpdate', data });
    activeConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  };

  // Cryptocurrency routes
  app.get("/api/cryptocurrencies", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const search = req.query.search as string;
      const letter = req.query.letter as string;

      let cryptocurrencies = await cryptoService.fetchAllCryptocurrencies(page, limit);

      if (search) {
        cryptocurrencies = await cryptoService.searchCryptocurrencies(search);
      }

      if (letter) {
        cryptocurrencies = cryptocurrencies.filter(crypto => 
          crypto.name.toUpperCase().startsWith(letter.toUpperCase())
        );
      }

      res.json({ cryptocurrencies, total: cryptocurrencies.length });
    } catch (error) {
      console.error("Error fetching cryptocurrencies:", error);
      res.status(500).json({ message: "Failed to fetch cryptocurrencies" });
    }
  });

  app.get("/api/cryptocurrencies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cryptocurrency = await cryptoService.fetchCryptocurrencyById(id);
      
      if (!cryptocurrency) {
        return res.status(404).json({ message: "Cryptocurrency not found" });
      }

      res.json(cryptocurrency);
    } catch (error) {
      console.error(`Error fetching cryptocurrency ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch cryptocurrency" });
    }
  });

  // Market overview route
  app.get("/api/market-overview", async (req, res) => {
    try {
      const overview = await cryptoService.getMarketOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error fetching market overview:", error);
      res.status(500).json({ message: "Failed to fetch market overview" });
    }
  });

  // Historical prices route
  app.get("/api/cryptocurrencies/:id/history", async (req, res) => {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      const historicalPrices = await cryptoService.getHistoricalPrices(id, days);
      res.json(historicalPrices);
    } catch (error) {
      console.error(`Error fetching historical prices for ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch historical prices" });
    }
  });

  // Prediction routes
  app.get("/api/predictions", async (req, res) => {
    try {
      const predictions = await predictionService.getAllPredictions();
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  app.get("/api/cryptocurrencies/:id/predictions", async (req, res) => {
    try {
      const { id } = req.params;
      const predictions = await predictionService.getPredictionByCrypto(id);
      res.json(predictions);
    } catch (error) {
      console.error(`Error fetching predictions for ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  app.post("/api/cryptocurrencies/:id/predict", async (req, res) => {
    try {
      const { id } = req.params;
      const { timeframe } = req.body;
      
      if (!['24h', '7d', '30d'].includes(timeframe)) {
        return res.status(400).json({ message: "Invalid timeframe" });
      }

      const prediction = await predictionService.generatePrediction(id, timeframe);
      res.json(prediction);
    } catch (error) {
      console.error(`Error generating prediction for ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to generate prediction" });
    }
  });

  // Technical indicators route
  app.get("/api/cryptocurrencies/:id/indicators", async (req, res) => {
    try {
      const { id } = req.params;
      const indicators = await predictionService.getTechnicalIndicators(id);
      res.json(indicators);
    } catch (error) {
      console.error(`Error fetching indicators for ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch technical indicators" });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", async (req, res) => {
    try {
      const userId = "default-user"; // In a real app, get from session/auth
      const watchlist = await storage.getWatchlist(userId);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const userId = "default-user"; // In a real app, get from session/auth
      const validatedData = insertWatchlistItemSchema.parse({ ...req.body, userId });
      const watchlistItem = await storage.addToWatchlist(validatedData);
      res.json(watchlistItem);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:cryptoId", async (req, res) => {
    try {
      const userId = "default-user"; // In a real app, get from session/auth
      const { cryptoId } = req.params;
      await storage.removeFromWatchlist(userId, cryptoId);
      res.json({ message: "Removed from watchlist" });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Price alerts routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const userId = "default-user"; // In a real app, get from session/auth
      const alerts = await storage.getPriceAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ message: "Failed to fetch price alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const userId = "default-user"; // In a real app, get from session/auth
      const validatedData = insertPriceAlertSchema.parse({ ...req.body, userId });
      const alert = await storage.createPriceAlert(validatedData);
      res.json(alert);
    } catch (error) {
      console.error("Error creating price alert:", error);
      res.status(500).json({ message: "Failed to create price alert" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio", async (req, res) => {
    try {
      const userId = "default-user"; // In a real app, get from session/auth
      const portfolio = await storage.getPortfolio(userId);
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/portfolio", async (req, res) => {
    try {
      const userId = "default-user"; // In a real app, get from session/auth
      const validatedData = insertPortfolioItemSchema.parse({ ...req.body, userId });
      const portfolioItem = await storage.addPortfolioItem(validatedData);
      res.json(portfolioItem);
    } catch (error) {
      console.error("Error adding portfolio item:", error);
      res.status(500).json({ message: "Failed to add portfolio item" });
    }
  });

  // Scheduled task to update prices and check alerts (runs every 30 seconds)
  setInterval(async () => {
    try {
      console.log("Updating cryptocurrency prices...");
      const top50Cryptos = await cryptoService.fetchAllCryptocurrencies(1, 50);
      
      // Broadcast price updates to connected clients
      if (top50Cryptos.length > 0) {
        broadcastPriceUpdate(top50Cryptos);
      }

      // Check price alerts
      const activeAlerts = await storage.getActivePriceAlerts();
      for (const alert of activeAlerts) {
        const crypto = await storage.getCryptocurrency(alert.cryptoId);
        if (crypto) {
          const currentPrice = parseFloat(crypto.currentPrice || "0");
          const targetPrice = parseFloat(alert.targetPrice || "0");
          
          const shouldTrigger = 
            (alert.condition === "above" && currentPrice >= targetPrice) ||
            (alert.condition === "below" && currentPrice <= targetPrice);

          if (shouldTrigger) {
            await storage.updatePriceAlert(alert.id, {
              isActive: false,
              triggeredAt: new Date()
            });

            // Broadcast alert trigger to connected clients
            activeConnections.forEach(ws => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'alertTriggered',
                  data: { alert, cryptocurrency: crypto, currentPrice }
                }));
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in scheduled price update:", error);
    }
  }, 30000); // 30 seconds

  return httpServer;
}
