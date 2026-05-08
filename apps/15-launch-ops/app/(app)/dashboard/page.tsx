import { getSessionUser } from '@/lib/auth';
import { getStats, getLaunches, getVehicles } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stats = getStats();
  const launches = getLaunches();
  const vehicles = getVehicles();
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Launch Operations Dashboard</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Welcome, {user.name} ({user.role})</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[
          { label:'Total Launches', value: stats.totalLaunches, color:'#ef4444' },
          { label:'Upcoming', value: stats.upcomingLaunches, color:'#f97316' },
          { label:'Success', value: stats.successLaunches, color:'#22c55e' },
          { label:'On Hold', value: stats.holdLaunches, color:'#f59e0b' },
        ].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:'1rem',marginBottom:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Launch Manifest</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {launches.slice(0,6).map(l=>(
              <div key={l.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:l.status==='success'?'#22c55e':l.status==='upcoming'?'#3b82f6':l.status==='hold'?'#f59e0b':'#94a3b8',flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:'0.85rem'}}>{l.payload}</div>
                  <div style={{color:'#94a3b8',fontSize:'0.75rem'}}>{l.vehicle}</div>
                </div>
                <div style={{textAlign:'right',fontSize:'0.8rem'}}>
                  <div style={{color:'#ef4444'}}>{l.site}</div>
                  <div style={{color:'#64748b'}}>{l.scheduledDate.split('T')[0]}</div>
                </div>
                <span style={{padding:'0.2rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:l.status==='success'?'#14532d':l.status==='upcoming'?'#1e3a5f':l.status==='hold'?'#713f12':'#1e293b',color:l.status==='success'?'#86efac':l.status==='upcoming'?'#93c5fd':l.status==='hold'?'#fed7aa':'#94a3b8'}}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Fleet Status</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {vehicles.map(v=>(
              <div key={v.id} style={{padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.25rem'}}>
                  <span style={{fontWeight:600,fontSize:'0.85rem'}}>{v.name}</span>
                  <span style={{fontSize:'0.75rem',color:v.status==='nominal'?'#22c55e':v.status==='refurbishment'?'#f59e0b':'#94a3b8'}}>{v.status}</span>
                </div>
                <div style={{color:'#64748b',fontSize:'0.75rem'}}>{v.type} · {v.flightCount} flights</div>
                <div style={{marginTop:'0.4rem',height:'4px',borderRadius:'2px',background:'#1e293b'}}>
                  <div style={{height:'100%',borderRadius:'2px',background:'#ef4444',width:`${Math.min(v.flightCount/20*100,100)}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
