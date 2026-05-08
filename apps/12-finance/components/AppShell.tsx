'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard',  icon: '◈' },
  { href: '/ledger',    label: 'GL Ledger',   icon: '⊞' },
  { href: '/invoices',  label: 'Payables',    icon: '⊟' },
  { href: '/payroll',   label: 'Payroll',     icon: '⊕' },
  { href: '/budget',    label: 'Budget',      icon: '◉' },
];

export default function AppShell({ children, userName, userRole }: { children: React.ReactNode; userName: string; userRole: string; }) {
  const path = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 210, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.08em', color: 'var(--accent)' }}>LUMINARY</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>Finance ERP</div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' }}>
          {NAV.map(n => {
            const active = path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 7, textDecoration: 'none', fontWeight: active ? 700 : 500,
                fontSize: 12, color: active ? 'var(--accent)' : 'var(--text-soft)',
                background: active ? 'rgba(16,185,129,0.10)' : 'transparent',
                letterSpacing: '0.02em', transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 14 }}>{n.icon}</span>{n.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{userName}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10 }}>{userRole.replace('_',' ')}</div>
          <button onClick={logout} disabled={loggingOut}
            style={{ width: '100%', padding: '7px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>{children}</main>
    </div>
  );
}
