import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Bell, TrendingUp, Search } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/crypto-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CryptoTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cryptoData, isLoading } = useQuery({
    queryKey: ["/api/cryptocurrencies", { 
      page: currentPage, 
      search: searchQuery, 
      letter: selectedLetter 
    }],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (cryptoId: string) => {
      await apiRequest("POST", "/api/watchlist", { cryptoId });
    },
    onSuccess: () => {
      toast({
        title: "Added to Watchlist",
        description: "Cryptocurrency has been added to your watchlist.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to watchlist.",
        variant: "destructive",
      });
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async ({ cryptoId, targetPrice }: { cryptoId: string; targetPrice: string }) => {
      await apiRequest("POST", "/api/alerts", {
        cryptoId,
        targetPrice,
        condition: "above"
      });
    },
    onSuccess: () => {
      toast({
        title: "Alert Created",
        description: "Price alert has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create price alert.",
        variant: "destructive",
      });
    },
  });

  const cryptocurrencies = cryptoData?.cryptocurrencies || [];
  const totalPages = Math.ceil((cryptoData?.total || 0) / 100);

  const letters = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));

  const handleLetterFilter = (letter: string) => {
    setSelectedLetter(selectedLetter === letter ? "" : letter);
    setCurrentPage(1);
  };

  const handleAddToWatchlist = (cryptoId: string) => {
    addToWatchlistMutation.mutate(cryptoId);
  };

  const handleCreateAlert = (crypto: any) => {
    // In a real app, this would open a modal to set alert parameters
    createAlertMutation.mutate({
      cryptoId: crypto.id,
      targetPrice: crypto.currentPrice
    });
  };

  return (
    <Card className="bg-card border-border" data-testid="crypto-table">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">All Cryptocurrencies</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Filter coins..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-input border-border pl-8 py-1 text-sm w-48"
                  data-testid="input-filter"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-input border-border text-sm w-40" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="layer1">Layer 1</SelectItem>
                  <SelectItem value="meme">Meme Coins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center bg-secondary rounded-md p-1">
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className="px-3 py-1 text-xs"
                data-testid="button-list-view"
              >
                List
              </Button>
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
                className="px-3 py-1 text-xs"
                data-testid="button-grid-view"
              >
                Grid
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Letter Filter */}
      <div className="px-6 py-3 border-b border-border" data-testid="letter-filter">
        <div className="flex flex-wrap gap-2">
          {letters.map(letter => (
            <Button
              key={letter}
              size="sm"
              variant={selectedLetter === letter ? "default" : "outline"}
              onClick={() => handleLetterFilter(letter)}
              className="px-2 py-1 text-xs"
              data-testid={`button-letter-${letter.toLowerCase()}`}
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="px-6 py-3 border-b border-border" data-testid="table-header">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Coin</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">24h Change</div>
          <div className="col-span-2">Market Cap</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>

      {/* Cryptocurrency Rows */}
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading cryptocurrencies...</p>
            </div>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto scrollbar-hide" data-testid="crypto-list">
            {cryptocurrencies.map((crypto: any, index: number) => (
              <div
                key={crypto.id}
                className="px-6 py-4 border-b border-border hover:bg-secondary transition-colors"
                data-testid={`crypto-row-${crypto.id}`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 text-sm text-muted-foreground">
                    {crypto.rank || ((currentPage - 1) * 100) + index + 1}
                  </div>
                  <div className="col-span-3 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                      {crypto.image ? (
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xs font-bold">
                          {crypto.symbol.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`text-name-${crypto.id}`}>
                        {crypto.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {crypto.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="font-medium" data-testid={`text-price-${crypto.id}`}>
                      {formatCurrency(parseFloat(crypto.currentPrice || "0"))}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`font-medium ${
                        parseFloat(crypto.priceChangePercentage24h || "0") >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                      data-testid={`text-change-${crypto.id}`}
                    >
                      {formatPercentage(parseFloat(crypto.priceChangePercentage24h || "0"))}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm" data-testid={`text-marketcap-${crypto.id}`}>
                      {formatCurrency(parseFloat(crypto.marketCap || "0"))}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddToWatchlist(crypto.id)}
                      className="p-1 text-muted-foreground hover:text-yellow-400"
                      data-testid={`button-star-${crypto.id}`}
                    >
                      <Star size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCreateAlert(crypto)}
                      className="p-1 text-muted-foreground hover:text-yellow-400"
                      data-testid={`button-bell-${crypto.id}`}
                    >
                      <Bell size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1 text-muted-foreground hover:text-teal-400"
                      data-testid={`button-chart-${crypto.id}`}
                    >
                      <TrendingUp size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border" data-testid="pagination">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * 100) + 1}-{Math.min(currentPage * 100, cryptoData?.total || 0)} of {cryptoData?.total || 0} cryptocurrencies
            </p>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                data-testid="button-previous"
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">
                {currentPage}
              </span>
              {totalPages > 1 && currentPage < totalPages && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= totalPages}
                  data-testid="button-next"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
