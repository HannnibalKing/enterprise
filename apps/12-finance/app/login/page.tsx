'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const USERS = ['eleanor','thomas','amara','jin','nova'];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('eleanor');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) router.push('/dashboard');
    else setError('Invalid credentials. Try finance123.');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 360, padding: 36, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 4 }}>LUMINARY</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Finance ERP</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Staff Member</label>
            <select value={username} onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', fontSize: 13 }}>
              {USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="finance123" style={{ width: '100%', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', fontSize: 13 }} />
          </div>
          {error && <div style={{ padding: '8px 12px', background: 'var(--red-dim)', color: 'var(--red)', borderRadius: 6, fontSize: 12 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ padding: '11px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 800, fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
