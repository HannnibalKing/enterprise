import { getDashboardData } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const HEALTH: Record<string,{bg:string;color:string}> = {
  green: {bg:'var(--green-dim)',   color:'var(--green)'},
  amber: {bg:'var(--yellow-dim)',  color:'var(--yellow)'},
  red:   {bg:'var(--red-dim)',     color:'var(--red)'},
};
const MS_STATUS: Record<string,{bg:string;color:string}> = {
  complete:    {bg:'var(--green-dim)',  color:'var(--green)'},
  in_progress: {bg:'var(--cyan-dim)',  color:'var(--accent)'},
  at_risk:     {bg:'var(--yellow-dim)',color:'var(--yellow)'},
  overdue:     {bg:'var(--red-dim)',   color:'var(--red)'},
  not_started: {bg:'rgba(255,255,255,0.04)',color:'var(--text-muted)'},
};
const fmtM = (n:number) => `$${(n/1e6).toFixed(1)}M`;
export default async function DashboardPage() {
  const { metrics: m, topProjects, upcoming } = getDashboardData();
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:22,fontWeight:900,letterSpacing:'0.04em',marginBottom:3}}>Portfolio <span style={{color:'var(--accent)'}}>Overview</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{m.totalProjects} projects tracked · FY 2026</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[
          {l:'Active Projects',      v:m.activeProjects,          c:'var(--accent)'},
          {l:'On Track (Green)',      v:m.greenHealth,             c:'var(--green)'},
          {l:'At Risk (Amber)',       v:m.amberHealth,             c:'var(--yellow)'},
          {l:'Critical (Red)',        v:m.redHealth,               c:'var(--red)'},
          {l:'Total Budget',         v:fmtM(m.totalBudget),       c:'var(--text)'},
          {l:'YTD Spend',            v:fmtM(m.totalSpent),        c:'var(--accent)'},
          {l:'Resource Utilization', v:`${m.resourceUtilization}%`,c:m.resourceUtilization>90?'var(--red)':m.resourceUtilization>75?'var(--yellow)':'var(--green)'},
          {l:'Open Risks',           v:m.openRisks,               c:m.openRisks>10?'var(--red)':'var(--yellow)'},
        ].map(k=>(
          <div key={k.l} className="kpi">
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value" style={{color:k.c,fontSize:22}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:18}}>
        <div className="card">
          <div className="section-title">Top <span>Priority Projects</span></div>
          <table className="data-table">
            <thead><tr><th>Code</th><th>Project</th><th>Manager</th><th>Phase</th><th>Progress</th><th>Budget</th><th>Risks</th><th>Health</th></tr></thead>
            <tbody>
              {topProjects.map(p=>{
                const hs=HEALTH[p.health];
                return <tr key={p.id}>
                  <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)',fontWeight:700}}>{p.code}</td>
                  <td style={{fontSize:12,fontWeight:600,color:'var(--text)',maxWidth:160}}>{p.name.slice(0,22)}</td>
                  <td style={{fontSize:11}}>{p.manager}</td>
                  <td style={{fontSize:11,color:'var(--text-soft)'}}>{p.phase}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{flex:1,height:4,background:'var(--surface2)',borderRadius:2,minWidth:50}}>
                        <div style={{width:`${p.completionPct}%`,height:'100%',background:'var(--accent)',borderRadius:2}}/>
                      </div>
                      <div style={{fontFamily:'monospace',fontSize:10}}>{p.completionPct}%</div>
                    </div>
                  </td>
                  <td style={{fontFamily:'monospace',fontSize:11}}>{fmtM(p.budget)}</td>
                  <td style={{color:p.openRisks>3?'var(--red)':p.openRisks>1?'var(--yellow)':'var(--green)',fontFamily:'monospace',fontWeight:700}}>{p.openRisks}</td>
                  <td><span className="badge" style={{background:hs.bg,color:hs.color}}>{p.health}</span></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="section-title">Upcoming <span>Milestones</span></div>
          {upcoming.map(ms=>{
            const mss=MS_STATUS[ms.status];
            return <div key={ms.id} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{ms.name.slice(0,22)}</div>
                <span className="badge" style={{background:mss.bg,color:mss.color}}>{ms.status.replace('_',' ')}</span>
              </div>
              <div style={{fontSize:10,color:'var(--text-muted)'}}>{ms.projectName.slice(0,24)} · {ms.dueDate}</div>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
