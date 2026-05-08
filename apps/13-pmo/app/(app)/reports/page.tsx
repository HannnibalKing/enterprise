import { getReports } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtM = (n:number) => `$${(n/1e6).toFixed(2)}M`;
export default async function ReportsPage() {
  const { projects, resources, milestones } = getReports();
  const depts = [...new Set(resources.map(r=>r.department))];
  const statuses = ['active','planning','on_hold','complete','cancelled'] as const;
  const totalBudget = projects.reduce((s,p)=>s+p.budget,0);
  const totalSpent = projects.reduce((s,p)=>s+p.spent,0);
  const milestoneCmpl = Math.round(milestones.filter(m=>m.status==='complete').length/milestones.length*100);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Portfolio <span style={{color:'var(--accent)'}}>Reports</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>Executive summary · FY 2026</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:18}}>
        {/* Project Status Distribution */}
        <div className="card">
          <div className="section-title">Project <span>Status Distribution</span></div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {statuses.map(s=>{
              const cnt=projects.filter(p=>p.status===s).length;
              const pct=Math.round(cnt/projects.length*100);
              const c=s==='active'?'var(--accent)':s==='complete'?'var(--green)':s==='on_hold'?'var(--yellow)':s==='cancelled'?'var(--red)':'var(--blue)';
              return <div key={s}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <div style={{fontSize:12,fontWeight:600,textTransform:'capitalize'}}>{s.replace('_',' ')}</div>
                  <div style={{fontFamily:'monospace',fontSize:11}}>{cnt} ({pct}%)</div>
                </div>
                <div style={{width:'100%',height:6,background:'var(--surface2)',borderRadius:3}}>
                  <div style={{width:`${pct}%`,height:'100%',background:c,borderRadius:3}}/>
                </div>
              </div>;
            })}
          </div>
        </div>
        {/* Budget Summary */}
        <div className="card">
          <div className="section-title">Budget <span>Summary</span></div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[
              {l:'Total Portfolio Budget', v:fmtM(totalBudget), c:'var(--text)'},
              {l:'Total YTD Spend',        v:fmtM(totalSpent),  c:'var(--accent)'},
              {l:'Budget Remaining',       v:fmtM(totalBudget-totalSpent), c:'var(--green)'},
              {l:'Spend Rate',             v:`${Math.round(totalSpent/totalBudget*100)}%`, c:'var(--yellow)'},
            ].map(k=>(
              <div key={k.l} style={{display:'flex',justifyContent:'space-between',padding:'10px 12px',background:'var(--surface2)',borderRadius:7}}>
                <div style={{fontSize:12,color:'var(--text-soft)'}}>{k.l}</div>
                <div style={{fontWeight:800,color:k.c,fontFamily:'monospace'}}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Dept Utilization */}
        <div className="card">
          <div className="section-title">Resource <span>by Department</span></div>
          {depts.map(d=>{
            const res=resources.filter(r=>r.department===d);
            const avgUtil=Math.round(res.reduce((s,r)=>s+r.utilization,0)/res.length);
            const c=avgUtil>90?'var(--red)':avgUtil>75?'var(--yellow)':'var(--green)';
            return <div key={d}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <div style={{fontSize:12,fontWeight:600}}>{d}</div>
                <div style={{fontFamily:'monospace',fontSize:11,color:c,fontWeight:700}}>{avgUtil}%</div>
              </div>
              <div style={{width:'100%',height:5,background:'var(--surface2)',borderRadius:3,marginBottom:8}}>
                <div style={{width:`${avgUtil}%`,height:'100%',background:c,borderRadius:3}}/>
              </div>
            </div>;
          })}
        </div>
        {/* Milestones health */}
        <div className="card">
          <div className="section-title">Milestone <span>Health</span></div>
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column',gap:8,padding:'10px 0'}}>
            <div style={{fontSize:48,fontWeight:900,color:'var(--accent)',lineHeight:1}}>{milestoneCmpl}%</div>
            <div style={{fontSize:12,color:'var(--text-muted)'}}>milestones complete</div>
          </div>
          {(['complete','in_progress','at_risk','overdue'] as const).map(s=>{
            const cnt=milestones.filter(m=>m.status===s).length;
            const pct=Math.round(cnt/milestones.length*100);
            const c=s==='complete'?'var(--green)':s==='in_progress'?'var(--accent)':s==='at_risk'?'var(--yellow)':'var(--red)';
            return <div key={s}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                <div style={{fontSize:11,textTransform:'capitalize'}}>{s.replace('_',' ')}</div>
                <div style={{fontFamily:'monospace',fontSize:11}}>{cnt}</div>
              </div>
              <div style={{width:'100%',height:4,background:'var(--surface2)',borderRadius:2,marginBottom:6}}>
                <div style={{width:`${pct}%`,height:'100%',background:c,borderRadius:2}}/>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
