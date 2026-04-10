export function formatCurrency(value: number, compact: boolean = false): string {
  if (value === 0) return "$0.00";
  
  if (compact) {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  }

  if (value < 0.01) {
    return `$${value.toFixed(6)}`;
  } else if (value < 1) {
    return `$${value.toFixed(4)}`;
  } else if (value < 100) {
    return `$${value.toFixed(2)}`;
  } else {
    return `$${value.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toLocaleString()}`;
}

export function formatVolume(value: number): string {
  return formatMarketCap(value);
}

export function getChangeColor(value: number): string {
  return value >= 0 ? "text-green-400" : "text-red-400";
}

export function calculatePriceChange(currentPrice: number, previousPrice: number): {
  absolute: number;
  percentage: number;
} {
  const absolute = currentPrice - previousPrice;
  const percentage = previousPrice !== 0 ? (absolute / previousPrice) * 100 : 0;
  
  return { absolute, percentage };
}

export function isSignificantChange(percentage: number, threshold: number = 5): boolean {
  return Math.abs(percentage) >= threshold;
}

export function getCryptocurrencyIcon(symbol: string): string {
  const iconMap: Record<string, string> = {
    BTC: "₿",
    ETH: "Ξ",
    ADA: "₳",
    DOT: "●",
    LINK: "🔗",
    SOL: "◎",
    AVAX: "🔺",
    MATIC: "◆",
    UNI: "🦄",
    ATOM: "⚛",
  };

  return iconMap[symbol.toUpperCase()] || symbol.charAt(0);
}

export function generateMockPriceData(basePrice: number, days: number = 30): Array<{
  timestamp: string;
  price: string;
  volume?: string;
}> {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic price movement with some volatility
    const randomFactor = 0.9 + (Math.random() * 0.2); // ±10% variation
    const trendFactor = 1 + (Math.sin(i * 0.1) * 0.05); // Small trend component
    const price = basePrice * randomFactor * trendFactor;
    
    data.push({
      timestamp: date.toISOString(),
      price: price.toString(),
      volume: (Math.random() * 1000000000).toString(),
    });
  }
  
  return data;
}
