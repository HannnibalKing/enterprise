import { getSessionUser } from '@/lib/auth';
import { getVehicles, getLaunchesByVehicle, getMaintenanceByVehicle } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function VehiclesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const vehicles = getVehicles();
  const statusColor: Record<string,string> = { operational:'#22c55e', refurbishment:'#3b82f6', retired:'#64748b', grounded:'#ef4444' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Fleet Vehicles</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{vehicles.length} vehicles</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem'}}>
        {vehicles.map(v=>{
          const launches = getLaunchesByVehicle(v.id);
          const maint = getMaintenanceByVehicle(v.id);
          return (
            <div key={v.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderTop:`3px solid ${statusColor[v.status]??'#334155'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:'1.1rem',color:'#e2e8f0'}}>{v.id}</div>
                  <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{v.type} · S/N {v.serialNumber}</div>
                  <div style={{color:'#64748b',fontSize:'0.75rem',marginTop:'0.15rem'}}>{v.location}</div>
                </div>
                <span style={{padding:'0.25rem 0.75rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,color:statusColor[v.status]??'#94a3b8',background:'#0f172a'}}>{v.status}</span>
              </div>
              <div style={{marginBottom:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',marginBottom:'0.3rem'}}>
                  <span style={{color:'#64748b'}}>Readiness</span>
                  <span style={{fontWeight:700,color:v.readinessScore>=80?'#22c55e':v.readinessScore>=60?'#f59e0b':'#ef4444'}}>{v.readinessScore}%</span>
                </div>
                <div style={{height:'10px',borderRadius:'5px',background:'#0f172a'}}>
                  <div style={{height:'100%',borderRadius:'5px',background:v.readinessScore>=80?'#22c55e':v.readinessScore>=60?'#f59e0b':'#ef4444',width:`${v.readinessScore}%`}}/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem',marginBottom:'0.75rem'}}>
                {[{label:'Flights',value:v.flightCount},{label:'Launches',value:launches.length},{label:'Maint.',value:maint.length}].map(m=>(
                  <div key={m.label} style={{background:'#0f172a',borderRadius:'0.4rem',padding:'0.5rem',textAlign:'center'}}>
                    <div style={{fontWeight:700,color:'#94a3b8',fontSize:'1rem'}}>{m.value}</div>
                    <div style={{color:'#64748b',fontSize:'0.7rem'}}>{m.label}</div>
                  </div>
                ))}
              </div>
              {v.nextLaunch && (
                <div style={{background:'#0f172a',borderRadius:'0.4rem',padding:'0.5rem'}}>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>Next Launch</div>
                  <div style={{color:'#3b82f6',fontWeight:600,fontSize:'0.85rem'}}>{v.nextLaunch}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
