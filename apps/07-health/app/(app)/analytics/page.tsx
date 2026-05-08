import { getCensusData } from '@/lib/queries';
export const dynamic = 'force-dynamic';
export default async function AnalyticsPage() {
  const { snapshots, metrics:m } = getCensusData();
  const last30 = snapshots.slice(-30);
  const last90 = snapshots;
  const avgOcc  = +(last90.reduce((s,x)=>s+x.occupancyPct,0)/last90.length).toFixed(1);
  const peakCensus = Math.max(...last90.map(s=>s.totalCensus));
  const totalAdmissions = last90.reduce((s,x)=>s+x.admissions,0);
  const totalER = last90.reduce((s,x)=>s+x.erVisits,0);
  const maxOcc  = last90.reduce((a,b)=>b.occupancyPct>a.occupancyPct?b:a);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Census <span style={{color:'var(--accent)'}}>Analytics</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{last90.length} days of data</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[
          {label:'Avg Occupancy',   value:`${avgOcc}%`,         note:'90-day average',  c:'var(--accent)'},
          {label:'Peak Census',     value:peakCensus,            note:`${maxOcc.date}`, c:'var(--red)'},
          {label:'Total Admissions',value:totalAdmissions.toLocaleString(), note:'90 days', c:'var(--text)'},
          {label:'ER Visits',       value:totalER.toLocaleString(),         note:'90 days', c:'var(--orange)'},
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color:k.c}}>{k.value}</div>
            <div className="kpi-sub">{k.note}</div>
          </div>
        ))}
      </div>
      {/* 90-day occupancy bar chart (pure CSS) */}
      <div className="card" style={{marginBottom:18}}>
        <div className="section-title">90-Day <span>Occupancy</span> Trend</div>
        <div style={{display:'flex',alignItems:'flex-end',gap:2,height:100}}>
          {last90.map((s,i)=>{
            const h=Math.round((s.occupancyPct/100)*100);
            const c=s.occupancyPct>=90?'var(--red)':s.occupancyPct>=75?'var(--yellow)':'var(--accent)';
            return <div key={i} title={`${s.date}: ${s.occupancyPct}% (${s.totalCensus})`} style={{flex:1,height:`${h}px`,background:c,borderRadius:'2px 2px 0 0',opacity:0.7,cursor:'pointer'}}/>;
          })}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:10,color:'var(--text-muted)'}}>
          <span>{last90[0]?.date}</span><span>occupancy %</span><span>{last90[last90.length-1]?.date}</span>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        {/* Daily admissions 30d */}
        <div className="card">
          <div className="section-title">30-Day <span>Admissions & Discharges</span></div>
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead><tr><th>Date</th><th>Census</th><th>Admissions</th><th>Discharges</th><th>ER Visits</th><th>Occ %</th></tr></thead>
              <tbody>
                {last30.slice(-14).reverse().map(s=>(
                  <tr key={s.date}>
                    <td style={{fontFamily:'monospace',fontSize:11}}>{s.date}</td>
                    <td style={{fontWeight:700,color:'var(--text)'}}>{s.totalCensus}</td>
                    <td style={{color:'var(--green)'}}>{s.admissions}</td>
                    <td style={{color:'var(--accent)'}}>{s.discharges}</td>
                    <td style={{color:'var(--orange)'}}>{s.erVisits}</td>
                    <td style={{fontWeight:700,color:s.occupancyPct>=90?'var(--red)':s.occupancyPct>=75?'var(--yellow)':'var(--green)'}}>{s.occupancyPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Current metrics snapshot */}
        <div className="card">
          <div className="section-title">Current <span>Snapshot</span></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {label:'Total Beds',       value:m.totalBeds,         c:'var(--text)'},
              {label:'Occupied Beds',    value:m.occupiedBeds,      c:'var(--accent)'},
              {label:'Available Beds',   value:m.availableBeds,     c:m.availableBeds<20?'var(--red)':'var(--green)'},
              {label:'Critical Patients',value:m.criticalPatients,  c:'var(--red)'},
              {label:'Staff On Duty',    value:m.staffOnDuty,       c:'var(--text)'},
              {label:'Pending Orders',   value:m.pendingOrders,     c:'var(--yellow)'},
              {label:"Today's Admits",   value:m.todayAdmissions,   c:'var(--green)'},
              {label:"Today's Discharges",value:m.todayDischarges,  c:'var(--accent)'},
            ].map(k=>(
              <div key={k.label} style={{padding:'10px 12px',background:'var(--surface2)',borderRadius:7,border:'1px solid var(--border)'}}>
                <div style={{fontSize:9,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-muted)',marginBottom:4}}>{k.label}</div>
                <div style={{fontSize:20,fontWeight:800,color:k.c}}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
