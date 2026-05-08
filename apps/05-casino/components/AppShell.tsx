'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { StaffRole } from '@/lib/types';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: StaffRole;
  title: string;
}

const NAV = [
  { href: '/dashboard', label: 'Dashboard',  icon: '▦' },
  { href: '/floor',     label: 'Gaming Floor', icon: '♠' },
  { href: '/patrons',   label: 'Patrons',     icon: '◈' },
  { href: '/revenue',   label: 'Revenue',     icon: '▲' },
  { href: '/cage',      label: 'Cage Ops',    icon: '⬡' },
];

function LVTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--gold)' }}>{time} PST</span>;
}

export default function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 210, flexShrink: 0, background: 'var(--surface)',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #c9a227 0%, #f0cc4a 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900, color: '#000',
            }}>P</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text)' }}>
                PALAZZO
              </div>
              <div style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                NEXUS
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 7, marginBottom: 2,
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--gold-bright)' : 'var(--text-soft)',
                  background: isActive ? 'var(--gold-dim)' : 'transparent',
                  borderLeft: `3px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 15, opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '14px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#000',
            }}>{user.avatar}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {user.title}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '7px', borderRadius: 6,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 52, flexShrink: 0, background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            PALAZZO NEXUS · <span style={{ color: 'var(--text-soft)' }}>Las Vegas, NV</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <LVTime />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', background: 'var(--success-dim)',
              borderRadius: 20, border: '1px solid rgba(39,174,96,0.25)',
            }}>
              <span className="status-dot active" />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', letterSpacing: '0.05em' }}>LIVE</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
