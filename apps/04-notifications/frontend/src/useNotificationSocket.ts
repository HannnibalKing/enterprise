import { useEffect, useRef, useCallback } from 'react';

export function useNotificationSocket(onEvent: (msg: unknown) => void) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    const hostname = window.location.hostname;
    ws.current = new WebSocket(`ws://${hostname}:4004`);
    ws.current.onmessage = (e) => {
      try { onEventRef.current(JSON.parse(e.data)); } catch { /* ignore */ }
    };
    ws.current.onclose = () => {
      reconnectTimer.current = setTimeout(connect, 3000);
    };
    ws.current.onerror = () => ws.current?.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);
}
