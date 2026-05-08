import { getSessionUser } from '@/lib/auth';
import { getHealth, getAstronauts } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function HealthPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const health = getHealth();
  const astronauts = getAstronauts();
  const aMap = Object.fromEntries(astronauts.map(a=>[a.id,a.name]));
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Crew Health Monitoring</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Medical status for {health.length} astronauts</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Nominal',value:health.filter(h=>h.status==='nominal').length,color:'#22c55e'},
          {label:'Caution',value:health.filter(h=>h.status==='caution').length,color:'#f59e0b'},
          {label:'Avg Heart Rate',value:`${Math.round(health.reduce((s,h)=>s+h.heartRate,0)/health.length)} bpm`,color:'#14b8a6'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem'}}>
        {health.map(h=>{
          const a = astronauts.find(a=>a.id===h.astronautId);
          return (
            <div key={h.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${h.status==='nominal'?'#22c55e':'#f59e0b'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
                <div>
                  <div style={{fontWeight:700}}>{a?.name??h.astronautId}</div>
                  <div style={{color:'#64748b',fontSize:'0.75rem'}}>{h.date}</div>
                </div>
                <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',background:h.status==='nominal'?'#14532d':'#713f12',color:h.status==='nominal'?'#86efac':'#fed7aa'}}>{h.status}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.5rem'}}>
                {[{label:'Heart Rate',value:`${h.heartRate} bpm`},{label:'Blood Pressure',value:h.bloodPressure},
                  {label:'VO₂ Max',value:`${h.vo2Max} ml/kg/min`},{label:'Bone Density',value:`${h.boneDensity.toFixed(2)} g/cm²`}].map(m=>(
                  <div key={m.label} style={{background:'#0f172a',borderRadius:'0.4rem',padding:'0.5rem',textAlign:'center'}}>
                    <div style={{fontWeight:700,color:'#14b8a6',fontSize:'0.85rem'}}>{m.value}</div>
                    <div style={{color:'#64748b',fontSize:'0.7rem'}}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
