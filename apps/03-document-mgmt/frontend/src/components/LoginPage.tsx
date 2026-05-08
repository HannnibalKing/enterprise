import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';

const DEMO = [
  { email: 'alice@docs.com', label: 'Alice Chen' },
  { email: 'bob@docs.com',   label: 'Bob Torres' },
  { email: 'carol@docs.com', label: 'Carol Kim' },
];

export default function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState(DEMO[0].email);
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem('docs_token', token);
      onLogin(user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Document Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Enterprise document storage & collaboration</p>
        </div>
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>SIGN IN AS</label>
            <select value={email} onChange={(e) => setEmail(e.target.value)}>
              {DEMO.map((d) => <option key={d.email} value={d.email}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>PASSWORD</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: 10 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 14 }}>
          Demo password: <code style={{ color: 'var(--accent)' }}>password123</code>
        </p>
      </div>
    </div>
  );
}
