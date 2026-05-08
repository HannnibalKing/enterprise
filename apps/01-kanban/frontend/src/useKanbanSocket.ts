import { useEffect, useRef, useCallback } from 'react';

const WS_URL = `ws://${window.location.hostname}:4001`;

type Handler = (event: { type: string; payload: unknown }) => void;

export function useKanbanSocket(onEvent: Handler) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data as string);
        handlerRef.current(event);
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);
}
