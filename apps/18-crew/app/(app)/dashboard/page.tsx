import { getSessionUser } from '@/lib/auth';
import { getStats, getAstronauts, getHealth } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stats = getStats();
  const astronauts = getAstronauts();
  const health = getHealth();
  const inSpace = astronauts.filter(a => a.currentMission);
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>ARTEMIS OPS — Crew Dashboard</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Welcome, {user.name} ({user.role})</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[
          { label:'Total Astronauts', value:stats.totalAstronauts, color:'#14b8a6' },
          { label:'Currently in Space', value:stats.inSpace, color:'#f97316' },
          { label:'In Training', value:stats.inTraining, color:'#3b82f6' },
          { label:'Health Cautions', value:stats.healthCautions, color:'#ef4444' },
        ].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Currently in Space</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {inSpace.map(a=>{
              const h = health.find(h=>h.astronautId===a.id);
              return (
                <div key={a.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                  <div style={{fontSize:'2rem'}}>👨‍🚀</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700}}>{a.name}</div>
                    <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{a.agency} · {a.currentMission}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{color:'#14b8a6',fontWeight:600}}>{a.flightHours.toLocaleString()} hrs</div>
                    <div style={{color:'#64748b',fontSize:'0.75rem'}}>{a.evaHours} EVA hrs</div>
                  </div>
                  <span style={{padding:'0.2rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:h?.status==='caution'?'#713f12':'#14532d',color:h?.status==='caution'?'#fed7aa':'#86efac'}}>{h?.status??'nominal'}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Health Summary</h2>
          {health.slice(0,6).map(h=>{
            const a = astronauts.find(a=>a.id===h.astronautId);
            return (
              <div key={h.id} style={{padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem',marginBottom:'0.4rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontWeight:600,fontSize:'0.8rem'}}>{a?.name.split(' ')[0]}</span>
                  <span style={{fontSize:'0.7rem',color:h.status==='caution'?'#f59e0b':'#22c55e'}}>{h.status}</span>
                </div>
                <div style={{fontSize:'0.75rem',color:'#94a3b8',marginTop:'0.15rem'}}>HR: {h.heartRate} · BP: {h.bloodPressure}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
