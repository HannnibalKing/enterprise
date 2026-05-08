import { getWorkOrders } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const PRIO_COLOR: Record<string,string> = { critical:'var(--red)', high:'var(--yellow)', medium:'var(--accent)', low:'var(--text-muted)' };
const STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  open:          {bg:'rgba(248,113,113,0.10)', color:'var(--red)'},
  in_progress:   {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
  pending_parts: {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
  completed:     {bg:'var(--green-dim)',        color:'var(--green)'},
  cancelled:     {bg:'rgba(255,255,255,0.05)', color:'var(--text-muted)'},
};
export default async function MaintenancePage() {
  const wos = getWorkOrders();
  const open = wos.filter(w=>w.status!=='completed'&&w.status!=='cancelled');
  const totalCost = wos.filter(w=>w.actualCost).reduce((s,w)=>s+(w.actualCost??0),0);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Maintenance <span style={{color:'var(--accent)'}}>Work Orders</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{wos.length} total · {open.length} open · ${totalCost.toLocaleString()} YTD completed cost</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {(['open','in_progress','pending_parts','completed'] as const).map(s=>{
          const cnt=wos.filter(w=>w.status===s).length;
          const ss=STATUS_STYLE[s];
          return <div key={s} style={{padding:'12px 14px',borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)'}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-muted)',marginBottom:5}}>{s.replace('_',' ')}</div>
            <div style={{fontSize:22,fontWeight:800,color:ss.color}}>{cnt}</div>
          </div>;
        })}
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>WO #</th><th>Property</th><th>Category</th><th>Description</th><th>Priority</th><th>Assigned To</th><th>Due Date</th><th>Est Cost</th><th>Status</th></tr></thead>
          <tbody>
            {wos.map(w=>{
              const ss=STATUS_STYLE[w.status];
              return <tr key={w.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)'}}>{w.id}</td>
                <td style={{fontSize:11,color:'var(--text)'}}>{w.propertyName.split(' ').slice(0,2).join(' ')}</td>
                <td style={{fontSize:12}}>{w.category}</td>
                <td style={{fontSize:11,maxWidth:200,color:'var(--text-soft)'}}>{w.description}</td>
                <td style={{fontWeight:700,color:PRIO_COLOR[w.priority],textTransform:'capitalize'}}>{w.priority}</td>
                <td style={{fontSize:11}}>{w.assignedTo}</td>
                <td style={{fontFamily:'monospace',fontSize:11,color:w.status!=='completed'&&w.dueDate<'2026-05-07'?'var(--red)':'inherit'}}>{w.dueDate}</td>
                <td style={{fontFamily:'monospace'}}>${w.estimatedCost.toLocaleString()}</td>
                <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{w.status.replace('_',' ')}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
