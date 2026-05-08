import { getSessionUser } from '@/lib/auth';
import { getStats, getPayloads, getManifests, getMilestones } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stats = getStats();
  const payloads = getPayloads();
  const manifests = getManifests();
  const milestones = getMilestones().filter(m=>m.status==='delayed');
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>ATLAS OPS — Payload Dashboard</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Welcome, {user.name} ({user.role})</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[
          { label:'Total Payloads', value:stats.totalPayloads, color:'#a855f7' },
          { label:'Encapsulated', value:stats.encapsulated, color:'#22c55e' },
          { label:'Delayed Milestones', value:stats.delayed, color:'#ef4444' },
          { label:'Active Manifests', value:stats.activeManifests, color:'#3b82f6' },
        ].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:'1rem',marginBottom:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Payload Status by Type</h2>
          {(['scientific','commercial','government','defense'] as const).map(type=>{
            const count = payloads.filter(p=>p.type===type).length;
            const colors: Record<string,string> = {scientific:'#14b8a6',commercial:'#3b82f6',government:'#22c55e',defense:'#ef4444'};
            return (
              <div key={type} style={{marginBottom:'0.75rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',marginBottom:'0.3rem'}}>
                  <span style={{textTransform:'capitalize',color:'#cbd5e1'}}>{type}</span>
                  <span style={{color:colors[type],fontWeight:700}}>{count}</span>
                </div>
                <div style={{height:'8px',borderRadius:'4px',background:'#0f172a'}}>
                  <div style={{height:'100%',borderRadius:'4px',background:colors[type],width:`${count/payloads.length*100}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Upcoming Manifests</h2>
          {manifests.slice(0,4).map(m=>(
            <div key={m.id} style={{padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem',marginBottom:'0.5rem'}}>
              <div style={{fontWeight:600,fontSize:'0.85rem',color:'#a855f7',marginBottom:'0.25rem'}}>{m.vehicleId}</div>
              <div style={{fontSize:'0.8rem',color:'#94a3b8'}}>{m.launchDate} · {m.orbit}</div>
              <div style={{fontSize:'0.8rem',color:'#f97316',marginTop:'0.2rem'}}>{m.totalMassKg.toLocaleString()} kg · {m.customer}</div>
            </div>
          ))}
        </div>
      </div>
      {milestones.length > 0 && (
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:'4px solid #ef4444'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem',color:'#ef4444'}}>Delayed Milestones</h2>
          {milestones.map(m=>(
            <div key={m.id} style={{padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem',marginBottom:'0.4rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><span style={{fontWeight:600,color:'#cbd5e1'}}>{m.milestone}</span><span style={{color:'#64748b',fontSize:'0.8rem',marginLeft:'0.5rem'}}>{m.payloadId}</span></div>
              <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:'#7f1d1d',color:'#fca5a5'}}>delayed</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
