import { getSessionUser } from '@/lib/auth';
import { getMissions } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function MissionsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const missions = getMissions();
  const statusColor: Record<string,string> = { active:'#22c55e', transit:'#f97316', nominal:'#3b82f6', cruise:'#a855f7' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Mission Registry</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{missions.length} missions tracked</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem'}}>
        {missions.map(m=>(
          <div key={m.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderTop:`3px solid ${statusColor[m.status]??'#94a3b8'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'1rem'}}>{m.name}</div>
                <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{m.type} · Launch: {m.launchDate}</div>
              </div>
              <span style={{padding:'0.25rem 0.75rem',borderRadius:'9999px',fontSize:'0.75rem',background:'#0f172a',color:statusColor[m.status]??'#94a3b8',fontWeight:600}}>{m.status}</span>
            </div>
            <div style={{fontSize:'0.85rem',color:'#cbd5e1',marginBottom:'0.75rem'}}>{m.objective}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem',marginTop:'0.75rem'}}>
              {[
                { label:'Altitude', value:`${m.altitude.toLocaleString()} km` },
                { label:'Inclination', value:`${m.inclination}°` },
                { label:'Phase', value:m.phase },
              ].map(s=>(
                <div key={s.label} style={{background:'#0f172a',borderRadius:'0.5rem',padding:'0.5rem',textAlign:'center'}}>
                  <div style={{fontSize:'0.8rem',fontWeight:600,color:'#f97316'}}>{s.value}</div>
                  <div style={{fontSize:'0.7rem',color:'#64748b'}}>{s.label}</div>
                </div>
              ))}
            </div>
            {m.crew && m.crew.length > 0 && (
              <div style={{marginTop:'0.75rem',display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                {m.crew.map((c: string)=>(
                  <span key={c} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:'0.25rem',padding:'0.2rem 0.5rem',fontSize:'0.75rem',color:'#93c5fd'}}>{c}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
