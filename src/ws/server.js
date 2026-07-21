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
// reject an upgrade request at the HTTP level with a minimal status line
function rejectUpgrade(socket, code, reason) {
  socket.write(
    `HTTP/1.1 ${code} ${reason}\r\n` +
      "Connection: close\r\n" +
      "\r\n"
  );
  socket.destroy();
}

// function to attach a WebSocket server to an existing HTTP server
export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 1024 * 1024, // 1 MB
  });

  server.on("upgrade", async (req, socket, head) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    if (pathname !== "/ws") {
      socket.destroy();
      return;
    }

    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied()) {
          const isRateLimit = decision.reason.isRateLimit();
          const code = isRateLimit ? 429 : 403;
          const reason = isRateLimit ? "Rate limit exceeded" : "Access Denied";
          rejectUpgrade(socket, code, reason);
          return;
        }
      } catch (error) {
        console.error("WS connection error", error);
        rejectUpgrade(socket, 500, "Internal error");
        return;
      }
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  // single shared heartbeat interval for the whole server, not per-connection
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // Check every 30 seconds

  wss.on("connection", (socket) => {
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