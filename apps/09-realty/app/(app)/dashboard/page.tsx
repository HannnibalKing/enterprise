import { getDashboardData } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmt = (n: number) => n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${(n/1e3).toFixed(0)}K`;
const PRIO_COLOR: Record<string,string> = { critical:'var(--red)', high:'var(--yellow)', medium:'var(--accent)', low:'var(--text-muted)' };
const STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  open:          {bg:'rgba(248,113,113,0.10)', color:'var(--red)'},
  in_progress:   {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
  pending_parts: {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
  completed:     {bg:'var(--green-dim)',        color:'var(--green)'},
};
const LEASE_STYLE: Record<string,{bg:string;color:string}> = {
  active:        {bg:'var(--green-dim)',       color:'var(--green)'},
  expiring_soon: {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
  pending:       {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
};
export default async function DashboardPage() {
  const { metrics: m, lastMonth, recentWorkOrders, expiringLeases } = getDashboardData();
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:22,fontWeight:900,letterSpacing:'0.05em',marginBottom:3}}>Portfolio <span style={{color:'var(--accent)'}}>Overview</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{m.totalProperties} properties · {(m.totalSqFt/1e6).toFixed(1)}M sqft under management</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[
          {label:'Portfolio Value',    value:fmt(m.portfolioValue),               note:'total AUM',              c:'var(--accent)'},
          {label:'Annual NOI',         value:fmt(m.annualNOI),                    note:'net operating income',   c:'var(--gold)'},
          {label:'Avg Occupancy',      value:`${m.avgOccupancy}%`,               note:'portfolio-wide',         c:'var(--green)'},
          {label:'Weighted Cap Rate',  value:`${m.weightedCapRate}%`,            note:'blended',                c:'var(--text)'},
          {label:'Total Sq Ft',        value:`${(m.totalSqFt/1e6).toFixed(1)}M`, note:'commercial only',        c:'var(--blue)'},
          {label:'Leases Expiring 90d',value:m.leasesExpiring90d,               note:'require attention',      c:'var(--yellow)'},
          {label:'Open Work Orders',   value:m.openWorkOrders,                   note:'maintenance',            c:m.openWorkOrders>10?'var(--red)':'var(--text)'},
          {label:'Last Month NOI',     value:fmt(lastMonth.noi),                 note:`${(lastMonth.collectionRate).toFixed(1)}% collection`, c:'var(--green)'},
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color:k.c}}>{k.value}</div>
            <div className="kpi-sub">{k.note}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:18}}>
        <div className="card">
          <div className="section-title">Recent <span>Work Orders</span></div>
          <table className="data-table">
            <thead><tr><th>WO #</th><th>Property</th><th>Category</th><th>Priority</th><th>Status</th><th>Est. Cost</th></tr></thead>
            <tbody>
              {recentWorkOrders.map(w=>{
                const ss=STATUS_STYLE[w.status]??{bg:'',color:'var(--text-muted)'};
                return <tr key={w.id}>
                  <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)'}}>{w.id}</td>
                  <td style={{fontSize:12}}>{w.propertyName.split(' ').slice(0,2).join(' ')}</td>
                  <td>{w.category}</td>
                  <td style={{fontWeight:700,color:PRIO_COLOR[w.priority]}}>{w.priority}</td>
                  <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{w.status.replace('_',' ')}</span></td>
                  <td style={{fontFamily:'monospace'}}>${w.estimatedCost.toLocaleString()}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="section-title">Leases <span>Expiring Soon</span></div>
          {expiringLeases.length === 0 ? <div style={{color:'var(--text-muted)',fontSize:12}}>No leases expiring soon</div> :
          expiringLeases.map(l=>{
            const ls=LEASE_STYLE[l.status]??{bg:'',color:'var(--text-muted)'};
            return <div key={l.id} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{l.tenantName}</div>
                <span className="badge" style={{background:ls.bg,color:ls.color}}>{l.status.replace('_',' ')}</span>
              </div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>{l.propertyName.split(' ').slice(0,2).join(' ')} · {l.unit}</div>
              <div style={{fontSize:11,color:'var(--text-soft)',marginTop:2}}>Expires {l.leaseEnd} · ${l.monthlyRent.toLocaleString()}/mo</div>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
