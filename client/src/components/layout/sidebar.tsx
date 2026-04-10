import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Bell, Download } from "lucide-react";

export default function Sidebar() {
  const { data: marketOverview } = useQuery({
    queryKey: ["/api/market-overview"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const fearGreedIndex = marketOverview?.fearGreedIndex || 67;
  const getFearGreedLabel = (index: number) => {
    if (index >= 75) return "Extreme Greed";
    if (index >= 55) return "Greed";
    if (index >= 45) return "Neutral";
    if (index >= 25) return "Fear";
    return "Extreme Fear";
  };

  const getFearGreedColor = (index: number) => {
    if (index >= 75) return "text-red-400";
    if (index >= 55) return "text-yellow-400";
    if (index >= 45) return "text-blue-400";
    if (index >= 25) return "text-orange-400";
    return "text-red-500";
  };

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-16 overflow-y-auto scrollbar-hide" data-testid="sidebar">
      <div className="p-6 space-y-6">
        {/* Market Overview */}
        <div data-testid="market-overview">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Market Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Market Cap</span>
              <span className="text-sm font-medium text-primary" data-testid="text-market-cap">
                {marketOverview ? formatCurrency(marketOverview.totalMarketCap) : "$2.14T"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">24h Volume</span>
              <span className="text-sm font-medium" data-testid="text-volume">
                {marketOverview ? formatCurrency(marketOverview.totalVolume24h) : "$89.2B"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">BTC Dominance</span>
              <span className="text-sm font-medium" data-testid="text-btc-dominance">
                {marketOverview ? `${marketOverview.btcDominance.toFixed(1)}%` : "52.4%"}
              </span>
            </div>
          </div>
        </div>

        {/* Fear & Greed Index */}
        <Card className="bg-secondary" data-testid="fear-greed-index">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Fear & Greed Index
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Current</span>
              <span className={`text-lg font-bold ${getFearGreedColor(fearGreedIndex)}`} data-testid="text-fear-greed-value">
                {fearGreedIndex}
              </span>
            </div>
            <Progress value={fearGreedIndex} className="mb-2" data-testid="progress-fear-greed" />
            <span className={`text-xs ${getFearGreedColor(fearGreedIndex)}`} data-testid="text-fear-greed-label">
              {getFearGreedLabel(fearGreedIndex)}
            </span>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div data-testid="quick-actions">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm px-3 py-2"
              data-testid="button-add-watchlist"
            >
              <Plus className="mr-2" size={16} />
              Add to Watchlist
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm px-3 py-2"
              data-testid="button-set-alert"
            >
              <Bell className="mr-2" size={16} />
              Set Price Alert
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm px-3 py-2"
              data-testid="button-export-data"
            >
              <Download className="mr-2" size={16} />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
