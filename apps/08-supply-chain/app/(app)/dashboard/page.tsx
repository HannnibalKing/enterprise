import {getDashboardData} from '@/lib/queries';
export const dynamic='force-dynamic';
const fmtB=(n:number)=>n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
const MODE_ICON: Record<string,string>={ocean:'🚢',air:'✈️',ground:'🚛',rail:'🚂'};
const STATUS_COLOR: Record<string,string>={in_transit:'var(--blue)',at_port:'var(--yellow)',customs:'var(--yellow)',delivered:'var(--green)',delayed:'var(--red)',exception:'var(--red)'};
const SEV_COLOR: Record<string,string>={critical:'#f87171',high:'#fb923c',medium:'#fbbf24',low:'#34d399'};
export default async function DashboardPage(){
  const {metrics:m,alerts,snapshots,shipments,warehouses}=getDashboardData();
  return(
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Supply Chain <span style={{color:'var(--accent)'}}>Overview</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
      </div>
      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,marginBottom:22}}>
        <div className="kpi card-accent"><div className="kpi-label">Active Shipments</div><div className="kpi-value" style={{color:'var(--accent)'}}>{m.activeShipments}</div><div className="kpi-sub">{fmtB(m.inTransitValue)} in transit</div></div>
        <div className="kpi"><div className="kpi-label">Delayed</div><div className="kpi-value" style={{color:m.delayedShipments>0?'var(--red)':'var(--green)'}}>{m.delayedShipments}</div><div className="kpi-sub">shipments</div></div>
        <div className="kpi"><div className="kpi-label">On-Time %</div><div className="kpi-value" style={{color:m.onTimeDeliveryPct>=90?'var(--green)':'var(--yellow)'}}>{m.onTimeDeliveryPct.toFixed(1)}%</div><div className="kpi-sub">supplier avg</div></div>
        <div className="kpi"><div className="kpi-label">Inventory</div><div className="kpi-value">{fmtB(m.totalInventoryValue)}</div><div className="kpi-sub">6 warehouses</div></div>
        <div className="kpi"><div className="kpi-label">Open Orders</div><div className="kpi-value">{m.openOrders}</div><div className="kpi-sub">{fmtB(m.openOrdersValue)} value</div></div>
        <div className="kpi"><div className="kpi-label">Monthly Throughput</div><div className="kpi-value">{fmtB(m.monthlyThroughputUSD)}</div><div className="kpi-sub">CO₂ saved: {(m.co2Saved/1000).toFixed(0)}t</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:18,marginBottom:18}}>
        {/* Recent shipments */}
        <div className="card">
          <div className="section-title">Recent <span>Shipments</span></div>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Mode</th><th>Route</th><th>Carrier</th><th>Value</th><th>ETA</th><th>Status</th></tr></thead>
            <tbody>
              {shipments.map(s=>(
                <tr key={s.id}>
                  <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)'}}>{s.trackingNo.slice(-8)}</td>
                  <td><span style={{fontSize:16}}>{MODE_ICON[s.mode]??'📦'}</span></td>
                  <td style={{fontSize:11}}>{s.origin.split(',')[1]?.trim()??s.origin} → {s.destination.split(',')[1]?.trim()??s.destination}</td>
                  <td style={{fontSize:11,color:'var(--text-soft)'}}>{s.carrier}</td>
                  <td style={{fontWeight:700}}>{fmtB(s.valueUSD)}</td>
                  <td style={{fontFamily:'monospace',fontSize:11}}>{s.etaDate}</td>
                  <td><span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:`${STATUS_COLOR[s.status]}15`,color:STATUS_COLOR[s.status],textTransform:'uppercase'}}>{s.status.replace('_',' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Alerts */}
        <div className="card">
          <div className="section-title">Active <span>Alerts</span> <span style={{fontSize:12,color:'var(--red)',fontWeight:700}}>{alerts.length}</span></div>
          {alerts.map(a=>(
            <div key={a.id} style={{marginBottom:9,padding:'10px 12px',borderRadius:7,background:'var(--surface2)',border:`1px solid ${SEV_COLOR[a.severity]}22`}}>
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:SEV_COLOR[a.severity],display:'inline-block'}}/>
                <span style={{fontSize:11,fontWeight:800,color:SEV_COLOR[a.severity],textTransform:'uppercase'}}>{a.severity}</span>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:2}}>{a.title}</div>
              <div style={{fontSize:11,color:'var(--text-muted)',lineHeight:1.5}}>{a.message.slice(0,80)}…</div>
            </div>
          ))}
        </div>
      </div>
      {/* Warehouse fill levels */}
      <div className="card">
        <div className="section-title">Warehouse <span>Fill Levels</span></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {warehouses.map(w=>{
            const c=w.fillPct>=90?'var(--red)':w.fillPct>=75?'var(--yellow)':'var(--green)';
            return <div key={w.id} style={{padding:'12px 14px',background:'var(--surface2)',borderRadius:8,border:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{w.name.split(' ').slice(0,2).join(' ')}</div>
                <span style={{fontSize:12,fontWeight:800,color:c}}>{w.fillPct}%</span>
              </div>
              <div style={{height:5,borderRadius:3,background:'var(--surface3)',overflow:'hidden',marginBottom:5}}>
                <div style={{height:'100%',width:`${w.fillPct}%`,background:c,borderRadius:3}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text-muted)'}}>
                <span>{w.location.split(',')[1]?.trim()??w.location}</span>
                <span>{fmtB(w.valueUSD)}</span>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
