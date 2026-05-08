import { getDashboardData } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n.toLocaleString()}`;

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

export default async function DashboardPage() {
  const d = getDashboardData();

  const tableActivePct = (d.activeTables / d.totalTables) * 100;

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Casino <span style={{ color: 'var(--gold)' }}>Intelligence</span> Dashboard
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Live operations — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="kpi kpi-gold">
          <div className="kpi-label">Today's Shift GGR</div>
          <div className="kpi-value">{fmt(d.todayGGR)}</div>
          <div className="kpi-sub">All positions combined</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Active Positions</div>
          <div className="kpi-value">{d.activeTables} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/ {d.totalTables}</span></div>
          <div className="kpi-sub">{fmtPct(tableActivePct)} of floor active</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">VIPs On Property</div>
          <div className="kpi-value">{d.vipsOnProperty.length}</div>
          <div className="kpi-sub">
            {d.vipsOnProperty.filter(p => p.tier === 'noir').length} Noir ·{' '}
            {d.vipsOnProperty.filter(p => p.tier === 'diamond').length} Diamond
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total Comp Balance</div>
          <div className="kpi-value">{fmt(d.totalCompBalance)}</div>
          <div className="kpi-sub">All active patrons</div>
        </div>
      </div>

      {/* Main grid: section summary + VIPs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>
        {/* Floor Section Summary */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Floor Section <span>Summary</span></div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Shift GGR</th>
                <th>Active</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(d.sections).map(sec => (
                <tr key={sec.label}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{sec.label}</td>
                  <td style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{fmt(sec.ggr)}</td>
                  <td>{sec.active} / {sec.total}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${sec.total > 0 ? (sec.active / sec.total) * 100 : 0}%`,
                          height: '100%', background: 'var(--gold)', borderRadius: 3,
                        }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>
                        {sec.total > 0 ? fmtPct((sec.active / sec.total) * 100) : '—'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VIPs on Property */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">On <span>Property</span></div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.vipsOnProperty.length} guests</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.vipsOnProperty.map(p => (
              <a href={`/patrons/${p.id}`} key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 10px', borderRadius: 7,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: '#000',
                }}>
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.firstName} {p.lastName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.roomNumber ?? 'No room'}</div>
                </div>
                <span className={`tier-${p.tier}`} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                  {p.tier}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 7-day Revenue Table */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">7-Day <span>Revenue Trend</span></div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Table GGR</th>
              <th>Slot GGR</th>
              <th>Total GGR</th>
              <th>Table Hold</th>
              <th>Slot Hold</th>
              <th>Headcount</th>
            </tr>
          </thead>
          <tbody>
            {[...d.last7].reverse().map(row => (
              <tr key={row.date}>
                <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {new Date(row.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </td>
                <td>{fmt(row.tableGGR)}</td>
                <td>{fmt(row.slotGGR)}</td>
                <td style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{fmt(row.totalGGR)}</td>
                <td>{row.tableHoldPct}%</td>
                <td>{row.slotHoldPct}%</td>
                <td>{row.headcount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
