import { getDashboardData } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const SEVERITY_COLORS: Record<string,string> = {critical:'#f87171',urgent:'#fb923c',warning:'#fbbf24',info:'#38bdf8'};
export default async function DashboardPage() {
  const { metrics:m, alerts, last30snap, departments } = getDashboardData();
  const occPct = m.occupancyPct;
  const occColor = occPct>=90?'var(--red)':occPct>=75?'var(--yellow)':'var(--green)';
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Hospital <span style={{color:'var(--accent)'}}>Operations</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
      </div>
      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,marginBottom:22}}>
        <div className="kpi card-accent">
          <div className="kpi-label">Occupancy</div>
          <div className="kpi-value" style={{color:occColor}}>{m.occupancyPct.toFixed(1)}%</div>
          <div className="kpi-sub">{m.occupiedBeds}/{m.totalBeds} beds</div>
        </div>
        <div className="kpi"><div className="kpi-label">ER Queue</div><div className="kpi-value" style={{color:m.erQueueLength>=10?'var(--red)':'var(--text)'}}>{m.erQueueLength}</div><div className="kpi-sub">~{m.erAvgWaitMinutes}m avg wait</div></div>
        <div className="kpi"><div className="kpi-label">Critical</div><div className="kpi-value" style={{color:'var(--red)'}}>{m.criticalPatients}</div><div className="kpi-sub">Critical patients</div></div>
        <div className="kpi"><div className="kpi-label">Discharges</div><div className="kpi-value" style={{color:'var(--green)'}}>{m.plannedDischarges}</div><div className="kpi-sub">Ready today</div></div>
        <div className="kpi"><div className="kpi-label">Admissions</div><div className="kpi-value">{m.todayAdmissions}</div><div className="kpi-sub">Today</div></div>
        <div className="kpi"><div className="kpi-label">Staff On Duty</div><div className="kpi-value">{m.staffOnDuty}</div><div className="kpi-sub">{m.pendingOrders} pending orders</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:18,marginBottom:18}}>
        {/* Department cards */}
        <div className="card">
          <div className="section-title">Department <span>Status</span></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
            {departments.map(dept=>{
              const occ=Math.round((dept.occupiedBeds/dept.totalBeds)*100);
              const occC=occ>=90?'var(--red)':occ>=75?'var(--yellow)':'var(--green)';
              return <div key={dept.id} style={{padding:'12px 14px',borderRadius:8,background:'var(--surface2)',border:'1px solid var(--border)',borderLeft:`3px solid ${dept.color}`}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span>{dept.icon}</span>
                    <span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{dept.name}</span>
                  </div>
                  <span style={{fontSize:12,fontWeight:800,color:occC}}>{occ}%</span>
                </div>
                <div style={{height:5,borderRadius:3,background:'var(--surface3)',marginBottom:6,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${occ}%`,background:dept.color,borderRadius:3}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text-muted)'}}>
                  <span>{dept.occupiedBeds}/{dept.totalBeds} beds</span>
                  <span style={{color:dept.availableBeds===0?'var(--red)':'var(--text-muted)'}}>{dept.availableBeds} avail</span>
                </div>
              </div>;
            })}
          </div>
        </div>
        {/* Active alerts */}
        <div className="card">
          <div className="section-title">Active <span>Alerts</span> <span style={{fontSize:12,color:'var(--red)',fontWeight:700}}>{alerts.length}</span></div>
          <div style={{display:'flex',flexDirection:'column',gap:9}}>
            {alerts.length===0&&<div style={{color:'var(--text-muted)',fontSize:13}}>No active alerts</div>}
            {alerts.map(a=>(
              <div key={a.id} style={{padding:'10px 12px',borderRadius:7,background:'var(--surface2)',border:`1px solid ${SEVERITY_COLORS[a.severity]}25`}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                  <span style={{width:7,height:7,borderRadius:'50%',background:SEVERITY_COLORS[a.severity],display:'inline-block'}}/>
                  <span style={{fontSize:11,fontWeight:800,color:SEVERITY_COLORS[a.severity],textTransform:'uppercase'}}>{a.severity}</span>
                  {a.department&&<span style={{marginLeft:'auto',fontSize:10,color:'var(--accent)',fontWeight:600}}>{a.department}</span>}
                </div>
                <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:2}}>{a.title}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',lineHeight:1.5}}>{a.message.slice(0,80)}…</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 30-day census trend */}
      <div className="card">
        <div className="section-title">30-Day <span>Census Trend</span></div>
        <div style={{display:'flex',alignItems:'flex-end',gap:3,height:80}}>
          {last30snap.map((s,i)=>{
            const h=Math.round((s.occupancyPct/100)*80);
            const c=s.occupancyPct>=90?'var(--red)':s.occupancyPct>=75?'var(--yellow)':'var(--accent)';
            return <div key={i} title={`${s.date}: ${s.occupancyPct}% (${s.totalCensus} pts)`} style={{flex:1,height:`${h}px`,background:c,borderRadius:'2px 2px 0 0',opacity:0.8,transition:'height 0.3s',cursor:'pointer'}} />;
          })}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:10,color:'var(--text-muted)'}}>
          <span>{last30snap[0]?.date}</span><span>30-day occupancy %</span><span>{last30snap[last30snap.length-1]?.date}</span>
        </div>
      </div>
    </div>
  );
}
