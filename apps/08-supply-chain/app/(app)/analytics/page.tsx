import {getAnalyticsData} from '@/lib/queries';
export const dynamic='force-dynamic';
const fmtB=(n:number)=>n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
export default async function AnalyticsPage(){
  const {snapshots,metrics:m,shipments,suppliers}=getAnalyticsData();
  const last30=snapshots.slice(-30);
  const last90=snapshots;
  const totalShipped90=last90.reduce((s,x)=>s+x.shipmentsOut,0);
  const avgTransit=+(last90.reduce((s,x)=>s+x.avgTransitDays,0)/last90.length).toFixed(1);
  const totalOrders90=last90.reduce((s,x)=>s+x.ordersPlaced,0);
  const maxDay=last90.reduce((a,b)=>b.shipmentsIn>a.shipmentsIn?b:a);
  const modeBreakdown: Record<string,number>={ocean:0,air:0,ground:0,rail:0};
  for(const s of shipments) modeBreakdown[s.mode]=(modeBreakdown[s.mode]??0)+1;
  const total=shipments.length;
  return(
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Supply Chain <span style={{color:'var(--accent)'}}>Analytics</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{last90.length} days · {shipments.length} shipments tracked</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[
          {label:'Total Shipped (90d)', value:totalShipped90, note:'shipments', c:'var(--accent)'},
          {label:'Avg Transit Time',    value:`${avgTransit}d`, note:'all modes', c:'var(--text)'},
          {label:'Total Orders (90d)',  value:totalOrders90, note:'placed',    c:'var(--blue)'},
          {label:'Peak Day',           value:maxDay.shipmentsIn, note:maxDay.date, c:'var(--green)'},
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color:k.c}}>{k.value}</div>
            <div className="kpi-sub">{k.note}</div>
          </div>
        ))}
      </div>
      {/* 90-day throughput chart (CSS bar chart) */}
      <div className="card" style={{marginBottom:18}}>
        <div className="section-title">90-Day <span>Shipment Throughput</span></div>
        <div style={{display:'flex',alignItems:'flex-end',gap:2,height:90}}>
          {last90.map((s,i)=>{
            const maxV=Math.max(...last90.map(x=>x.shipmentsIn+x.shipmentsOut));
            const h=Math.round(((s.shipmentsIn+s.shipmentsOut)/maxV)*90);
            return <div key={i} title={`${s.date}: ${s.shipmentsIn} in / ${s.shipmentsOut} out`} style={{flex:1,height:`${h}px`,background:'linear-gradient(to top,var(--accent),var(--accent2))',borderRadius:'2px 2px 0 0',opacity:0.7,cursor:'pointer'}}/>;
          })}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:10,color:'var(--text-muted)'}}>
          <span>{last90[0]?.date}</span><span>daily shipments in+out</span><span>{last90[last90.length-1]?.date}</span>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        {/* Transport mode breakdown */}
        <div className="card">
          <div className="section-title">Transport Mode <span>Mix</span></div>
          {Object.entries(modeBreakdown).map(([mode,cnt])=>{
            const pct=Math.round((cnt/total)*100);
            const ICON: Record<string,string>={ocean:'🚢',air:'✈️',ground:'🚛',rail:'🚂'};
            return <div key={mode} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:12,color:'var(--text-soft)'}}>{ICON[mode]} {mode.charAt(0).toUpperCase()+mode.slice(1)}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{cnt} ({pct}%)</span>
              </div>
              <div style={{height:6,borderRadius:3,background:'var(--surface3)',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${pct}%`,background:'var(--accent)',borderRadius:3}}/>
              </div>
            </div>;
          })}
        </div>
        {/* Supplier performance table */}
        <div className="card">
          <div className="section-title">Supplier <span>Performance</span></div>
          <table className="data-table">
            <thead><tr><th>Supplier</th><th>OTD %</th><th>Quality</th><th>Risk</th><th>YTD Spend</th></tr></thead>
            <tbody>
              {suppliers.map(s=>(
                <tr key={s.id}>
                  <td style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{s.name.split(' ').slice(0,2).join(' ')}</td>
                  <td style={{fontWeight:700,color:s.onTimeDeliveryPct>=90?'var(--green)':s.onTimeDeliveryPct>=75?'var(--yellow)':'var(--red)'}}>{s.onTimeDeliveryPct.toFixed(1)}%</td>
                  <td style={{color:s.qualityScore>=90?'var(--green)':'var(--yellow)'}}>{s.qualityScore}/100</td>
                  <td style={{color:s.riskScore>=50?'var(--red)':s.riskScore>=25?'var(--yellow)':'var(--green)'}}>{s.riskScore}</td>
                  <td style={{fontWeight:700}}>{fmtB(s.ytdSpendUSD)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
