'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STAFF = [
  { email: 'victoria@palazzo.vip', name: 'Victoria Rhodes — Casino Director' },
  { email: 'marcus@palazzo.vip',   name: 'Marcus Kane — Pit Boss' },
  { email: 'elena@palazzo.vip',    name: 'Elena Vasquez — VIP Host Manager' },
  { email: 'james@palazzo.vip',    name: 'James Calloway — Cage Supervisor' },
  { email: 'riya@palazzo.vip',     name: 'Riya Patel — Revenue Analyst' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(STAFF[0].email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? 'Invalid credentials');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ width: 400 }}>
        {/* Logo block */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 14,
            background: 'linear-gradient(135deg, #c9a227 0%, #f0cc4a 100%)',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#000' }}>P</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text)' }}>
            PALAZZO NEXUS
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase' }}>
            Casino Intelligence Platform
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '32px 36px',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: 'var(--text)' }}>
            Staff Sign In
          </h2>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
              Staff Member
            </label>
            <select
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 6,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: 14,
              }}
            >
              {STAFF.map(s => (
                <option key={s.email} value={s.email}>{s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="casino123"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 6,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: 14,
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Demo password: <span style={{ color: 'var(--gold)' }}>casino123</span>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-dim)', border: '1px solid var(--danger)',
              borderRadius: 6, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: '#e74c3c',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{
              width: '100%', padding: '12px', border: 'none', borderRadius: 6,
              background: loading ? 'var(--border)' : 'var(--gold)',
              color: loading ? 'var(--text-muted)' : '#000',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
          © 2026 Palazzo Nexus · Las Vegas, NV · Confidential
        </div>
      </div>
    </div>
  );
}
