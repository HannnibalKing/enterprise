import { getDashboardData } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const LINE_STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  running:     {bg:'var(--green-dim)',       color:'var(--green)'},
  idle:        {bg:'rgba(255,255,255,0.05)', color:'var(--text-muted)'},
  maintenance: {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
  fault:       {bg:'var(--red-dim)',         color:'var(--red)'},
  changeover:  {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
};
const QC_STYLE: Record<string,{bg:string;color:string}> = {
  pass:        {bg:'var(--green-dim)',       color:'var(--green)'},
  fail:        {bg:'var(--red-dim)',         color:'var(--red)'},
  conditional: {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
};
export default async function DashboardPage() {
  const { metrics: m, productionLines, recentQuality, criticalMaterials, snapshots } = getDashboardData();
  const maxUnits = Math.max(...snapshots.map(s=>s.unitsProduced),1);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:22,fontWeight:900,letterSpacing:'0.04em',marginBottom:3}}>Plant <span style={{color:'var(--accent)'}}>Floor</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{m.totalLines} production lines · Live shift data</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[
          {label:'Plant OEE',          value:`${m.plantOEE}%`,         note:'overall equipment effectiveness', c:m.plantOEE>=80?'var(--green)':m.plantOEE>=60?'var(--yellow)':'var(--red)'},
          {label:'Running Lines',      value:`${m.runningLines}/${m.totalLines}`, note:'production lines',      c:'var(--accent)'},
          {label:'Units Today',        value:m.unitsToday.toLocaleString(),    note:'shift output',             c:'var(--text)'},
          {label:'Scrap Rate',         value:`${m.scrapRatePct}%`,             note:'quality loss',             c:m.scrapRatePct>3?'var(--red)':'var(--green)'},
          {label:'Active Work Orders', value:m.activeWorkOrders,              note:'in progress',              c:'var(--blue)'},
          {label:'Quality Issues',     value:m.openQualityIssues,             note:'failed checks',            c:m.openQualityIssues>0?'var(--red)':'var(--green)'},
          {label:'Critical Materials', value:m.criticalMaterials,             note:'low/out of stock',         c:m.criticalMaterials>2?'var(--red)':'var(--yellow)'},
          {label:'Unplanned Downtime', value:`${m.unplannedDowntimeToday}min`, note:'today',                   c:m.unplannedDowntimeToday>60?'var(--red)':'var(--yellow)'},
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color:k.c}}>{k.value}</div>
            <div className="kpi-sub">{k.note}</div>
          </div>
        ))}
      </div>
      {/* 24h production bar chart */}
      <div className="card" style={{marginBottom:18}}>
        <div className="section-title">24-Hour <span>Production Output</span></div>
        <div style={{display:'flex',alignItems:'flex-end',gap:3,height:80}}>
          {snapshots.map((s,i)=>{
            const h=Math.max(2,Math.round((s.unitsProduced/maxUnits)*80));
            const active=i>=6&&i<=22;
            return <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <div title={`${s.hour}: ${s.unitsProduced} units`} style={{width:'100%',height:`${h}px`,background:active?'linear-gradient(to top,var(--accent2),var(--accent))':'var(--surface3)',borderRadius:'2px 2px 0 0',opacity:0.85}}/>
              {i%4===0&&<div style={{fontSize:8,color:'var(--text-muted)'}}>{s.hour}</div>}
            </div>;
          })}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:18}}>
        <div className="card">
          <div className="section-title">Line <span>Status</span></div>
          <table className="data-table">
            <thead><tr><th>Line</th><th>Product</th><th>OEE</th><th>Actual vs Target</th><th>Shift Output</th><th>Downtime</th><th>Status</th></tr></thead>
            <tbody>
              {productionLines.map(l=>{
                const ss=LINE_STATUS_STYLE[l.status];
                const oeeC=l.oee>=80?'var(--green)':l.oee>=60?'var(--yellow)':'var(--red)';
                return <tr key={l.id}>
                  <td style={{fontWeight:800,color:'var(--accent)',fontFamily:'monospace'}}>{l.name}</td>
                  <td style={{fontSize:11,color:'var(--text)',maxWidth:140}}>{l.product.slice(0,20)}</td>
                  <td style={{fontWeight:700,color:oeeC}}>{l.oee}%</td>
                  <td style={{fontFamily:'monospace',fontSize:11}}>{l.actualUnitsPerHour}/{l.targetUnitsPerHour} u/h</td>
                  <td style={{fontFamily:'monospace'}}>{l.shiftUnitsActual.toLocaleString()}</td>
                  <td style={{color:l.downtimeMinutesToday>20?'var(--red)':'var(--text-muted)',fontFamily:'monospace'}}>{l.downtimeMinutesToday}m</td>
                  <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{l.status}</span></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <div className="card">
            <div className="section-title">Quality <span>Alerts</span></div>
            {recentQuality.map(q=>{
              const qs=QC_STYLE[q.result];
              return <div key={q.id} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{q.checkType}</div>
                  <span className="badge" style={{background:qs.bg,color:qs.color}}>{q.result}</span>
                </div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{q.product.slice(0,22)} · {q.defectRate}% defect rate</div>
              </div>;
            })}
          </div>
          <div className="card" style={{flex:1}}>
            <div className="section-title">Material <span>Alerts</span></div>
            {criticalMaterials.map(mat=>(
              <div key={mat.id} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{mat.name.slice(0,22)}</div>
                  <span className="badge" style={{background:mat.status==='out_of_stock'?'var(--red-dim)':'var(--yellow-dim)',color:mat.status==='out_of_stock'?'var(--red)':'var(--yellow)'}}>{mat.status.replace('_',' ')}</span>
                </div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{mat.daysOfSupply}d supply · reorder {mat.reorderQty} units</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
