import { getSessionUser } from '@/lib/auth';
import { getStats, getVehicles, getLaunches } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stats = getStats();
  const vehicles = getVehicles();
  const launches = getLaunches().slice(-5).reverse();
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>VANGUARD — Fleet Command</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Welcome, {user.name} ({user.role})</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[
          { label:'Fleet Size', value:stats.totalVehicles, color:'#94a3b8' },
          { label:'Operational', value:stats.operational, color:'#22c55e' },
          { label:'Total Launches', value:stats.totalLaunches, color:'#3b82f6' },
          { label:'Pending Maint.', value:stats.pendingMaint, color:'#f59e0b' },
        ].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Fleet Readiness</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {vehicles.map(v=>(
              <div key={v.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <div style={{minWidth:'100px'}}>
                  <div style={{fontWeight:700,fontSize:'0.85rem'}}>{v.id}</div>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>{v.type}</div>
                </div>
                <div style={{flex:1,height:'14px',borderRadius:'7px',background:'#1e293b',overflow:'hidden'}}>
                  <div style={{height:'100%',borderRadius:'7px',background:v.readinessScore>=80?'#22c55e':v.readinessScore>=60?'#f59e0b':'#ef4444',width:`${v.readinessScore}%`}}/>
                </div>
                <span style={{minWidth:'40px',textAlign:'right',fontWeight:700,color:v.readinessScore>=80?'#22c55e':v.readinessScore>=60?'#f59e0b':'#ef4444'}}>{v.readinessScore}%</span>
                <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:v.status==='operational'?'#14532d':v.status==='refurbishment'?'#1e3a5f':'#713f12',color:v.status==='operational'?'#86efac':v.status==='refurbishment'?'#93c5fd':'#fcd34d',minWidth:'80px',textAlign:'center'}}>{v.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 0.75rem'}}>Recent Launches</h2>
          {launches.map(l=>(
            <div key={l.id} style={{padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem',marginBottom:'0.4rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.2rem'}}>
                <span style={{fontWeight:700,fontSize:'0.8rem',color:'#94a3b8'}}>{l.vehicleId}</span>
                <span style={{fontSize:'0.7rem',fontWeight:700,color:l.outcome==='success'?'#22c55e':'#f59e0b'}}>{l.outcome.toUpperCase()}</span>
              </div>
              <div style={{fontSize:'0.75rem',color:'#64748b'}}>{l.date} · {l.payload}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
