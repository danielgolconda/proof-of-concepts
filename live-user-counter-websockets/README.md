# live-user-counter-websockets

Real-time "users online" presence system using WebSockets.

## Setup

```bash
cd live-user-counter-websockets
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in multiple tabs — the count updates live as tabs open and close.

## How it works

- The Node.js server tracks connected clients in a `Set`
- On connect/disconnect, it broadcasts `{ type: "update", count: N }` to all clients
- The frontend reconnects automatically with exponential backoff if the connection drops
- A ping/pong heartbeat runs every 30 seconds to clean up zombie connections
