import { storage } from "../storage";
import { cryptoService } from "./cryptoService";
import { type Prediction, type InsertPrediction } from "@shared/schema";

interface TechnicalIndicators {
  rsi: number;
  macd: number;
  sma50: number;
  sma200: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: "high" | "medium" | "low";
  trend: "bullish" | "bearish" | "neutral";
}

export class PredictionService {
  async calculateSimpleMovingAverage(prices: number[], period: number): Promise<number> {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const slice = prices.slice(-period);
    return slice.reduce((sum, price) => sum + price, 0) / period;
  }

  async calculateRSI(prices: number[], period: number = 14): Promise<number> {
    if (prices.length < period + 1) return 50;

    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const gains = changes.filter(change => change > 0);
    const losses = changes.filter(change => change < 0).map(loss => Math.abs(loss));

    const avgGain = gains.length > 0 ? gains.reduce((sum, gain) => sum + gain, 0) / gains.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / losses.length : 0;

    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  async calculateMACD(prices: number[]): Promise<number> {
    const ema12 = await this.calculateEMA(prices, 12);
    const ema26 = await this.calculateEMA(prices, 26);
    return ema12 - ema26;
  }

  async calculateEMA(prices: number[], period: number): Promise<number> {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  async calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): Promise<{upper: number, middle: number, lower: number}> {
    const sma = await this.calculateSimpleMovingAverage(prices, period);
    
    if (prices.length < period) {
      return { upper: sma, middle: sma, lower: sma };
    }

    const slice = prices.slice(-period);
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  async getTechnicalIndicators(cryptoId: string): Promise<TechnicalIndicators> {
    try {
      const historicalData = await cryptoService.getHistoricalPrices(cryptoId, 200);
      const prices = historicalData.map(data => parseFloat(data.price));
      
      if (prices.length === 0) {
        throw new Error("No historical data available");
      }

      const rsi = await this.calculateRSI(prices);
      const macd = await this.calculateMACD(prices);
      const sma50 = await this.calculateSimpleMovingAverage(prices, 50);
      const sma200 = await this.calculateSimpleMovingAverage(prices, 200);
      const bollingerBands = await this.calculateBollingerBands(prices);

      const currentPrice = prices[prices.length - 1];
      const priceChange = prices.length > 1 ? currentPrice - prices[prices.length - 2] : 0;
      
      // Determine volume based on recent price volatility
      const recentPrices = prices.slice(-10);
      const volatility = this.calculateVolatility(recentPrices);
      const volume = volatility > 0.05 ? "high" : volatility > 0.02 ? "medium" : "low";

      // Determine trend based on multiple indicators
      let bullishSignals = 0;
      let bearishSignals = 0;

      if (rsi > 30 && rsi < 70) bullishSignals++;
      if (rsi > 70) bearishSignals++;
      if (rsi < 30) bullishSignals++;

      if (macd > 0) bullishSignals++;
      else bearishSignals++;

      if (currentPrice > sma50) bullishSignals++;
      else bearishSignals++;

      if (sma50 > sma200) bullishSignals++;
      else bearishSignals++;

      const trend = bullishSignals > bearishSignals ? "bullish" : 
                   bearishSignals > bullishSignals ? "bearish" : "neutral";

      return {
        rsi,
        macd,
        sma50,
        sma200,
        bollingerBands,
        volume,
        trend
      };
    } catch (error) {
      console.error(`Error calculating technical indicators for ${cryptoId}:`, error);
      // Return default values
      return {
        rsi: 50,
        macd: 0,
        sma50: 0,
        sma200: 0,
        bollingerBands: { upper: 0, middle: 0, lower: 0 },
        volume: "medium",
        trend: "neutral"
      };
    }
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  async generatePrediction(cryptoId: string, timeframe: '24h' | '7d' | '30d'): Promise<Prediction> {
    try {
      const crypto = await storage.getCryptocurrency(cryptoId);
      if (!crypto) {
        throw new Error(`Cryptocurrency ${cryptoId} not found`);
      }

      const currentPrice = parseFloat(crypto.currentPrice || "0");
      const technicalIndicators = await this.getTechnicalIndicators(cryptoId);
      
      // Simple prediction algorithm based on technical indicators
      let priceMultiplier = 1;
      let confidence = 50;

      // RSI influence
      if (technicalIndicators.rsi < 30) {
        priceMultiplier *= 1.05; // Oversold, expect bounce
        confidence += 10;
      } else if (technicalIndicators.rsi > 70) {
        priceMultiplier *= 0.95; // Overbought, expect correction
        confidence += 10;
      }

      // MACD influence
      if (technicalIndicators.macd > 0) {
        priceMultiplier *= 1.02;
        confidence += 5;
      } else {
        priceMultiplier *= 0.98;
        confidence += 5;
      }

      // SMA trend influence
      if (currentPrice > technicalIndicators.sma50) {
        priceMultiplier *= 1.01;
        confidence += 5;
      } else {
        priceMultiplier *= 0.99;
        confidence += 5;
      }

      // Bollinger Bands influence
      const { upper, middle, lower } = technicalIndicators.bollingerBands;
      if (currentPrice < lower) {
        priceMultiplier *= 1.03; // Near lower band, expect bounce
        confidence += 8;
      } else if (currentPrice > upper) {
        priceMultiplier *= 0.97; // Near upper band, expect pullback
        confidence += 8;
      }

      // Timeframe adjustments
      const timeframeMultipliers = {
        '24h': 0.5,
        '7d': 1.0,
        '30d': 1.5
      };

      const adjustedMultiplier = 1 + ((priceMultiplier - 1) * timeframeMultipliers[timeframe]);
      const predictedPrice = currentPrice * adjustedMultiplier;

      // Add some randomness to make predictions more realistic
      const randomFactor = 0.95 + (Math.random() * 0.1); // ±5% random variation
      const finalPredictedPrice = predictedPrice * randomFactor;

      // Ensure confidence is between 50 and 95
      confidence = Math.min(95, Math.max(50, confidence));

      const prediction: InsertPrediction = {
        cryptoId,
        timeframe,
        predictedPrice: finalPredictedPrice.toString(),
        confidence: confidence.toString(),
        technicalIndicators: technicalIndicators as any
      };

      return await storage.createPrediction(prediction);
    } catch (error) {
      console.error(`Error generating prediction for ${cryptoId}:`, error);
      throw error;
    }
  }

  async getAllPredictions(): Promise<Prediction[]> {
    return await storage.getLatestPredictions();
  }

  async getPredictionByCrypto(cryptoId: string): Promise<Prediction[]> {
    return await storage.getPredictions(cryptoId);
  }
}

export const predictionService = new PredictionService();
