import React, { useCallback, useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import NotificationHistory from './components/NotificationHistory';
import RuleEditor from './components/RuleEditor';
import ChannelSettings from './components/ChannelSettings';
import EventTrigger from './components/EventTrigger';
import ToastFeed from './components/ToastFeed';
import { useNotificationSocket } from './useNotificationSocket';
import { Notification, Rule, User } from './types';
import { api } from './api';

type Tab = 'inbox' | 'rules' | 'trigger' | 'settings';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>('inbox');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [latestNotif, setLatestNotif] = useState<Notification | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('notif_token');
    if (t) { api.me().then((u) => { setUser(u); setAuthChecked(true); }).catch(() => { api.clearToken(); setAuthChecked(true); }); }
    else setAuthChecked(true);
  }, []);

  const loadNotifications = useCallback(async () => {
    const n = await api.getNotifications();
    setNotifications(n);
  }, []);

  const loadRules = useCallback(async () => {
    const r = await api.getRules();
    setRules(r);
  }, []);

  useEffect(() => {
    if (user) { loadNotifications(); loadRules(); }
  }, [user, loadNotifications, loadRules]);

  // WebSocket events
  useNotificationSocket((msg) => {
    const m = msg as { type: string; payload: Notification };
    if (m.type === 'notification:new') {
      setNotifications((prev) => [m.payload, ...prev]);
      setLatestNotif(m.payload);
    }
  });

  const unread = notifications.filter((n) => user && !n.readBy.includes(user.id)).length;

  if (!authChecked) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading…</div>;
  if (!user) return <LoginPage onLogin={(u) => setUser(u)} />;

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'inbox',    label: 'Inbox',    icon: '🔔' },
    { id: 'rules',    label: 'Rules',    icon: '⚙️' },
    { id: 'trigger',  label: 'Trigger',  icon: '⚡' },
    { id: 'settings', label: 'Settings', icon: '🎛️' },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{ height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <span style={{ fontSize: 20 }}>🔔</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Notification Center</span>

        <div style={{ flex: 1 }} />

        {/* Tab navigation */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? 'var(--accent-light)' : 'none', border: `1px solid ${tab === t.id ? 'rgba(99,102,241,0.3)' : 'transparent'}`, color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)', borderRadius: 6, padding: '5px 12px', fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
              {t.icon} {t.label}
              {t.id === 'inbox' && unread > 0 && (
                <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: 10, fontWeight: 700, marginLeft: 2 }}>{unread > 99 ? '99+' : unread}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{user.avatar}</div>
          <span style={{ fontSize: 13 }}>{user.name}</span>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => { api.clearToken(); setUser(null); }}>Sign out</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        {tab === 'inbox' && (
          <NotificationHistory notifications={notifications} currentUserId={user.id} onRefresh={loadNotifications} />
        )}
        {tab === 'rules' && (
          <RuleEditor rules={rules} onRefresh={() => { loadRules(); loadNotifications(); }} />
        )}
        {tab === 'trigger' && (
          <EventTrigger onTriggered={(newNotifs) => { setNotifications((prev) => [...newNotifs, ...prev]); if (newNotifs[0]) setLatestNotif(newNotifs[0]); loadRules(); }} />
        )}
        {tab === 'settings' && (
          <ChannelSettings user={user} onUpdate={setUser} />
        )}
      </div>

      {/* Toast overlay */}
      <ToastFeed incoming={latestNotif} onDismiss={async (id) => { await api.markRead(id); loadNotifications(); }} />
    </div>
  );
}
