import { getSessionUser } from '@/lib/auth';
import { getMissions, getStats, getAnomalies, getTelemetry } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stats = getStats();
  const missions = getMissions();
  const anomalies = getAnomalies().slice(0, 4);
  const telemetry = getTelemetry().slice(0, 6);
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Mission Control Dashboard</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Welcome, {user.name} ({user.role})</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[
          { label:'Total Missions', value: stats.totalMissions, color:'#f97316' },
          { label:'Active Missions', value: stats.activeMissions, color:'#22c55e' },
          { label:'Open Anomalies', value: stats.openAnomalies, color:'#ef4444' },
          { label:'TLM Warnings', value: stats.telemetryWarnings, color:'#f59e0b' },
        ].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,marginBottom:'1rem',margin:'0 0 1rem'}}>Active Missions</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {missions.slice(0,5).map(m=>(
              <div key={m.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:m.status==='active'?'#22c55e':m.status==='transit'?'#f97316':'#94a3b8',flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:'0.9rem'}}>{m.name}</div>
                  <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{m.type} · {m.phase}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'0.85rem',color:'#f97316'}}>{m.altitude.toLocaleString()} km</div>
                  <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{m.inclination}° incl.</div>
                </div>
                <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',background:m.status==='active'?'#166534':m.status==='transit'?'#7c2d12':'#1e3a5f',color:m.status==='active'?'#86efac':m.status==='transit'?'#fed7aa':'#93c5fd'}}>{m.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Anomaly Status</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {anomalies.map(a=>(
              <div key={a.id} style={{padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem',borderLeft:`3px solid ${a.severity==='critical'?'#ef4444':a.severity==='high'?'#f97316':a.severity==='medium'?'#f59e0b':'#94a3b8'}`}}>
                <div style={{fontSize:'0.8rem',fontWeight:600,color:a.severity==='critical'?'#ef4444':a.severity==='high'?'#f97316':a.severity==='medium'?'#f59e0b':'#94a3b8'}}>{a.severity.toUpperCase()} · {a.system}</div>
                <div style={{fontSize:'0.8rem',color:'#cbd5e1',marginTop:'0.2rem'}}>{a.description.slice(0,60)}…</div>
                <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:'0.25rem'}}>{a.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Recent Telemetry</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
          {telemetry.map(t=>(
            <div key={t.id} style={{padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:'0.8rem',fontWeight:600}}>{t.parameter}</div>
                <div style={{fontSize:'0.75rem',color:'#64748b'}}>{t.missionId}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'1rem',fontWeight:700,color:t.status==='warning'?'#f59e0b':t.status==='caution'?'#f97316':'#22c55e'}}>{t.value}<span style={{fontSize:'0.7rem',color:'#94a3b8',marginLeft:'2px'}}>{t.unit}</span></div>
                <div style={{fontSize:'0.7rem',color:t.status==='nominal'?'#22c55e':'#f59e0b'}}>{t.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
