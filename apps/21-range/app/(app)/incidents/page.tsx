import { getSessionUser } from '@/lib/auth';
import { getIncidents } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function IncidentsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const incidents = getIncidents();
  const severityColor: Record<string,string> = { minor:'#22c55e', moderate:'#f59e0b', major:'#ef4444' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Incident Log</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{incidents.length} incidents recorded</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Open',value:incidents.filter(i=>i.status==='open').length,color:'#ef4444'},
          {label:'Closed',value:incidents.filter(i=>i.status==='closed').length,color:'#22c55e'},
          {label:'Major',value:incidents.filter(i=>i.severity==='major').length,color:'#ef4444'},
          {label:'Moderate',value:incidents.filter(i=>i.severity==='moderate').length,color:'#f59e0b'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {incidents.map(inc=>(
          <div key={inc.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${severityColor[inc.severity]??'#94a3b8'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'1rem'}}>{inc.system} Incident</div>
                <div style={{color:'#94a3b8',fontSize:'0.8rem',marginTop:'0.2rem'}}>System: {inc.system} · {inc.date}</div>
              </div>
              <div style={{display:'flex',gap:'0.5rem'}}>
                <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,color:severityColor[inc.severity]??'#94a3b8',background:'#0f172a'}}>{inc.severity.toUpperCase()}</span>
                <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,background:inc.status==='open'?'#7f1d1d':'#14532d',color:inc.status==='open'?'#fca5a5':'#86efac'}}>{inc.status.toUpperCase()}</span>
              </div>
            </div>
            <div style={{background:'#0f172a',borderRadius:'0.4rem',padding:'0.75rem',marginBottom:'0.5rem'}}>
              <div style={{color:'#64748b',fontSize:'0.7rem',marginBottom:'0.25rem'}}>Description</div>
              <div style={{color:'#cbd5e1',fontSize:'0.85rem'}}>{inc.description}</div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
