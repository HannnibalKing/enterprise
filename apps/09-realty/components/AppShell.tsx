'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/dashboard',   icon: '🏠', label: 'Dashboard'   },
  { href: '/properties',  icon: '🏢', label: 'Properties'  },
  { href: '/leases',      icon: '📄', label: 'Leases'      },
  { href: '/maintenance', icon: '🔧', label: 'Maintenance'  },
  { href: '/financials',  icon: '💰', label: 'Financials'  },
];

export default function AppShell({ children, userName, userRole }: { children: React.ReactNode; userName: string; userRole: string; }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login'); router.refresh();
  }
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">NEXUS REALTY<span>Property Management</span></div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className={`nav-item${pathname === n.href ? ' active' : ''}`}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', fontSize: 11 }}>
          <div style={{ color: 'var(--text-soft)', fontWeight: 600 }}>{userName}</div>
          <div style={{ color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>{userRole.replace(/_/g,' ')}</div>
          <button onClick={logout} style={{ marginTop: 10, width: '100%', padding: '7px', background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text-soft)', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>Sign Out</button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="topbar-title">{NAV.find(n => n.href === pathname)?.label ?? 'NEXUS REALTY'}</span>
          <div className="topbar-right">
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{userRole.replace(/_/g,' ').toUpperCase()}</span>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
