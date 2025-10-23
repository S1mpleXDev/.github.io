import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ActiveUsersCounter() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "userCount") {
              setActiveUsers(data.count);
            }
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (error) {
        console.error("WebSocket connection error:", error);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return (
    <Badge variant="secondary" className="gap-2 px-3 py-1.5" data-testid="badge-active-users">
      <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-chart-2 animate-pulse" : "bg-muted-foreground"}`} />
      <Users className="w-3.5 h-3.5" />
      <span className="font-medium" data-testid="text-user-count">{activeUsers}</span>
      <span className="text-xs text-muted-foreground">active</span>
    </Badge>
  );
}
