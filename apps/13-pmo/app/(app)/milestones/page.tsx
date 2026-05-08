import { getMilestones } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const STATUS: Record<string,{bg:string;color:string}> = {
  complete:    {bg:'var(--green-dim)',  color:'var(--green)'},
  in_progress: {bg:'var(--cyan-dim)',  color:'var(--accent)'},
  at_risk:     {bg:'var(--yellow-dim)',color:'var(--yellow)'},
  overdue:     {bg:'var(--red-dim)',   color:'var(--red)'},
  not_started: {bg:'rgba(255,255,255,0.04)',color:'var(--text-muted)'},
};
export default async function MilestonesPage() {
  const milestones = getMilestones();
  const overdue = milestones.filter(m=>m.status==='overdue').length;
  const complete = milestones.filter(m=>m.status==='complete').length;
  const atRisk = milestones.filter(m=>m.status==='at_risk').length;
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Milestone <span style={{color:'var(--accent)'}}>Tracker</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{milestones.length} milestones · {complete} complete · <span style={{color:'var(--red)'}}>{overdue} overdue</span> · <span style={{color:'var(--yellow)'}}>{atRisk} at risk</span></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:18}}>
        {(['complete','in_progress','at_risk','overdue','not_started'] as const).map(s=>{
          const cnt=milestones.filter(m=>m.status===s).length;
          const ss=STATUS[s];
          return <div key={s} style={{padding:'12px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8}}>
            <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',color:'var(--text-muted)',marginBottom:4}}>{s.replace('_',' ')}</div>
            <div style={{fontSize:22,fontWeight:800,color:ss.color}}>{cnt}</div>
          </div>;
        })}
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Milestone</th><th>Project</th><th>Owner</th><th>Due Date</th><th>Completed</th><th>Weight</th><th>Status</th></tr></thead>
          <tbody>
            {milestones.map(ms=>{
              const ss=STATUS[ms.status];
              const isLate = !ms.completedDate && ms.dueDate < '2026-05-07';
              return <tr key={ms.id}>
                <td style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{ms.name}</td>
                <td style={{fontSize:11,color:'var(--text-soft)',maxWidth:180}}>{ms.projectName.slice(0,24)}</td>
                <td style={{fontSize:11}}>{ms.owner}</td>
                <td style={{fontFamily:'monospace',fontSize:11,color:isLate?'var(--red)':'var(--text)'}}>{ms.dueDate}</td>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--green)'}}>{ms.completedDate ?? '—'}</td>
                <td style={{fontFamily:'monospace',fontWeight:700,color:'var(--accent)'}}>{ms.weight}%</td>
                <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{ms.status.replace('_',' ')}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
