import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from './types';

const WS_URL = `ws://${window.location.host}`;

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardData = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        reconnectTimer = setTimeout(connect, 5000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (e) => {
        try {
          const { type, data: payload } = JSON.parse(e.data as string);
          if (type === 'snapshot' || type === 'update' || type === 'refresh') {
            setData(payload as DashboardData);
            setLoading(false);
          }
        } catch { /* ignore */ }
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [fetchData]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetch('/api/refresh', { method: 'POST' });
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, connected, refresh };
}
