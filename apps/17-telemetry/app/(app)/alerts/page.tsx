import { getSessionUser } from '@/lib/auth';
import { getAlerts } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function AlertsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const alerts = getAlerts();
  const sevColor: Record<string,string> = { critical:'#ef4444', warning:'#f59e0b', info:'#3b82f6' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Alert Log</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{alerts.length} alerts</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {(['critical','warning','info'] as const).map(s=>(
          <div key={s} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${sevColor[s]}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:sevColor[s]}}>{alerts.filter(a=>a.severity===s).length}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',textTransform:'capitalize'}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {alerts.map(a=>(
          <div key={a.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${sevColor[a.severity]??'#94a3b8'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
              <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
                <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',background:'#0f172a',color:sevColor[a.severity]??'#94a3b8',fontWeight:700}}>{a.severity.toUpperCase()}</span>
                <span style={{color:'#94a3b8',fontSize:'0.8rem'}}>Stream: {a.streamId}</span>
              </div>
              <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',background:a.acknowledged?'#14532d':'#7f1d1d',color:a.acknowledged?'#86efac':'#fca5a5'}}>{a.acknowledged?'Acknowledged':'Unacknowledged'}</span>
            </div>
            <div style={{fontSize:'0.9rem',color:'#cbd5e1',marginBottom:'0.5rem'}}>{a.message}</div>
            <div style={{fontSize:'0.75rem',color:'#64748b'}}>{a.timestamp.replace('T',' ').slice(0,19)} UTC</div>
          </div>
        ))}
      </div>
    </div>
  );
}
