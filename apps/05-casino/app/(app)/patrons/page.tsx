import { getPatrons } from '@/lib/queries';
import type { PatronTier } from '@/lib/types';

export const dynamic = 'force-dynamic';

const TIER_ORDER: PatronTier[] = ['noir', 'diamond', 'platinum', 'gold', 'silver', 'bronze'];

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n.toLocaleString()}`;

const TIER_STYLE: Record<PatronTier, React.CSSProperties> = {
  noir:     { background: '#c9a227', color: '#000', padding: '2px 10px', borderRadius: 20, fontWeight: 800 },
  diamond:  { color: '#b9f2ff' },
  platinum: { color: '#e5e4e2' },
  gold:     { color: '#ffd700' },
  silver:   { color: '#c0c0c0' },
  bronze:   { color: '#cd7f32' },
};

export default async function PatronsPage() {
  const allPatrons = getPatrons({ sortBy: 'lifetimeValue' });

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Patron <span style={{ color: 'var(--gold)' }}>Database</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {allPatrons.length} registered patrons · {allPatrons.filter(p => p.onProperty).length} on property now
        </div>
      </div>

      {/* Tier sections */}
      {TIER_ORDER.map(tier => {
        const group = allPatrons.filter(p => p.tier === tier);
        if (!group.length) return null;
        return (
          <div key={tier} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
              {tier.toUpperCase()} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({group.length})</span>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patron</th>
                    <th>Member ID</th>
                    <th>Nationality</th>
                    <th>Lifetime Value</th>
                    <th>YTD Value</th>
                    <th>ADT</th>
                    <th>Visits</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map(p => (
                    <tr key={p.id} style={{ cursor: 'pointer' }}>
                      <td>
                        <a href={`/patrons/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, color: '#000',
                          }}>
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>
                              {p.firstName} {p.lastName}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.email}</div>
                          </div>
                        </a>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.memberId}</td>
                      <td>{p.nationality}</td>
                      <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{fmt(p.lifetimeValue)}</td>
                      <td>{fmt(p.ytdValue)}</td>
                      <td>{fmt(p.avgDailyTheoretical)}</td>
                      <td>{p.visitCount}</td>
                      <td>
                        {p.onProperty ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>
                            <span className="status-dot active" /> On Property
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Off Property</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
