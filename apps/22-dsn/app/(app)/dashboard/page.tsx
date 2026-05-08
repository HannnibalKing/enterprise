import { getSessionUser } from '@/lib/auth';
import { getStats, getStations, getActiveContacts, getAllAntennas } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stats = getStats();
  const stations = getStations();
  const active = getActiveContacts();
  const allAntennas = getAllAntennas();
  const antennaMap = Object.fromEntries(allAntennas.map(a=>[a.id,a.designation]));
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>DEEP SPACE — DSN Dashboard</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Welcome, {user.name} ({user.role})</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[
          { label:'Complexes', value:stats.totalStations, color:'#06b6d4' },
          { label:'Antennas', value:stats.totalAntennas, color:'#3b82f6' },
          { label:'Active Contacts', value:stats.activeContacts, color:'#22c55e' },
          { label:'Scheduled', value:stats.scheduledContacts, color:'#f59e0b' },
          { label:'In Maintenance', value:stats.maintenance, color:'#ef4444' },
        ].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.8rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Station Complex Health</h2>
          {stations.map(s=>{
            const operational = s.antennas.filter(a=>a.status==='operational').length;
            const pct = Math.round(operational/s.antennas.length*100);
            return (
              <div key={s.id} style={{marginBottom:'1rem',padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:'0.9rem'}}>{s.name}</div>
                    <div style={{color:'#64748b',fontSize:'0.75rem'}}>{s.location} · {s.antennas.length} antennas</div>
                  </div>
                  <span style={{fontWeight:700,fontSize:'1.1rem',color:pct===100?'#22c55e':pct>=70?'#f59e0b':'#ef4444'}}>{pct}%</span>
                </div>
                <div style={{height:'8px',borderRadius:'4px',background:'#1e293b'}}>
                  <div style={{height:'100%',borderRadius:'4px',background:'#06b6d4',width:`${pct}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 0.75rem',color:'#22c55e'}}>Active Contacts</h2>
          {active.map(c=>(
            <div key={c.id} style={{padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem',marginBottom:'0.5rem'}}>
              <div style={{fontWeight:600,fontSize:'0.85rem',color:'#06b6d4',marginBottom:'0.25rem'}}>{c.spacecraft}</div>
              <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{antennaMap[c.antennaId]??c.antennaId} · {c.startTime}–{c.endTime}</div>
              <div style={{fontSize:'0.75rem',color:'#22c55e',marginTop:'0.2rem'}}>{c.uplinkKbps} kbps up · {c.downlinkMbps} Mbps dn</div>
            </div>
          ))}
          {active.length===0&&<p style={{color:'#64748b',fontSize:'0.85rem'}}>No active contacts</p>}
        </div>
      </div>
    </div>
  );
}
