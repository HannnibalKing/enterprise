import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';

const DEMO_USERS = [
  { email: 'alice@notify.com', name: 'Alice Chen — Engineering' },
  { email: 'bob@notify.com',   name: 'Bob Torres — Operations' },
  { email: 'carol@notify.com', name: 'Carol Kim — Admin' },
];

export default function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState(DEMO_USERS[0].email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { token, user } = await api.login(email, password);
      api.setToken(token);
      onLogin(user);
    } catch { setError('Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="card" style={{ width: 360, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Notification Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Sign in to your account</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>ACCOUNT</label>
            <select value={email} onChange={(e) => setEmail(e.target.value)}>
              {DEMO_USERS.map((u) => <option key={u.email} value={u.email}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>PASSWORD</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password123" autoComplete="current-password" />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4, padding: '9px' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
