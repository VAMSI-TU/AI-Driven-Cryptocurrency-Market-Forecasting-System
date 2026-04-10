import { useQuery } from "@tanstack/react-query";

export function useCryptoData() {
  return useQuery({
    queryKey: ["/api/cryptocurrencies"],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

export function useCryptoById(id: string) {
  return useQuery({
    queryKey: ["/api/cryptocurrencies", id],
    enabled: !!id,
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useMarketOverview() {
  return useQuery({
    queryKey: ["/api/market-overview"],
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}

export function useCryptoPredictions(cryptoId: string) {
  return useQuery({
    queryKey: ["/api/cryptocurrencies", cryptoId, "predictions"],
    enabled: !!cryptoId,
    refetchInterval: 120000, // Refresh every 2 minutes
  });
}

export function useTechnicalIndicators(cryptoId: string) {
  return useQuery({
    queryKey: ["/api/cryptocurrencies", cryptoId, "indicators"],
    enabled: !!cryptoId,
    refetchInterval: 60000, // Refresh every minute
  });
}
