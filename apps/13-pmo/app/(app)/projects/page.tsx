import { getProjects } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const STATUS: Record<string,{bg:string;color:string}> = {
  active:    {bg:'var(--cyan-dim)',   color:'var(--accent)'},
  planning:  {bg:'var(--blue-dim)',   color:'var(--blue)'},
  on_hold:   {bg:'var(--yellow-dim)', color:'var(--yellow)'},
  complete:  {bg:'var(--green-dim)',  color:'var(--green)'},
  cancelled: {bg:'var(--red-dim)',    color:'var(--red)'},
};
const HEALTH: Record<string,{bg:string;color:string}> = {
  green: {bg:'var(--green-dim)',  color:'var(--green)'},
  amber: {bg:'var(--yellow-dim)', color:'var(--yellow)'},
  red:   {bg:'var(--red-dim)',    color:'var(--red)'},
};
const fmtM = (n:number) => `$${(n/1e6).toFixed(2)}M`;
export default async function ProjectsPage() {
  const projects = getProjects();
  const budgetVariance = projects.reduce((s,p)=>s+p.forecastAtCompletion-p.budget,0);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Project <span style={{color:'var(--accent)'}}>Portfolio</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{projects.length} projects · Budget at completion variance: <span style={{color:budgetVariance>0?'var(--red)':'var(--green)'}}>{fmtM(Math.abs(budgetVariance))}</span></div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Code</th><th>Project Name</th><th>Sponsor</th><th>Phase</th><th>Manager</th><th>Progress</th><th>Budget</th><th>FAC</th><th>Team</th><th>Risks/Issues</th><th>Status</th><th>Health</th></tr></thead>
          <tbody>
            {projects.map(p=>{
              const ss=STATUS[p.status];
              const hs=HEALTH[p.health];
              const budgetColor = p.forecastAtCompletion > p.budget*1.05 ? 'var(--red)' : 'var(--text)';
              return <tr key={p.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)',fontWeight:700}}>{p.code}</td>
                <td style={{fontSize:12,fontWeight:700,color:'var(--text)',maxWidth:180}}>{p.name}</td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{p.sponsor}</td>
                <td style={{fontSize:11}}>{p.phase}</td>
                <td style={{fontSize:11}}>{p.manager}</td>
                <td style={{minWidth:80}}>
                  <div style={{display:'flex',alignItems:'center',gap:5}}>
                    <div style={{flex:1,height:4,background:'var(--surface2)',borderRadius:2}}>
                      <div style={{width:`${p.completionPct}%`,height:'100%',background:'var(--accent)',borderRadius:2}}/>
                    </div>
                    <span style={{fontSize:10,fontFamily:'monospace'}}>{p.completionPct}%</span>
                  </div>
                </td>
                <td style={{fontFamily:'monospace',fontSize:11}}>{fmtM(p.budget)}</td>
                <td style={{fontFamily:'monospace',fontSize:11,color:budgetColor,fontWeight:700}}>{fmtM(p.forecastAtCompletion)}</td>
                <td style={{fontFamily:'monospace',textAlign:'center'}}>{p.teamSize}</td>
                <td style={{fontFamily:'monospace',fontSize:11,color:p.openRisks+p.openIssues>5?'var(--red)':'var(--text)'}}>{p.openRisks}R / {p.openIssues}I</td>
                <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{p.status.replace('_',' ')}</span></td>
                <td><span className="badge" style={{background:hs.bg,color:hs.color}}>{p.health}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
