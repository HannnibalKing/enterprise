import { getSessionUser } from '@/lib/auth';
import { getAstronauts } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function CrewPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const astronauts = getAstronauts();
  const statusColor: Record<string,string> = { Active:'#22c55e', Training:'#3b82f6' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Astronaut Roster</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{astronauts.length} astronauts</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem'}}>
        {astronauts.map(a=>(
          <div key={a.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderTop:`3px solid ${statusColor[a.status]??'#94a3b8'}`}}>
            <div style={{display:'flex',gap:'1rem',alignItems:'flex-start',marginBottom:'0.75rem'}}>
              <div style={{fontSize:'2.5rem'}}>👨‍🚀</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:'1rem'}}>{a.name}</div>
                <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{a.agency} · Blood {a.bloodType}</div>
                {a.currentMission && <div style={{color:'#14b8a6',fontSize:'0.8rem',marginTop:'0.15rem'}}>Mission: {a.currentMission}</div>}
              </div>
              <span style={{padding:'0.25rem 0.75rem',borderRadius:'9999px',fontSize:'0.75rem',background:'#0f172a',color:statusColor[a.status]??'#94a3b8'}}>{a.status}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
              {[{label:'Flight Hours',value:a.flightHours.toLocaleString()},{label:'EVA Hours',value:`${a.evaHours} hrs`}].map(m=>(
                <div key={m.label} style={{background:'#0f172a',borderRadius:'0.4rem',padding:'0.5rem',textAlign:'center'}}>
                  <div style={{fontWeight:700,color:'#14b8a6'}}>{m.value}</div>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
              {a.specializations.map(s=>(
                <span key={s} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:'0.25rem',padding:'0.15rem 0.4rem',fontSize:'0.7rem',color:'#93c5fd'}}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
