import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface WebSocketData {
  type: string;
  data?: any;
  message?: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<WebSocketData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connect = () => {
      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message: WebSocketData = JSON.parse(event.data);
            setData(message);

            // Handle different message types
            switch (message.type) {
              case "priceUpdate":
                // Invalidate cryptocurrency queries to trigger refetch
                queryClient.invalidateQueries({ 
                  queryKey: ["/api/cryptocurrencies"] 
                });
                break;
              
              case "alertTriggered":
                // Show notification or update alerts
                console.log("Price alert triggered:", message.data);
                queryClient.invalidateQueries({ 
                  queryKey: ["/api/alerts"] 
                });
                break;
              
              case "connected":
                console.log("WebSocket connection established:", message.message);
                break;
              
              default:
                console.log("Unknown message type:", message.type);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        wsRef.current.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.CLOSED) {
              connect();
            }
          }, 5000);
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [queryClient]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    data,
    sendMessage,
  };
}
