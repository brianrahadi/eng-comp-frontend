import { useEffect, useRef } from "react";
import type { Camera } from "../api/types";

export function useWebSocket(onMessage: (data: Camera[]) => void) {
  const url = (import.meta.env.VITE_WS_URL || "ws://localhost:4000") as string;
  const ref = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    ref.current = ws;
    
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage(data);
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url, onMessage]);
}

