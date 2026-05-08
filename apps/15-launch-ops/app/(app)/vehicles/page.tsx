import { getSessionUser } from '@/lib/auth';
import { getVehicles } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function VehiclesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const vehicles = getVehicles();
  const statusColor: Record<string,string> = { nominal:'#22c55e', refurbishment:'#f59e0b', testing:'#3b82f6', integration:'#a855f7' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Vehicle Registry</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{vehicles.length} vehicles tracked</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem'}}>
        {vehicles.map(v=>(
          <div key={v.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderTop:`3px solid ${statusColor[v.status]??'#94a3b8'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'1rem'}}>{v.name}</div>
                <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{v.type}</div>
              </div>
              <span style={{padding:'0.25rem 0.75rem',borderRadius:'9999px',fontSize:'0.75rem',background:'#0f172a',color:statusColor[v.status]??'#94a3b8'}}>{v.status}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.5rem',marginBottom:'0.75rem'}}>
              {[
                { label:'Flights', value:v.flightCount },
                { label:'Cores', value:v.cores },
                { label:'Height (m)', value:v.height },
                { label:'Thrust (kN)', value:v.thrust.toLocaleString() },
              ].map(s=>(
                <div key={s.label} style={{background:'#0f172a',borderRadius:'0.5rem',padding:'0.5rem 0.75rem'}}>
                  <div style={{fontWeight:700,color:'#ef4444'}}>{s.value}</div>
                  <div style={{color:'#64748b',fontSize:'0.75rem'}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:'0.8rem',color:'#94a3b8'}}>Last landing: <span style={{color:'#cbd5e1'}}>{v.lastLanding}</span></div>
            <div style={{marginTop:'0.5rem'}}>
              <div style={{fontSize:'0.75rem',color:'#64748b',marginBottom:'0.25rem'}}>Flight history ({v.flightCount} launches)</div>
              <div style={{height:'8px',borderRadius:'4px',background:'#0f172a',overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:'4px',background:`linear-gradient(90deg, #22c55e, #ef4444)`,width:`${Math.min(v.flightCount/20*100,100)}%`}}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
