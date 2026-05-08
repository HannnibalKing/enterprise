import React, { useState } from 'react';
import { User, NotificationChannel } from '../types';
import { api } from '../api';

const CHANNELS: { key: NotificationChannel; label: string; icon: string }[] = [
  { key: 'in_app', label: 'In-App',  icon: '🔔' },
  { key: 'email',  label: 'Email',   icon: '✉️' },
  { key: 'slack',  label: 'Slack',   icon: '💬' },
  { key: 'sms',    label: 'SMS',     icon: '📱' },
];

export default function ChannelSettings({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({ ...user.channelPrefs });

  const save = async () => {
    setSaving(true);
    try { const updated = await api.updatePrefs(prefs as Record<string, boolean>); onUpdate(updated); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Notification Channels</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Configure which channels you receive notifications through.</p>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        {CHANNELS.map(({ key, label, icon }, idx) => (
          <div key={key} style={{ padding: '16px 20px', borderBottom: idx < CHANNELS.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 22, width: 28, textAlign: 'center' }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {key === 'in_app' && 'Real-time notifications in the app + toast alerts'}
                {key === 'email'  && 'Email delivery to your registered address'}
                {key === 'slack'  && 'Messages to your configured Slack workspace'}
                {key === 'sms'    && 'Text messages to your registered phone number'}
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, flexShrink: 0, cursor: 'pointer' }}>
              <input type="checkbox" checked={prefs[key]} onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              <span style={{
                position: 'absolute', inset: 0, borderRadius: 12,
                background: prefs[key] ? 'var(--accent)' : 'var(--border)',
                transition: 'background 0.2s',
              }} />
              <span style={{
                position: 'absolute', top: 3, left: prefs[key] ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </label>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Preferences'}</button>
        <button className="btn-secondary" onClick={() => setPrefs({ ...user.channelPrefs })}>Reset</button>
      </div>
    </div>
  );
}
