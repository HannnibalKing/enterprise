import { notFound } from 'next/navigation';
import { getPatronById } from '@/lib/queries';
import type { PatronTier } from '@/lib/types';

export const dynamic = 'force-dynamic';

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n.toLocaleString()}`;

const TIER_STYLE: Record<PatronTier, React.CSSProperties> = {
  noir:     { background: '#c9a227', color: '#000', padding: '3px 12px', borderRadius: 20, fontWeight: 800 },
  diamond:  { background: 'rgba(185,242,255,0.12)', color: '#b9f2ff', padding: '3px 12px', borderRadius: 20 },
  platinum: { background: 'rgba(229,228,226,0.12)', color: '#e5e4e2', padding: '3px 12px', borderRadius: 20 },
  gold:     { background: 'rgba(255,215,0,0.12)',    color: '#ffd700', padding: '3px 12px', borderRadius: 20 },
  silver:   { background: 'rgba(192,192,192,0.12)', color: '#c0c0c0', padding: '3px 12px', borderRadius: 20 },
  bronze:   { background: 'rgba(205,127,50,0.12)',  color: '#cd7f32', padding: '3px 12px', borderRadius: 20 },
};

interface Props { params: Promise<{ id: string }> }

export default async function PatronDetailPage({ params }: Props) {
  const { id } = await params;
  const result = getPatronById(id);
  if (!result) notFound();
  const { patron: p, visits, host } = result;

  return (
    <div className="page-content">
      {/* Back */}
      <a href="/patrons" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        ← All Patrons
      </a>

      {/* Header card */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)', border: '1px solid var(--border-gold)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #c9a227 0%, #f0cc4a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 900, color: '#000',
          }}>
            {p.firstName[0]}{p.lastName[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {p.firstName} {p.lastName}
              </h1>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', ...TIER_STYLE[p.tier] }}>
                {p.tier}
              </span>
              {p.onProperty && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>
                  <span className="status-dot active" /> On Property
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span>{p.memberId}</span>
              <span>{p.nationality}</span>
              <span>{p.email}</span>
              <span>{p.phone}</span>
              {p.roomNumber && <span style={{ color: 'var(--gold)' }}>Room {p.roomNumber}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold-light)', letterSpacing: '-0.02em' }}>{fmt(p.lifetimeValue)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lifetime Value</div>
          </div>
        </div>
      </div>

      {/* Value + Gaming stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'YTD Value', value: fmt(p.ytdValue) },
          { label: 'Avg Daily Theoretical', value: fmt(p.avgDailyTheoretical) },
          { label: 'Comp Balance', value: fmt(p.compBalance), gold: true },
          { label: 'Lifetime Comps', value: fmt(p.lifetimeComps) },
        ].map(k => (
          <div className="kpi" key={k.label} style={k.gold ? { borderColor: 'var(--border-gold)' } : {}}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={k.gold ? { color: 'var(--gold-light)' } : {}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Details + tags */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>Patron <span style={{ color: 'var(--gold)' }}>Profile</span></div>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px' }}>
            {[
              ['Member Since', p.joinDate],
              ['Visits', `${p.visitCount} total`],
              ['Last Visit', p.lastVisitDate],
              ['Preferred Games', p.preferredGames.join(', ')],
              ['Drink Preference', p.drinkPreference ?? '—'],
              ['Room Preference', p.preferredRoomType ?? '—'],
              ['Credit Line', p.creditLine ? fmt(p.creditLine) : 'None'],
              ['Credit Used', p.creditUsed ? fmt(p.creditUsed) : '—'],
              ['Assigned Host', host?.name ?? '—'],
            ].map(([k, v]) => (
              <>
                <dt key={`k-${k}`} style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{k}</dt>
                <dd key={`v-${k}`} style={{ fontSize: 13, color: 'var(--text)' }}>{v}</dd>
              </>
            ))}
          </dl>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>VIP <span style={{ color: 'var(--gold)' }}>Services & Notes</span></div>
          {p.vipServices.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {p.vipServices.map(s => (
                <span key={s} style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  background: 'var(--gold-dim)', border: '1px solid var(--border-gold)', color: 'var(--gold)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {s.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}
          {p.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {p.tags.map(t => (
                <span key={t} style={{
                  fontSize: 11, padding: '3px 9px', borderRadius: 20,
                  background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}
          {p.notes && (
            <p style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
              {p.notes}
            </p>
          )}
        </div>
      </div>

      {/* Visit history */}
      {visits.length > 0 && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">Visit <span style={{ color: 'var(--gold)' }}>History</span></div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{visits.length} recorded visits</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Arrival</th>
                <th>Departure</th>
                <th>Days</th>
                <th>GGR</th>
                <th>Comps Used</th>
                <th>Primary Game</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {visits.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{v.arrivalDate}</td>
                  <td>{v.departureDate}</td>
                  <td>{v.durationDays}d</td>
                  <td style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{fmt(v.ggr)}</td>
                  <td>{fmt(v.compsUsed)}</td>
                  <td>{v.primaryGame}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300 }}>{v.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
