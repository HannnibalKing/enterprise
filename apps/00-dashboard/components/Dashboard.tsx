'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { DashboardMetrics, ServiceHealth } from '@/lib/types';

/* ─── Dynamic import: recharts must be client-only ──────── */
const Charts = dynamic(() => import('./Charts'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: 13,
        }}>
          <span style={{ display: 'inline-block', animation: 'spin 0.7s linear infinite', marginRight: 8 }}>↻</span>
          Loading chart…
        </div>
      ))}
    </div>
  ),
});

/* ─── Count-up animation hook ───────────────────────────── */
function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (target === 0) { setVal(0); return; }
    let startTime: number | null = null;
    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setVal(Math.round(target * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

/* ─── KPI Card ──────────────────────────────────────────── */
function KpiCard({
  icon, label, value, sub, color, online,
}: {
  icon: string; label: string; value: number | null; sub: string; color: string; online: boolean;
}) {
  const displayed = useCountUp(value ?? 0);
  return (
    <div className="fade-up" style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: `4px solid ${online ? color : 'var(--border)'}`,
      borderRadius: 12,
      padding: '22px 24px',
      transition: 'border-color 0.3s',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.09em', marginBottom: 14 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 8 }}>
        <span style={{
          fontSize: 48, lineHeight: 1, fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          color: !online ? 'var(--text-muted)' : 'var(--text)',
          transition: 'color 0.3s',
        }}>
          {value === null ? '—' : displayed}
        </span>
        <span style={{ fontSize: 26, paddingBottom: 6 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {online ? sub : 'Service offline'}
      </div>
    </div>
  );
}

/* ─── Service health badge ──────────────────────────────── */
function HealthBadge({ name, icon, health }: { name: string; icon: string; health: ServiceHealth }) {
  const color = !health.ok
    ? '#f87171'
    : health.ms < 100 ? '#34d399'
    : health.ms < 350 ? '#fbbf24'
    : '#f87171';
  const pct = health.ok ? Math.min((health.ms / 400) * 100, 100) : 100;

  return (
    <div style={{
      flex: 1, minWidth: 0, background: 'var(--surface2)',
      border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block',
            boxShadow: health.ok ? `0 0 8px ${color}` : 'none',
            transition: 'background 0.3s',
          }} />
          <span style={{ fontSize: 10, color, fontWeight: 700 }}>{health.ok ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 3, height: 3, overflow: 'hidden', marginBottom: 5 }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color, borderRadius: 3,
          transition: 'width 1s ease-out, background 0.3s',
        }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{health.ms}ms</div>
    </div>
  );
}

/* ─── Quick-launch app links ────────────────────────────── */
const APP_LINKS = [
  { name: 'Kanban Board',        icon: '📋', port: 5174, desc: 'Tasks & sprints',       color: '#6366f1' },
  { name: 'HR Portal',           icon: '👥', port: 5175, desc: 'People & leave',         color: '#34d399' },
  { name: 'Document Management', icon: '📁', port: 5176, desc: 'Files & versions',       color: '#fbbf24' },
  { name: 'Notification Center', icon: '🔔', port: 5177, desc: 'Alerts & rules',         color: '#f43f5e' },
];

/* ─── Main Dashboard component ──────────────────────────── */
export default function Dashboard({ initialMetrics }: { initialMetrics: DashboardMetrics }) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [lastUpdated, setLastUpdated] = useState(new Date(initialMetrics.fetchedAt));
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [flash, setFlash] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/metrics', { cache: 'no-store' });
      const data: DashboardMetrics = await res.json();
      setMetrics(data);
      setLastUpdated(new Date(data.fetchedAt));
      setCountdown(30);
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    } catch { /* silent */ }
    finally { setRefreshing(false); }
  }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  // Countdown ticker
  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  const { kanban, hr, docs, notifications, health } = metrics;
  const onlineCount = Object.values(health).filter((h) => h.ok).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(180deg, #0c1220 0%, #0f172a 100%)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        {/* Dot-grid background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(99,102,241,0.18) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          mask: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)',
          WebkitMask: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)',
        }} />
        <div style={{ position: 'relative', maxWidth: 1440, margin: '0 auto', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Logo + title */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(129,140,248,0.1) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🏢</div>
          <div>
            <h1 style={{
              fontSize: 19, fontWeight: 800, letterSpacing: '-0.025em',
              background: 'linear-gradient(90deg, #e2e8f0 10%, #818cf8 90%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Enterprise Command Center
            </h1>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              {onlineCount} / 4 services online
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="live-dot" />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', letterSpacing: '0.06em' }}>LIVE</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Refresh in{' '}
              <span style={{ color: countdown <= 5 ? 'var(--warning)' : 'var(--text-muted)', fontWeight: countdown <= 5 ? 700 : 400 }}>
                {countdown}s
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={refresh}
              disabled={refreshing}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7,
                color: 'var(--text-muted)', padding: '6px 12px', fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                opacity: refreshing ? 0.6 : 1, transition: 'opacity 0.2s',
              }}
            >
              <span className={refreshing ? 'spin' : ''} style={{ display: 'inline-block' }}>↻</span>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────── */}
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 32px 48px' }}>

        {/* Flash overlay on refresh */}
        {flash && (
          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
            background: 'rgba(99,102,241,0.04)',
            animation: 'fade-up 0.6s ease-out',
          }} />
        )}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <KpiCard
            icon="📋" label="TASKS IN PROGRESS" color="#6366f1" online={health.kanban.ok}
            value={kanban?.inProgress ?? null}
            sub={kanban ? `${kanban.totalCards} total cards · ${kanban.done} done` : ''}
          />
          <KpiCard
            icon="👥" label="ACTIVE EMPLOYEES" color="#34d399" online={health.hr.ok}
            value={hr?.activeEmployees ?? null}
            sub={hr ? `${hr.totalEmployees} total · ${hr.onLeave} on leave · ${hr.pendingLeaves} pending requests` : ''}
          />
          <KpiCard
            icon="📁" label="DOCUMENTS" color="#fbbf24" online={health.docs.ok}
            value={docs?.totalDocuments ?? null}
            sub={docs ? `across ${docs.totalFolders} folders` : ''}
          />
          <KpiCard
            icon="🔔" label="UNREAD ALERTS" color="#f43f5e" online={health.notifications.ok}
            value={notifications?.unread ?? null}
            sub={notifications ? `${notifications.total} total · ${notifications.activeRules} active rules` : ''}
          />
        </div>

        {/* Charts (dynamically imported, SSR-disabled) */}
        <Charts kanban={kanban} hr={hr} notifications={notifications} />

        {/* Service Health + Quick Launch */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>

          {/* Service Health */}
          <div className="card fade-up">
            <h2 style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.09em', marginBottom: 14 }}>
              SERVICE HEALTH
            </h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <HealthBadge name="Kanban"    icon="📋" health={health.kanban} />
              <HealthBadge name="HR Portal" icon="👥" health={health.hr} />
              <HealthBadge name="Docs"      icon="📁" health={health.docs} />
              <HealthBadge name="Alerts"    icon="🔔" health={health.notifications} />
            </div>
          </div>

          {/* Quick Launch */}
          <div className="card fade-up">
            <h2 style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.09em', marginBottom: 14 }}>
              QUICK LAUNCH
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {APP_LINKS.map((app) => (
                <a
                  key={app.port}
                  href={`http://localhost:${app.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px',
                    border: '1px solid var(--border)',
                    textDecoration: 'none', color: 'var(--text)', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = app.color)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <span style={{ fontSize: 20 }}>{app.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>:{app.port} · {app.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Enterprise Platform · 4 microservices · Next.js 15
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Data as of {new Date(metrics.fetchedAt).toLocaleString()}
          </div>
        </div>
      </main>
    </div>
  );
}
