'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
const STAFF = [
  { value: 'victor',  label: 'Victor Okafor — Plant Director' },
  { value: 'sophie',  label: 'Sophie Laurent — Production Manager' },
  { value: 'leo',     label: 'Leo Matsumoto — Quality Engineer' },
  { value: 'ravi',    label: 'Ravi Patel — Maintenance Engineer' },
  { value: 'chloe',   label: 'Chloe Dubois — Materials Planner' },
];
export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState('victor');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user, password: pass }) });
    if (res.ok) { router.push('/dashboard'); router.refresh(); }
    else { setError('Invalid credentials'); setLoading(false); }
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 400, padding: 40, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.15em', color: 'var(--accent)', textTransform: 'uppercase' }}>FORGEMAX</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.1em' }}>MANUFACTURING EXECUTION SYSTEM</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Plant Personnel</label>
            <select value={user} onChange={e => setUser(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', fontSize: 13 }}>
              {STAFF.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="forge123" style={{ width: '100%', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', fontSize: 13 }} />
          </div>
          {error && <div style={{ color: 'var(--red)', fontSize: 12 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ padding: '11px', background: 'var(--accent2)', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
