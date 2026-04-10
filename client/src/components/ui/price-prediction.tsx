import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/crypto-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CryptoChart from "./crypto-chart";

export default function PricePrediction() {
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin");
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: crypto } = useQuery({
    queryKey: ["/api/cryptocurrencies", selectedCrypto],
    enabled: !!selectedCrypto,
  });

  const { data: predictions } = useQuery({
    queryKey: ["/api/cryptocurrencies", selectedCrypto, "predictions"],
    enabled: !!selectedCrypto,
  });

  const { data: historicalData } = useQuery({
    queryKey: ["/api/cryptocurrencies", selectedCrypto, "history"],
    enabled: !!selectedCrypto,
  });

  const generatePredictionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/cryptocurrencies/${selectedCrypto}/predict`, {
        timeframe: selectedTimeframe
      });
    },
    onSuccess: () => {
      toast({
        title: "Prediction Generated",
        description: "New AI prediction has been generated successfully.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/cryptocurrencies", selectedCrypto, "predictions"] 
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate prediction.",
        variant: "destructive",
      });
    },
  });

  const currentPrediction = predictions?.find((p: any) => p.timeframe === selectedTimeframe);
  const currentPrice = parseFloat(crypto?.currentPrice || "0");
  const predictedPrice = parseFloat(currentPrediction?.predictedPrice || "0");
  const priceChange = predictedPrice - currentPrice;
  const changePercentage = currentPrice > 0 ? (priceChange / currentPrice) * 100 : 0;

  const timeframeLabels = {
    "24h": "Next 24H",
    "7d": "Next 7D",
    "30d": "Next 30D"
  };

  return (
    <Card className="bg-card border-border" data-testid="price-prediction">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">AI Price Prediction</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger className="bg-input border-border text-sm w-40" data-testid="select-crypto">
                <SelectValue placeholder="Select crypto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                <SelectItem value="solana">Solana (SOL)</SelectItem>
                <SelectItem value="polkadot">Polkadot (DOT)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="bg-input border-border text-sm w-24" data-testid="select-timeframe">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24H</SelectItem>
                <SelectItem value="7d">7D</SelectItem>
                <SelectItem value="30d">30D</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => generatePredictionMutation.mutate()}
              disabled={generatePredictionMutation.isPending}
              data-testid="button-generate-prediction"
            >
              {generatePredictionMutation.isPending ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Chart */}
        <div className="mb-6" data-testid="chart-container">
          <CryptoChart
            data={historicalData || []}
            currentPrice={currentPrice}
            predictedPrice={predictedPrice}
            timeframe={selectedTimeframe}
          />
        </div>
        
        {/* Prediction Summary */}
        <div className="grid grid-cols-3 gap-4" data-testid="prediction-summary">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {timeframeLabels[selectedTimeframe as keyof typeof timeframeLabels]}
            </p>
            <p 
              className={`text-lg font-bold ${changePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}
              data-testid="text-predicted-price"
            >
              {predictedPrice > 0 ? formatCurrency(predictedPrice) : "N/A"}
            </p>
            <p 
              className={`text-xs ${changePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}
              data-testid="text-predicted-change"
            >
              {predictedPrice > 0 ? formatPercentage(changePercentage) : "N/A"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-lg font-bold" data-testid="text-current-price">
              {formatCurrency(currentPrice)}
            </p>
            <p className="text-xs text-muted-foreground">Live</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Confidence</p>
            <p className="text-lg font-bold text-yellow-400" data-testid="text-confidence">
              {currentPrediction ? `${parseFloat(currentPrediction.confidence).toFixed(0)}%` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentPrediction ? (parseFloat(currentPrediction.confidence) > 80 ? "High" : 
                parseFloat(currentPrediction.confidence) > 60 ? "Medium" : "Low") : "N/A"}
            </p>
          </div>
        </div>
        
        {!currentPrediction && (
          <div className="text-center mt-6">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-2">No prediction available</p>
            <p className="text-sm text-muted-foreground">
              Click "Generate" to create an AI-powered price prediction
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
