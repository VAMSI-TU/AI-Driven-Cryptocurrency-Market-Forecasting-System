import { useEffect } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CryptoTable from "@/components/ui/crypto-table";
import PricePrediction from "@/components/ui/price-prediction";
import TechnicalIndicators from "@/components/ui/technical-indicators";
import { useCryptoData } from "@/hooks/use-crypto-data";
import { useWebSocket } from "@/hooks/use-websocket";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Bell, TrendingUp, Star } from "lucide-react";

export default function Dashboard() {
  const { data: cryptos, isLoading } = useCryptoData();
  const { data: marketData, isConnected } = useWebSocket();

  // Mock portfolio data (in a real app, this would come from an API)
  const portfolioStats = {
    totalValue: 45892.34,
    change24h: 2.4,
    activeAlerts: 12,
    alertsTriggered: 3,
    predictionsMade: 127,
    predictionAccuracy: 84,
    watchlistCount: 24,
    trendingUp: 8
  };

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="dashboard-page">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto" data-testid="main-content">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-border" data-testid="card-portfolio">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Portfolio</p>
                    <p className="text-2xl font-bold" data-testid="text-portfolio-value">
                      ${portfolioStats.totalValue.toLocaleString()}
                    </p>
                    <p className={`text-sm ${portfolioStats.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolioStats.change24h >= 0 ? '+' : ''}{portfolioStats.change24h}% (24h)
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Wallet className="text-primary" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border" data-testid="card-alerts">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                    <p className="text-2xl font-bold" data-testid="text-alerts-count">
                      {portfolioStats.activeAlerts}
                    </p>
                    <p className="text-sm text-yellow-400">
                      {portfolioStats.alertsTriggered} triggered today
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Bell className="text-yellow-400" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border" data-testid="card-predictions">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Predictions Made</p>
                    <p className="text-2xl font-bold" data-testid="text-predictions-count">
                      {portfolioStats.predictionsMade}
                    </p>
                    <p className="text-sm text-green-400">
                      {portfolioStats.predictionAccuracy}% accuracy
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-teal-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-teal-400" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border" data-testid="card-watchlist">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Watchlist Items</p>
                    <p className="text-2xl font-bold" data-testid="text-watchlist-count">
                      {portfolioStats.watchlistCount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {portfolioStats.trendingUp} trending up
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Star className="text-orange-400" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Prediction Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <PricePrediction />
            </div>
            <div>
              <TechnicalIndicators />
            </div>
          </div>

          {/* Cryptocurrency List */}
          <CryptoTable />

          {/* Connection Status */}
          {isConnected && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              Live Data Connected
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
