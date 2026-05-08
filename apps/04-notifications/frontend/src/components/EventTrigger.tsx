import React, { useState } from 'react';
import { api } from '../api';
import { Notification } from '../types';

const SAMPLE_EVENTS = [
  { label: 'Deploy Success',     event: { source: 'ci-cd', priority: 'medium', subject: 'Deploy succeeded', payload: { service: 'api-service', version: '3.0.0', status: 'success' } } },
  { label: 'Deploy Failure',     event: { source: 'ci-cd', priority: 'high',   subject: 'Deploy failed',    payload: { service: 'frontend', version: '1.2.3', status: 'failure' } } },
  { label: 'Critical Alert',     event: { source: 'monitoring', priority: 'critical', subject: 'Database failover', body: 'Primary DB down, failing over to replica', payload: { service: 'postgres', errorRate: 100 } } },
  { label: 'High Error Rate',    event: { source: 'monitoring', priority: 'high',     subject: 'Error rate spike',  payload: { service: 'payment-service', errorRate: 12.5 } } },
  { label: 'User Signup',        event: { source: 'auth', priority: 'low', subject: 'New signup', payload: { event: 'user_signup', email: 'newuser@example.com' } } },
];

export default function EventTrigger({ onTriggered }: { onTriggered: (notifs: Notification[]) => void }) {
  const [json, setJson] = useState(JSON.stringify(SAMPLE_EVENTS[0].event, null, 2));
  const [result, setResult] = useState<string>('');
  const [triggering, setTriggering] = useState(false);

  const trigger = async () => {
    setTriggering(true); setResult('');
    try {
      const event = JSON.parse(json) as Record<string, unknown>;
      const res = await api.triggerEvent(event);
      setResult(`✅ Triggered ${res.triggered} notification${res.triggered !== 1 ? 's' : ''}`);
      if (res.triggered > 0) onTriggered(res.notifications);
    } catch (e) {
      setResult(`❌ Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally { setTriggering(false); }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Event Trigger Simulator</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Fire test events to see which rules match and which notifications are created.</p>

      {/* Sample quick-fire buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {SAMPLE_EVENTS.map(({ label, event }) => (
          <button key={label} className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setJson(JSON.stringify(event, null, 2))}>{label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>EVENT JSON</div>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={14}
          style={{ borderRadius: 0, border: 'none', resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn-primary" onClick={trigger} disabled={triggering}>{triggering ? 'Firing…' : '⚡ Fire Event'}</button>
        {result && <span style={{ fontSize: 13, color: result.startsWith('✅') ? 'var(--success)' : 'var(--danger)' }}>{result}</span>}
      </div>
    </div>
  );
}
