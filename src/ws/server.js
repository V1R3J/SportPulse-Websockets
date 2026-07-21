import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";


// function to send a JSON payload to a specific WebSocket client
function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

// function to broadcast a JSON payload to all connected WebSocket clients
function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    client.send(JSON.stringify(payload));
  }
}

// function to attach a WebSocket server to an existing HTTP server
export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024, // 1 MB
  });

  // single shared heartbeat interval for the whole server, not per-connection
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // Check every 30 seconds

  wss.on("connection", async (socket, req) => {
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied()) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008;
          const reason = decision.reason.isRateLimit()
            ? "Rate limit exceeded"
            : "Access Denied";
          socket.close(code, reason);
          return;
        }
      } catch (error) {
        console.error("WS connection error", error);
        socket.close(1011, "Internal error");
        return;
      }
    }

    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });

    sendJson(socket, {
      type: "welcome",
    });
  });

  wss.on("close", () => {
    clearInterval(interval);
  });

  function broadcastMatchCreated(match) {
    broadcast(wss, { type: "match_created", data: match });
  }

  return { broadcastMatchCreated };
}
