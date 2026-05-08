import { getPatients } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  critical:       {bg:'rgba(248,113,113,0.12)',  color:'#f87171'},
  serious:        {bg:'rgba(251,146,60,0.12)',   color:'#fb923c'},
  stable:         {bg:'rgba(52,211,153,0.10)',   color:'#34d399'},
  discharge_ready:{bg:'rgba(56,189,248,0.10)',   color:'#38bdf8'},
  discharged:     {bg:'rgba(255,255,255,0.06)',  color:'#7fa8cc'},
};
export default async function PatientsPage() {
  const patients = getPatients();
  const critCount  = patients.filter(p=>p.status==='critical').length;
  const disReady   = patients.filter(p=>p.status==='discharge_ready').length;
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Patient <span style={{color:'var(--accent)'}}>Census</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{patients.length} inpatients · <span style={{color:'var(--red)'}}>{critCount} critical</span> · <span style={{color:'var(--accent)'}}>{disReady} discharge-ready</span></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
        {(['critical','serious','stable','discharge_ready'] as const).map(s=>{
          const cnt=patients.filter(p=>p.status===s).length;
          const sty=STATUS_STYLE[s];
          return <div key={s} style={{padding:'12px 14px',borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)'}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:5}}>{s.replace('_',' ')}</div>
            <div style={{fontSize:22,fontWeight:800,color:sty.color}}>{cnt}</div>
          </div>;
        })}
        <div style={{padding:'12px 14px',borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)'}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:5}}>Total</div>
          <div style={{fontSize:22,fontWeight:800,color:'var(--text)'}}>{patients.length}</div>
        </div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>MRN</th><th>Name</th><th>Age</th><th>Dept</th><th>Room</th><th>Status</th><th>Diagnosis</th><th>Admit</th><th>Physician</th><th>Vitals</th><th>Alerts</th></tr></thead>
          <tbody>
            {patients.map(p=>{
              const sty=STATUS_STYLE[p.status];
              return <tr key={p.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--text-muted)'}}>{p.mrn}</td>
                <td style={{fontWeight:600,color:'var(--text)'}}>{p.name}</td>
                <td>{p.age} {p.gender}</td>
                <td style={{fontSize:11,color:'var(--accent)'}}>{p.department}</td>
                <td style={{fontFamily:'monospace',fontSize:11}}>{p.room}-{p.bed}</td>
                <td><span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:sty.bg,color:sty.color,textTransform:'uppercase',whiteSpace:'nowrap'}}>{p.status.replace('_',' ')}</span></td>
                <td style={{fontSize:12,color:'var(--text)',maxWidth:200}}>{p.diagnosis}</td>
                <td style={{fontSize:11,fontFamily:'monospace'}}>{p.admitDate}</td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{p.physician.replace('Dr. ','')}</td>
                <td style={{fontSize:11,fontFamily:'monospace',whiteSpace:'nowrap'}}>HR:{p.vitals.hr} {p.vitals.bp} T:{p.vitals.temp}°</td>
                <td>{p.alerts.length>0&&<span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'var(--red-dim)',color:'var(--red)'}}>{p.alerts.length}</span>}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
