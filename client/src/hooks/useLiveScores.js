import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

export function useLiveScores() {
  const { getToken, isSignedIn } = useAuth();
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      const token = isSignedIn ? await getToken() : null;
      const url = new URL(`${location.origin.replace(/^http/, "ws")}/ws`);
      if (token) url.searchParams.set("token", token);

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        if (cancelled) return;
        const payload = JSON.parse(event.data);
        if (payload.type === "commentary") {
          setEvents((prev) => [payload.data, ...prev]);
        }
      };
    }

    connect();
    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [isSignedIn, getToken]);

  return events;
}