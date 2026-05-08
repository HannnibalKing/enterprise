import { getSessionUser } from '@/lib/auth';
import { getEngines } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function EnginesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const engines = getEngines();
  const statusColor: Record<string,string> = { operational:'#22c55e', testing:'#3b82f6', decommissioned:'#64748b' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Engine Catalog</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{engines.length} engine types</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem'}}>
        {engines.map(e=>(
          <div key={e.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderTop:`3px solid ${statusColor[e.status]??'#94a3b8'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'1.1rem'}}>{e.designation}</div>
                <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{e.type} · {e.propellant}</div>
              </div>
              <span style={{padding:'0.25rem 0.75rem',borderRadius:'9999px',fontSize:'0.75rem',background:'#0f172a',color:statusColor[e.status]??'#94a3b8'}}>{e.status}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem',marginBottom:'0.75rem'}}>
              {[{label:'Thrust (kN)',value:e.thrustKN.toLocaleString()},{label:'Isp SL (s)',value:e.ispSL||'–'},{label:'Isp Vac (s)',value:e.ispVac},
                {label:'Chamber P (bar)',value:e.chamberPressureBar},{label:'Throttle',value:e.throttleRange},{label:' ',value:' '}].slice(0,5).map(m=>(
                <div key={m.label} style={{background:'#0f172a',borderRadius:'0.4rem',padding:'0.5rem',textAlign:'center'}}>
                  <div style={{fontWeight:700,color:'#f59e0b',fontSize:'0.85rem'}}>{m.value}</div>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:'0.5rem'}}>
              <div style={{fontSize:'0.75rem',color:'#64748b',marginBottom:'0.25rem'}}>Thrust output</div>
              <div style={{height:'8px',borderRadius:'4px',background:'#0f172a'}}>
                <div style={{height:'100%',borderRadius:'4px',background:'linear-gradient(90deg,#f59e0b,#ef4444)',width:`${Math.min(e.thrustKN/24000*100,100)}%`}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'#64748b',marginTop:'2px'}}>
                <span>0 kN</span><span>24,000 kN</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
