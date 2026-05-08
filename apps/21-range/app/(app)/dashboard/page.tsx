import { getSessionUser } from '@/lib/auth';
import { getStats, getActiveHazards, getTodayWeather, getOpenIncidents, getPendingClearances } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stats = getStats();
  const hazards = getActiveHazards();
  const today = getTodayWeather();
  const incidents = getOpenIncidents();
  const pending = getPendingClearances();
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>SENTINEL — Range Safety Dashboard</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Welcome, {user.name} ({user.role})</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[
          { label:'Active Hazards', value:stats.activeHazards, color:'#ef4444' },
          { label:'Pending Clearances', value:stats.pendingClearances, color:'#f59e0b' },
          { label:'Granted Clearances', value:stats.grantedClearances, color:'#22c55e' },
          { label:'Open Incidents', value:stats.openIncidents, color:'#ef4444' },
          { label:'Launch Window', value:stats.launchGoWindow?'GO':'NO-GO', color:stats.launchGoWindow?'#22c55e':'#ef4444' },
        ].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'1.75rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.8rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 0.75rem'}}>Today&apos;s Weather</h2>
          {today ? (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
                <span style={{fontSize:'1.5rem',fontWeight:700}}>{today.date}</span>
                <span style={{padding:'0.35rem 1rem',borderRadius:'9999px',fontSize:'1rem',fontWeight:700,background:today.launchGo?'#14532d':'#7f1d1d',color:today.launchGo?'#86efac':'#fca5a5'}}>{today.launchGo?'GO':'NO-GO'}</span>
              </div>
              {[{label:'Wind',value:`${today.windSpeedKnots} kts ${today.windDir}°`},{label:'Visibility',value:`${today.visibilityNm} nm`},{label:'Ceiling',value:`${today.cloudCeilingFt.toLocaleString()} ft`},{label:'Lightning',value:today.lightning?'Yes':'No'}].map(i=>(
                <div key={i.label} style={{display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:'1px solid #334155',fontSize:'0.85rem'}}>
                  <span style={{color:'#64748b'}}>{i.label}</span>
                  <span style={{fontWeight:600}}>{i.value}</span>
                </div>
              ))}
            </div>
          ) : <p style={{color:'#64748b'}}>No data</p>}
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 0.75rem',color:'#ef4444'}}>Active Hazard Zones</h2>
          {hazards.map(h=>(
            <div key={h.id} style={{padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem',marginBottom:'0.4rem'}}>
              <div style={{fontWeight:600,fontSize:'0.85rem'}}>{h.name}</div>
              <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{h.type} · {h.radiusKm} km radius</div>
            </div>
          ))}
          {hazards.length===0&&<p style={{color:'#64748b',fontSize:'0.85rem'}}>No active hazards</p>}
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 0.75rem',color:'#f59e0b'}}>Open Incidents</h2>
          {incidents.map(inc=>(
            <div key={inc.id} style={{padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem',marginBottom:'0.4rem'}}>
              <div style={{fontWeight:600,fontSize:'0.85rem'}}>{inc.description.slice(0,40)}…</div>
              <div style={{fontSize:'0.75rem',color:inc.severity==='major'?'#ef4444':inc.severity==='moderate'?'#f59e0b':'#94a3b8'}}>{inc.severity} · {inc.system}</div>
            </div>
          ))}
          {incidents.length===0&&<p style={{color:'#64748b',fontSize:'0.85rem'}}>No open incidents</p>}
        </div>
      </div>
    </div>
  );
}
