import { getSessionUser } from '@/lib/auth';
import { getMissions } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function CrewPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const missions = getMissions();
  const crewedMissions = missions.filter(m => m.crew && m.crew.length > 0);
  const roles = ['CDR','PLT','MS1','MS2','FE'];
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Crew Assignments</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{crewedMissions.length} crewed missions</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Crewed Missions',value:crewedMissions.length,color:'#14b8a6'},
          {label:'Total Crew Slots',value:crewedMissions.reduce((s,m)=>s+(m.crew?.length??0),0),color:'#f97316'},
          {label:'Active Missions',value:missions.filter(m=>m.status==='active').length,color:'#22c55e'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center'}}>
            <div style={{fontSize:'2.5rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      {crewedMissions.map(m=>(
        <div key={m.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',marginBottom:'1rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1rem'}}>
            <div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#22c55e',flexShrink:0}}/>
            <div>
              <div style={{fontWeight:700}}>{m.name}</div>
              <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{m.type} · {m.phase}</div>
            </div>
            <span style={{marginLeft:'auto',padding:'0.25rem 0.75rem',borderRadius:'9999px',fontSize:'0.75rem',background:'#0f172a',color:'#22c55e'}}>{m.status}</span>
          </div>
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
            {(m.crew as string[]).map((c,i)=>(
              <div key={i} style={{background:'#0f172a',borderRadius:'0.5rem',padding:'0.75rem 1.25rem',textAlign:'center',minWidth:'80px'}}>
                <div style={{fontSize:'1.5rem',marginBottom:'0.25rem'}}>👨‍🚀</div>
                <div style={{fontWeight:600,fontSize:'0.85rem',color:'#f97316'}}>{c}</div>
                <div style={{color:'#64748b',fontSize:'0.75rem'}}>{roles[i]??'Crew'}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
