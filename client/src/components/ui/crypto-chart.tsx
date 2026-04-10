import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { formatCurrency } from "@/lib/crypto-utils";

interface CryptoChartProps {
  data: Array<{
    timestamp: string;
    price: string;
  }>;
  currentPrice: number;
  predictedPrice: number;
  timeframe: string;
}

export default function CryptoChart({ data, currentPrice, predictedPrice, timeframe }: CryptoChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate sample data for demonstration
      const now = new Date();
      const sampleData = [];
      const basePrice = currentPrice || 50000;
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Generate realistic price movement
        const randomFactor = 0.95 + (Math.random() * 0.1); // ±5% variation
        const trendFactor = 1 + (Math.sin(i * 0.1) * 0.02); // Small trend
        const price = basePrice * randomFactor * trendFactor;
        
        sampleData.push({
          timestamp: date.toISOString(),
          price: price.toString(),
          formattedDate: date.toLocaleDateString(),
        });
      }
      
      // Add current point
      sampleData.push({
        timestamp: now.toISOString(),
        price: currentPrice.toString(),
        formattedDate: now.toLocaleDateString(),
        isCurrent: true
      });
      
      // Add prediction point if available
      if (predictedPrice > 0) {
        const futureDate = new Date(now);
        if (timeframe === "24h") futureDate.setDate(futureDate.getDate() + 1);
        else if (timeframe === "7d") futureDate.setDate(futureDate.getDate() + 7);
        else if (timeframe === "30d") futureDate.setDate(futureDate.getDate() + 30);
        
        sampleData.push({
          timestamp: futureDate.toISOString(),
          price: predictedPrice.toString(),
          formattedDate: futureDate.toLocaleDateString(),
          isPrediction: true
        });
      }
      
      return sampleData;
    }
    
    return data.map(item => ({
      ...item,
      formattedDate: new Date(item.timestamp).toLocaleDateString(),
      numericPrice: parseFloat(item.price)
    }));
  }, [data, currentPrice, predictedPrice, timeframe]);

  const minPrice = Math.min(...chartData.map(d => parseFloat(d.price)));
  const maxPrice = Math.max(...chartData.map(d => parseFloat(d.price)));
  const priceRange = maxPrice - minPrice;
  const yAxisPadding = priceRange * 0.1;

  return (
    <div className="w-full h-80 bg-secondary rounded-lg p-4" data-testid="crypto-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="formattedDate"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[minPrice - yAxisPadding, maxPrice + yAxisPadding]}
            tickFormatter={(value) => formatCurrency(value, true)}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(parseFloat(payload[0].value as string))}
                    </p>
                    {data.isPrediction && (
                      <p className="text-xs text-yellow-400">Predicted</p>
                    )}
                    {data.isCurrent && (
                      <p className="text-xs text-green-400">Current</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Historical price line */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          
          {/* Current price reference line */}
          {currentPrice > 0 && (
            <ReferenceLine 
              y={currentPrice} 
              stroke="hsl(var(--chart-2))" 
              strokeDasharray="5 5"
              label={{ value: "Current", position: "insideTopRight" }}
            />
          )}
          
          {/* Predicted price reference line */}
          {predictedPrice > 0 && (
            <ReferenceLine 
              y={predictedPrice} 
              stroke="hsl(var(--chart-1))" 
              strokeDasharray="3 3"
              label={{ value: "Predicted", position: "insideTopRight" }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {chartData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LineChart className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">No chart data available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Historical data is loading...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
