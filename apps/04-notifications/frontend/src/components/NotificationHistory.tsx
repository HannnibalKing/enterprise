import React, { useState } from 'react';
import { Notification, NotificationChannel, NotificationPriority } from '../types';
import { api } from '../api';

const PRIORITY_ICONS: Record<string, string> = { low: 'ℹ️', medium: '📢', high: '⚠️', critical: '🚨' };
const CHANNEL_ICONS: Record<NotificationChannel, string> = { email: '✉️', slack: '💬', sms: '📱', in_app: '🔔' };

interface Props {
  notifications: Notification[];
  currentUserId: string;
  onRefresh: () => void;
}

export default function NotificationHistory({ notifications: notifs, currentUserId, onRefresh }: Props) {
  const [filterChannel, setFilterChannel] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);

  const filtered = notifs.filter((n) => {
    if (filterChannel && n.channel !== filterChannel) return false;
    if (filterPriority && n.priority !== filterPriority) return false;
    if (filterUnread && n.readBy.includes(currentUserId)) return false;
    return true;
  });

  const unreadCount = notifs.filter((n) => !n.readBy.includes(currentUserId)).length;

  const markRead = async (id: string) => { await api.markRead(id); onRefresh(); };
  const markAll = async () => { await api.markAllRead(); onRefresh(); };
  const del = async (id: string) => { await api.deleteNotification(id); onRefresh(); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filters toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)} style={{ width: 130 }}>
          <option value="">All channels</option>
          {(['in_app', 'email', 'slack', 'sms'] as NotificationChannel[]).map((c) => <option key={c} value={c}>{CHANNEL_ICONS[c]} {c}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ width: 130 }}>
          <option value="">All priorities</option>
          {(['low', 'medium', 'high', 'critical'] as NotificationPriority[]).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={filterUnread} onChange={(e) => setFilterUnread(e.target.checked)} style={{ width: 14, height: 14, accentColor: 'var(--accent)' }} />
          Unread only
        </label>
        <div style={{ flex: 1 }} />
        {unreadCount > 0 && (
          <button className="btn-secondary" style={{ fontSize: 12 }} onClick={markAll}>Mark all read ({unreadCount})</button>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{filtered.length} notification{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ color: 'var(--text-muted)' }}>No notifications match your filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((n) => {
            const isRead = n.readBy.includes(currentUserId);
            return (
              <div key={n.id} className="card" style={{ padding: '12px 16px', opacity: isRead ? 0.7 : 1, borderLeft: `3px solid ${n.priority === 'critical' ? 'var(--critical)' : n.priority === 'high' ? 'var(--warning)' : n.priority === 'medium' ? 'var(--info)' : 'var(--border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{PRIORITY_ICONS[n.priority]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: isRead ? 500 : 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{n.subject}</span>
                      {!isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, display: 'inline-block' }} />}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>{n.body}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${n.channel}`}>{CHANNEL_ICONS[n.channel]} {n.channel}</span>
                      <span className={`badge badge-${n.priority}`}>{n.priority}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Rule: {n.ruleName}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 'auto' }}>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                    {!isRead && <button className="btn-ghost" style={{ fontSize: 11, whiteSpace: 'nowrap' }} onClick={() => markRead(n.id)}>✓ Read</button>}
                    <button className="btn-ghost" style={{ fontSize: 11, color: 'var(--danger)' }} onClick={() => del(n.id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
