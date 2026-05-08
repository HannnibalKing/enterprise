import { getSessionUser } from '@/lib/auth';
import { getAnomalies, getMissions } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function AnomaliesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const anomalies = getAnomalies();
  const missions = getMissions();
  const missionMap = Object.fromEntries(missions.map(m=>[m.id,m.name]));
  const sevColor: Record<string,string> = { critical:'#ef4444', high:'#f97316', medium:'#f59e0b', low:'#22c55e' };
  const statusColor: Record<string,string> = { open:'#ef4444', investigating:'#f59e0b', resolved:'#22c55e' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Anomaly Log</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{anomalies.length} anomalies recorded</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {(['critical','high','medium','low'] as const).map(s=>(
          <div key={s} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1rem',borderLeft:`4px solid ${sevColor[s]}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:sevColor[s]}}>{anomalies.filter(a=>a.severity===s).length}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',textTransform:'capitalize'}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {anomalies.map(a=>(
          <div key={a.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${sevColor[a.severity]}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
              <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
                <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',background:'#0f172a',color:sevColor[a.severity],fontWeight:700}}>{a.severity.toUpperCase()}</span>
                <span style={{fontWeight:600}}>{a.system}</span>
                <span style={{color:'#94a3b8',fontSize:'0.85rem'}}>{missionMap[a.missionId]??a.missionId}</span>
              </div>
              <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',background:'#0f172a',color:statusColor[a.status]}}>{a.status}</span>
            </div>
            <div style={{fontSize:'0.9rem',color:'#cbd5e1',marginBottom:'0.5rem'}}>{a.description}</div>
            <div style={{fontSize:'0.75rem',color:'#64748b'}}>{a.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
