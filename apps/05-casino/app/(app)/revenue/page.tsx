import { getRevenueData } from '@/lib/queries';
import RevenueChartsLoader from '@/components/RevenueChartsLoader';

export const dynamic = 'force-dynamic';

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n.toLocaleString()}`;

export default async function RevenuePage() {
  const data = getRevenueData();

  const mtd = data.daily.filter(d => d.date.startsWith(new Date().toISOString().slice(0, 7)));
  const mtdTotal = mtd.reduce((s, d) => s + d.totalGGR, 0);
  const ytd = data.daily.reduce((s, d) => s + d.totalGGR, 0);
  const avgDaily = Math.round(ytd / data.daily.length);

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Revenue <span style={{ color: 'var(--gold)' }}>Analytics</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Gaming revenue performance — last 60 days
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="kpi kpi-gold">
          <div className="kpi-label">Today's GGR</div>
          <div className="kpi-value">{fmt(data.today?.totalGGR ?? 0)}</div>
          <div className="kpi-sub">Table + Slot combined</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Month to Date</div>
          <div className="kpi-value">{fmt(mtdTotal)}</div>
          <div className="kpi-sub">{mtd.length} days recorded</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">60-Day Total</div>
          <div className="kpi-value">{fmt(ytd)}</div>
          <div className="kpi-sub">All revenue categories</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Daily GGR</div>
          <div className="kpi-value">{fmt(avgDaily)}</div>
          <div className="kpi-sub">60-day average</div>
        </div>
      </div>

      <RevenueChartsLoader daily={data.daily} monthly={data.monthly} gameMix={data.gameMix} />
    </div>
  );
}
