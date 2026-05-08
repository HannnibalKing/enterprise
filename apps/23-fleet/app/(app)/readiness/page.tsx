import { getSessionUser } from '@/lib/auth';
import { getVehicles, getPendingMaintenance, getLaunches } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function ReadinessPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const vehicles = getVehicles();
  const pending = getPendingMaintenance();
  const launches = getLaunches();
  const successCount = launches.filter(l=>l.outcome==='success').length;
  const successRate = launches.length > 0 ? Math.round(successCount/launches.length*100) : 0;
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Fleet Readiness Assessment</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>GO/NO-GO evaluation per vehicle</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Fleet GO',value:vehicles.filter(v=>v.readinessScore>=80&&v.status==='operational').length,color:'#22c55e'},
          {label:'Pending Maint.',value:pending.length,color:'#f59e0b'},
          {label:'Mission Success',value:`${successRate}%`,color:'#3b82f6'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {vehicles.map(v=>{
          const vPending = pending.filter(m=>m.vehicleId===v.id);
          const go = v.readinessScore>=80 && v.status==='operational' && vPending.length===0;
          return (
            <div key={v.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${go?'#22c55e':'#ef4444'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:'1rem'}}>{v.id}</div>
                  <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{v.type} · Status: <span style={{color:v.status==='operational'?'#22c55e':'#f59e0b'}}>{v.status}</span></div>
                </div>
                <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:700,fontSize:'1.25rem',color:v.readinessScore>=80?'#22c55e':v.readinessScore>=60?'#f59e0b':'#ef4444'}}>{v.readinessScore}%</div>
                    <div style={{color:'#64748b',fontSize:'0.7rem'}}>readiness</div>
                  </div>
                  <span style={{padding:'0.35rem 1rem',borderRadius:'9999px',fontWeight:700,fontSize:'0.9rem',background:go?'#14532d':'#7f1d1d',color:go?'#86efac':'#fca5a5'}}>{go?'GO':'NO-GO'}</span>
                </div>
              </div>
              <div style={{height:'10px',borderRadius:'5px',background:'#0f172a',marginBottom:'0.75rem'}}>
                <div style={{height:'100%',borderRadius:'5px',background:v.readinessScore>=80?'#22c55e':v.readinessScore>=60?'#f59e0b':'#ef4444',width:`${v.readinessScore}%`,transition:'width 0.3s'}}/>
              </div>
              <div style={{display:'flex',gap:'1rem'}}>
                <div style={{flex:1,background:'#0f172a',borderRadius:'0.4rem',padding:'0.5rem'}}>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>Flight Count</div>
                  <div style={{fontWeight:700,color:'#94a3b8'}}>{v.flightCount}</div>
                </div>
                <div style={{flex:1,background:'#0f172a',borderRadius:'0.4rem',padding:'0.5rem'}}>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>Pending Maint.</div>
                  <div style={{fontWeight:700,color:vPending.length>0?'#f59e0b':'#22c55e'}}>{vPending.length}</div>
                </div>
                <div style={{flex:1,background:'#0f172a',borderRadius:'0.4rem',padding:'0.5rem'}}>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>Next Launch</div>
                  <div style={{fontWeight:700,color:'#3b82f6',fontSize:'0.85rem'}}>{v.nextLaunch??'–'}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
