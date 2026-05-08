import WebSocket from 'ws';
import http from 'http';

let wss: WebSocket.Server | null = null;

export function initWebSocket(server: http.Server): void {
  wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    ws.on('error', console.error);
  });
}

export function broadcast(event: unknown): void {
  if (!wss) return;
  const msg = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}
