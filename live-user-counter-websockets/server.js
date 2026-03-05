const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const HEARTBEAT_INTERVAL = 30_000;

// --- HTTP server (serves static files) ---

const httpServer = http.createServer((req, res) => {
  const filePath = path.join(PUBLIC_DIR, req.url === "/" ? "index.html" : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

// --- WebSocket server ---

const wss = new WebSocketServer({ server: httpServer });
const clients = new Set();

function broadcast(payload) {
  const message = JSON.stringify(payload);
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}

function broadcastCount() {
  broadcast({ type: "update", count: clients.size });
}

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[connect]    clients online: ${clients.size}`);
  broadcastCount();

  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[disconnect] clients online: ${clients.size}`);
    broadcastCount();
  });

  ws.on("error", (err) => {
    console.error(`[error] ${err.message}`);
  });
});

// Ping/pong heartbeat — removes zombie connections
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, HEARTBEAT_INTERVAL);

wss.on("close", () => clearInterval(heartbeat));

// --- Start ---

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
