import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';

interface Props {
  onLogin: (token: string, user: User) => void;
}

const DEMO_USERS = [
  { email: 'alice@enterprise.dev', label: 'Alice Chen (admin)' },
  { email: 'bob@enterprise.dev',   label: 'Bob Torres (member)' },
  { email: 'carol@enterprise.dev', label: 'Carol Singh (member)' },
];

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('alice@enterprise.dev');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem('kanban_token', token);
      onLogin(token, user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 380, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🟣</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Kanban Board</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Enterprise Project Management</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>EMAIL</label>
            <select value={email} onChange={(e) => setEmail(e.target.value)}>
              {DEMO_USERS.map((u) => <option key={u.email} value={u.email}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password123" />
          </div>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid var(--danger)', borderRadius: 6, padding: '8px 12px', color: 'var(--danger)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 14, marginTop: 4, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
          All accounts use password: <code style={{ color: 'var(--accent)' }}>password123</code>
        </p>
      </div>
    </div>
  );
}
