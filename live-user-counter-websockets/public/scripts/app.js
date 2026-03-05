const counter = document.getElementById("counter");
const status = document.getElementById("status");

let ws;
let retryDelay = 1000;
const MAX_DELAY = 30_000;

const setStatus = (state, text) => {
  status.className = state;
  status.textContent = text;
};

const connect = () => {
  const url = `ws://${location.host}`;
  ws = new WebSocket(url);

  ws.addEventListener("open", () => {
    retryDelay = 1000;
    setStatus("connected", "Connected");
  });

  ws.addEventListener("message", (event) => {
    const { type, count } = JSON.parse(event.data);
    if (type === "update") {
      counter.textContent = count;
    }
  });

  ws.addEventListener("close", () => {
    counter.textContent = "-";
    setStatus("reconnecting", `Reconnecting in ${retryDelay / 1000}s…`);
    setTimeout(() => {
      setStatus("reconnecting", "Reconnecting…");
      connect();
    }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, MAX_DELAY);
  });

  ws.addEventListener("error", () => {
    setStatus("disconnected", "Disconnected");
    ws.close();
  });
};

connect();
