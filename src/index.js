import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { matchRouter } from "./routes/matches.js";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";
import { commentaryRouter } from "./routes/commentary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "..", "client", "dist");

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use(securityMiddleware());
app.use("/matches", matchRouter);
app.use("/matches/:id/commentary", commentaryRouter);

// Serve the built React app (client/dist) for everything else.
// Must come AFTER the API routes above, so /matches etc. still
// resolve to the backend instead of falling through to index.html.
app.use(express.static(clientDist));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const { broadcastMatchCreated, broadcastCommentary } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is up and running on ${baseUrl}`);
  console.log(
    `WebSocket server is running on ${baseUrl.replace("http", "ws")}/ws`,
  );
});