import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TechnicalIndicatorsProps {
  cryptoId?: string;
}

export default function TechnicalIndicators({ cryptoId = "bitcoin" }: TechnicalIndicatorsProps) {
  const { data: indicators, isLoading } = useQuery({
    queryKey: ["/api/cryptocurrencies", cryptoId, "indicators"],
    enabled: !!cryptoId,
    refetchInterval: 60000, // Refresh every minute
  });

  const getSignalColor = (signal: string) => {
    switch (signal.toLowerCase()) {
      case "bullish":
      case "buy":
      case "above":
        return "bg-green-500/20 text-green-400";
      case "bearish":
      case "sell":
      case "below":
        return "bg-red-500/20 text-red-400";
      case "neutral":
      case "hold":
      case "middle":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-blue-500/20 text-blue-400";
    }
  };

  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return "Overbought";
    if (rsi < 30) return "Oversold";
    if (rsi > 50) return "Bullish";
    return "Bearish";
  };

  const getMACDSignal = (macd: number) => {
    return macd > 0 ? "Bullish" : "Bearish";
  };

  const getSMASignal = (currentPrice: number, sma: number) => {
    return currentPrice > sma ? "Above" : "Below";
  };

  const getVolumeSignal = (volume: string) => {
    return volume.charAt(0).toUpperCase() + volume.slice(1);
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border" data-testid="technical-indicators-loading">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg font-semibold">Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border" data-testid="technical-indicators">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg font-semibold">Technical Indicators</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {indicators ? (
          <>
            <div className="flex justify-between items-center" data-testid="indicator-rsi">
              <span className="text-sm">RSI (14)</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {indicators.rsi?.toFixed(1) || "N/A"}
                </span>
                <Badge className={getSignalColor(getRSISignal(indicators.rsi || 50))}>
                  {getRSISignal(indicators.rsi || 50)}
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center" data-testid="indicator-macd">
              <span className="text-sm">MACD</span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${indicators.macd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {indicators.macd >= 0 ? '+' : ''}{indicators.macd?.toFixed(0) || "N/A"}
                </span>
                <Badge className={getSignalColor(getMACDSignal(indicators.macd || 0))}>
                  {getMACDSignal(indicators.macd || 0)}
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center" data-testid="indicator-sma50">
              <span className="text-sm">SMA (50)</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  ${indicators.sma50?.toFixed(0) || "N/A"}
                </span>
                <Badge className={getSignalColor("Above")}>
                  Above
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center" data-testid="indicator-bollinger">
              <span className="text-sm">Bollinger Bands</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Middle</span>
                <Badge className={getSignalColor("Neutral")}>
                  Neutral
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center" data-testid="indicator-volume">
              <span className="text-sm">Volume</span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  indicators.volume === "high" ? 'text-green-400' : 
                  indicators.volume === "medium" ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {getVolumeSignal(indicators.volume || "medium")}
                </span>
                <Badge className={getSignalColor(
                  indicators.volume === "high" ? "Bullish" : "Neutral"
                )}>
                  {indicators.volume === "high" ? "Bullish" : "Neutral"}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Trend</span>
                <Badge className={`text-sm ${getSignalColor(indicators.trend || "neutral")}`}>
                  {(indicators.trend || "neutral").charAt(0).toUpperCase() + (indicators.trend || "neutral").slice(1)}
                </Badge>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No technical indicators available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Data is loading or unavailable for this cryptocurrency
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
