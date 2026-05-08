import React, { useState } from 'react';
import { api } from '../api';

interface Props {
  onLogin: (employee: import('../types').Employee, token: string) => void;
}

const DEMO_USERS = [
  { email: 'carol@company.com', label: 'Carol Kim — HR Admin', role: 'HR Admin' },
  { email: 'alice@company.com', label: 'Alice Chen — VP Engineering (Manager)', role: 'Manager' },
  { email: 'eva@company.com',   label: 'Eva Müller — Frontend Dev (Employee)', role: 'Employee' },
];

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState(DEMO_USERS[0].email);
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, employee } = await api.login(email, password);
      localStorage.setItem('hr_token', token);
      onLogin(employee, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>HR Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Enterprise Human Resources Management</p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>SIGN IN AS</label>
            <select value={email} onChange={(e) => setEmail(e.target.value)}>
              {DEMO_USERS.map((u) => <option key={u.email} value={u.email}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '10px' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 16 }}>
          All demo passwords: <code style={{ color: 'var(--accent)' }}>password123</code>
        </p>
      </div>
    </div>
  );
}
