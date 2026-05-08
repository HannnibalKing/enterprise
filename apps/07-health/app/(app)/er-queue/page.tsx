import { getERQueue } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const TRIAGE_STYLE: Record<number,{color:string;label:string;bg:string}> = {
  1:{color:'#f87171',label:'IMMEDIATE',  bg:'rgba(248,113,113,0.12)'},
  2:{color:'#fb923c',label:'EMERGENT',   bg:'rgba(251,146,60,0.12)'},
  3:{color:'#fbbf24',label:'URGENT',     bg:'rgba(251,191,36,0.10)'},
  4:{color:'#34d399',label:'LESS URGENT',bg:'rgba(52,211,153,0.08)'},
  5:{color:'#7fa8cc',label:'NON-URGENT', bg:'rgba(127,168,204,0.08)'},
};
const STATUS_COLOR:{[k:string]:string}={waiting:'var(--yellow)',in_triage:'var(--orange)',in_treatment:'var(--green)',boarding:'var(--red)'};
export default async function ERQueuePage() {
  const queue = getERQueue();
  const critical = queue.filter(e=>e.triage<=2).length;
  const avgWait  = Math.round(queue.reduce((s,e)=>s+e.waitMinutes,0)/queue.length);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Emergency Room <span style={{color:'var(--accent)'}}>Queue</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{queue.length} patients · <span style={{color:'var(--red)'}}>{critical} critical/emergent</span> · avg wait {avgWait}m</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
        {[1,2,3,4,5].map(t=>{
          const cnt=queue.filter(e=>e.triage===t).length;
          const sty=TRIAGE_STYLE[t];
          return <div key={t} style={{padding:'12px 14px',borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)',borderTop:`3px solid ${sty.color}`}}>
            <div style={{fontSize:11,fontWeight:700,color:sty.color,marginBottom:5}}>L{t} · {sty.label}</div>
            <div style={{fontSize:22,fontWeight:800,color:sty.color}}>{cnt}</div>
            <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>patients</div>
          </div>;
        })}
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Triage</th><th>Name</th><th>Age</th><th>Chief Complaint</th><th>Arrival</th><th>Wait</th><th>Status</th></tr></thead>
          <tbody>
            {queue.map(e=>{
              const sty=TRIAGE_STYLE[e.triage];
              return <tr key={e.id}>
                <td><span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:20,background:sty.bg,color:sty.color,fontSize:10,fontWeight:800}}>L{e.triage} {sty.label}</span></td>
                <td style={{fontWeight:600,color:'var(--text)'}}>{e.name}</td>
                <td>{e.age}</td>
                <td style={{color:'var(--text)'}}>{e.chief}</td>
                <td style={{fontSize:11,fontFamily:'monospace'}}>{new Date(e.arrivalTime).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</td>
                <td style={{fontWeight:700,color:e.waitMinutes>60?'var(--red)':e.waitMinutes>30?'var(--yellow)':'var(--green)'}}>{e.waitMinutes}m</td>
                <td><span style={{fontSize:11,fontWeight:700,color:STATUS_COLOR[e.status]??'var(--text-soft)',textTransform:'uppercase'}}>{e.status.replace('_',' ')}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
