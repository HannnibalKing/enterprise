import { getSessionUser } from '@/lib/auth';
import { getStats, getStreams, getAlerts } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stats = getStats();
  const streams = getStreams();
  const alerts = getAlerts();
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>NEXUS TLM — Telemetry Dashboard</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Welcome, {user.name} ({user.role})</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[
          { label:'Active Streams', value:stats.activeStreams, color:'#22c55e' },
          { label:'Signal Loss', value:stats.lossStreams, color:'#ef4444' },
          { label:'Warning Channels', value:stats.warningChannels, color:'#f59e0b' },
          { label:'Unacked Alerts', value:stats.unackedAlerts, color:'#ef4444' },
        ].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:'1rem',marginBottom:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Downlink Streams</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
            {streams.slice(0,10).map(s=>(
              <div key={s.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,background:s.status==='active'?'#22c55e':s.status==='loss'?'#ef4444':'#94a3b8'}}/>
                <div style={{flex:1}}>
                  <span style={{fontWeight:600,fontSize:'0.85rem'}}>{s.spacecraft}</span>
                  <span style={{color:'#64748b',fontSize:'0.75rem',marginLeft:'0.5rem'}}>· {s.station}</span>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:'#22c55e',fontWeight:600,fontSize:'0.85rem'}}>{s.dataRateMbps} Mbps</div>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>{s.protocol}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Active Alerts</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {alerts.map(a=>(
              <div key={a.id} style={{padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem',borderLeft:`3px solid ${a.severity==='critical'?'#ef4444':a.severity==='warning'?'#f59e0b':'#3b82f6'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.25rem'}}>
                  <span style={{fontSize:'0.75rem',fontWeight:700,color:a.severity==='critical'?'#ef4444':a.severity==='warning'?'#f59e0b':'#3b82f6'}}>{a.severity.toUpperCase()}</span>
                  <span style={{fontSize:'0.7rem',color:a.acknowledged?'#22c55e':'#ef4444'}}>{a.acknowledged?'ACK':'UNACK'}</span>
                </div>
                <div style={{fontSize:'0.8rem',color:'#cbd5e1'}}>{a.message}</div>
                <div style={{fontSize:'0.7rem',color:'#64748b',marginTop:'0.25rem'}}>{a.timestamp.replace('T',' ').slice(0,16)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
