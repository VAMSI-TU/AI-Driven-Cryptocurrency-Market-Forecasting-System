import { storage } from "../storage";
import { type Cryptocurrency } from "@shared/schema";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: any;
  last_updated: string;
}

export interface MarketOverview {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  fearGreedIndex: number;
}

export class CryptoService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY || "";
  }

  private async fetchFromCoinGecko(endpoint: string): Promise<any> {
    const url = `${COINGECKO_API_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (this.apiKey) {
      headers['x-cg-demo-api-key'] = this.apiKey;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async fetchAllCryptocurrencies(page: number = 1, perPage: number = 250): Promise<Cryptocurrency[]> {
    try {
      const data: CoinGeckoMarketData[] = await this.fetchFromCoinGecko(
        `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`
      );

      const cryptocurrencies = data.map((coin): Cryptocurrency => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        currentPrice: coin.current_price?.toString() || "0",
        marketCap: coin.market_cap?.toString() || "0",
        volume24h: coin.total_volume?.toString() || "0",
        priceChange24h: coin.price_change_24h?.toString() || "0",
        priceChangePercentage24h: coin.price_change_percentage_24h?.toString() || "0",
        lastUpdated: new Date(coin.last_updated),
        image: coin.image,
        rank: coin.market_cap_rank,
      }));

      // Update storage with fresh data
      for (const crypto of cryptocurrencies) {
        await storage.updateCryptocurrency(crypto.id, crypto).catch(async () => {
          // If update fails, the crypto doesn't exist, so we add it to storage
          const existing = await storage.getCryptocurrency(crypto.id);
          if (!existing) {
            (storage as any).cryptocurrencies.set(crypto.id, crypto);
          }
        });
      }

      return cryptocurrencies;
    } catch (error) {
      console.error("Error fetching cryptocurrencies from CoinGecko:", error);
      // Fallback to storage data
      return await storage.getAllCryptocurrencies();
    }
  }

  async fetchCryptocurrencyById(id: string): Promise<Cryptocurrency | null> {
    try {
      const data = await this.fetchFromCoinGecko(`/coins/${id}`);
      
      const crypto: Cryptocurrency = {
        id: data.id,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        currentPrice: data.market_data.current_price.usd?.toString() || "0",
        marketCap: data.market_data.market_cap.usd?.toString() || "0",
        volume24h: data.market_data.total_volume.usd?.toString() || "0",
        priceChange24h: data.market_data.price_change_24h?.toString() || "0",
        priceChangePercentage24h: data.market_data.price_change_percentage_24h?.toString() || "0",
        lastUpdated: new Date(data.last_updated),
        image: data.image.large,
        rank: data.market_cap_rank,
      };

      await storage.updateCryptocurrency(crypto.id, crypto).catch(() => {
        (storage as any).cryptocurrencies.set(crypto.id, crypto);
      });

      return crypto;
    } catch (error) {
      console.error(`Error fetching cryptocurrency ${id}:`, error);
      return await storage.getCryptocurrency(id) || null;
    }
  }

  async getMarketOverview(): Promise<MarketOverview> {
    try {
      const globalData = await this.fetchFromCoinGecko("/global");
      
      return {
        totalMarketCap: globalData.data.total_market_cap.usd,
        totalVolume24h: globalData.data.total_volume.usd,
        btcDominance: globalData.data.market_cap_percentage.btc,
        fearGreedIndex: 67, // Mock data as this requires a separate API
      };
    } catch (error) {
      console.error("Error fetching market overview:", error);
      return {
        totalMarketCap: 2140000000000,
        totalVolume24h: 89200000000,
        btcDominance: 52.4,
        fearGreedIndex: 67,
      };
    }
  }

  async getHistoricalPrices(cryptoId: string, days: number = 30): Promise<any[]> {
    try {
      const data = await this.fetchFromCoinGecko(
        `/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
      );

      return data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp: new Date(timestamp),
        price: price.toString(),
        volume: "0",
        marketCap: "0"
      }));
    } catch (error) {
      console.error(`Error fetching historical prices for ${cryptoId}:`, error);
      return await storage.getHistoricalPrices(cryptoId, days);
    }
  }

  async searchCryptocurrencies(query: string): Promise<Cryptocurrency[]> {
    try {
      const data = await this.fetchFromCoinGecko(`/search?query=${encodeURIComponent(query)}`);
      
      const coinIds = data.coins.slice(0, 10).map((coin: any) => coin.id);
      const detailedData: CoinGeckoMarketData[] = await this.fetchFromCoinGecko(
        `/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&sparkline=false`
      );

      return detailedData.map((coin): Cryptocurrency => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        currentPrice: coin.current_price?.toString() || "0",
        marketCap: coin.market_cap?.toString() || "0",
        volume24h: coin.total_volume?.toString() || "0",
        priceChange24h: coin.price_change_24h?.toString() || "0",
        priceChangePercentage24h: coin.price_change_percentage_24h?.toString() || "0",
        lastUpdated: new Date(coin.last_updated),
        image: coin.image,
        rank: coin.market_cap_rank,
      }));
    } catch (error) {
      console.error("Error searching cryptocurrencies:", error);
      return await storage.searchCryptocurrencies(query);
    }
  }
}

export const cryptoService = new CryptoService();
