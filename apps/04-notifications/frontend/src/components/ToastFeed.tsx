import React, { useEffect, useRef, useState } from 'react';
import { Notification } from '../types';

const PRIORITY_ICONS: Record<string, string> = { low: 'ℹ️', medium: '📢', high: '⚠️', critical: '🚨' };

interface Toast extends Notification {
  toastId: string;
  dismissing: boolean;
}

export default function ToastFeed({ incoming, onDismiss }: {
  incoming: Notification | null;
  onDismiss: (id: string) => void;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!incoming) return;
    const toast: Toast = { ...incoming, toastId: incoming.id + Date.now(), dismissing: false };
    setToasts((prev) => [toast, ...prev].slice(0, 6));
    const t = setTimeout(() => dismiss(toast.toastId), incoming.priority === 'critical' ? 10000 : 5000);
    timerRef.current.set(toast.toastId, t);
  }, [incoming]);

  const dismiss = (toastId: string) => {
    setToasts((prev) => prev.map((t) => t.toastId === toastId ? { ...t, dismissing: true } : t));
    setTimeout(() => {
      setToasts((prev) => {
        const t = prev.find((t) => t.toastId === toastId);
        if (t) onDismiss(t.id);
        return prev.filter((t) => t.toastId !== toastId);
      });
    }, 280);
    const timer = timerRef.current.get(toastId);
    if (timer) { clearTimeout(timer); timerRef.current.delete(toastId); }
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 70, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      {toasts.map((t) => (
        <div key={t.toastId} style={{
          pointerEvents: 'all',
          width: 340,
          background: 'var(--surface)',
          border: `1px solid ${t.priority === 'critical' ? 'rgba(244,63,94,0.5)' : 'var(--border)'}`,
          borderLeft: `3px solid ${t.priority === 'critical' ? 'var(--critical)' : t.priority === 'high' ? 'var(--warning)' : t.priority === 'medium' ? 'var(--info)' : 'var(--text-muted)'}`,
          borderRadius: 10,
          padding: '12px 14px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          opacity: t.dismissing ? 0 : 1,
          transform: t.dismissing ? 'translateX(120%)' : 'translateX(0)',
          transition: 'opacity 0.28s, transform 0.28s',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{PRIORITY_ICONS[t.priority]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.body}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                <span className={`badge badge-${t.channel}`}>{t.channel}</span>
                <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 10, marginLeft: 'auto' }}>{new Date(t.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
            <button onClick={() => dismiss(t.toastId)} className="btn-ghost" style={{ flexShrink: 0, fontSize: 16, padding: '0 4px', lineHeight: 1 }}>×</button>
          </div>
        </div>
      ))}
    </div>
  );
}
