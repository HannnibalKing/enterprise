import { getSessionUser } from '@/lib/auth';
import { getStats, getSpacecraft, getContacts, getStations } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stats = getStats();
  const spacecraft = getSpacecraft();
  const contacts = getContacts();
  const stations = getStations();
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Orbital Tracking Dashboard</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Welcome, {user.name} ({user.role})</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[
          { label:'Total Spacecraft', value:stats.totalSpacecraft, color:'#3b82f6' },
          { label:'Operational', value:stats.operational, color:'#22c55e' },
          { label:'Active Contacts', value:stats.activeContacts, color:'#a855f7' },
          { label:'Anomalies', value:stats.anomaly, color:'#ef4444' },
        ].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:'1rem',marginBottom:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Spacecraft Catalog</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {spacecraft.slice(0,8).map(s=>(
              <div key={s.id} style={{display:'flex',gap:'1rem',alignItems:'center',padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:s.status==='operational'?'#22c55e':'#ef4444',flexShrink:0}}/>
                <div style={{flex:1}}>
                  <span style={{fontWeight:600,fontSize:'0.85rem'}}>{s.name}</span>
                  <span style={{color:'#64748b',fontSize:'0.75rem',marginLeft:'0.5rem'}}>{s.type}</span>
                </div>
                <div style={{fontSize:'0.8rem',color:'#3b82f6',textAlign:'right'}}>
                  <div>{s.altitudeKm.toLocaleString()} km</div>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>{s.inclinationDeg}° incl.</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Scheduled Contacts</h2>
          {contacts.map(c=>(
            <div key={c.id} style={{padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem',marginBottom:'0.5rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontWeight:600,fontSize:'0.8rem',color:'#a855f7'}}>{c.spacecraftId.toUpperCase()}</span>
                <span style={{fontSize:'0.7rem',color:c.status==='active'?'#22c55e':c.status==='scheduled'?'#3b82f6':'#64748b'}}>{c.status}</span>
              </div>
              <div style={{fontSize:'0.75rem',color:'#94a3b8',marginTop:'0.2rem'}}>{c.rosStart.split('T')[1]?.slice(0,5)} – {c.rosEnd.split('T')[1]?.slice(0,5)} UTC</div>
              <div style={{fontSize:'0.7rem',color:'#64748b'}}>Elev: {c.maxElevDeg}°</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Ground Stations</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.75rem'}}>
          {stations.map(st=>(
            <div key={st.id} style={{background:'#0f172a',borderRadius:'0.5rem',padding:'0.75rem',textAlign:'center'}}>
              <div style={{fontWeight:700,color:'#3b82f6',fontSize:'0.9rem'}}>{st.name}</div>
              <div style={{color:'#64748b',fontSize:'0.75rem',marginTop:'0.25rem'}}>{st.location}</div>
              <div style={{color:'#94a3b8',fontSize:'0.8rem',marginTop:'0.25rem'}}>{st.antennas} antennas</div>
              <span style={{marginTop:'0.5rem',display:'inline-block',padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:'#14532d',color:'#86efac'}}>{st.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
