import { getSessionUser } from '@/lib/auth';
import { getStations } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function StationsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stations = getStations();
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Ground Stations</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{stations.length} stations operational</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Total Stations',value:stations.length,color:'#3b82f6'},
          {label:'Total Antennas',value:stations.reduce((s,st)=>s+st.antennas,0),color:'#a855f7'},
          {label:'Operational',value:stations.filter(s=>s.status==='operational').length,color:'#22c55e'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center'}}>
            <div style={{fontSize:'2.5rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {stations.map(st=>(
          <div key={st.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'1.1rem'}}>{st.name}</div>
                <div style={{color:'#94a3b8',fontSize:'0.85rem'}}>{st.location}</div>
                <div style={{color:'#64748b',fontSize:'0.8rem'}}>Lat: {st.lat} · Lon: {st.lon}</div>
              </div>
              <span style={{padding:'0.25rem 0.75rem',borderRadius:'9999px',fontSize:'0.75rem',background:'#14532d',color:'#86efac'}}>{st.status}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem'}}>
              {[
                { label:'Antennas', value:st.antennas },
                { label:'Max Elevation', value:`${st.maxElevationDeg}°` },
                { label:'Latitude', value:st.lat },
                { label:'Longitude', value:st.lon },
              ].map(m=>(
                <div key={m.label} style={{background:'#0f172a',borderRadius:'0.5rem',padding:'0.75rem',textAlign:'center'}}>
                  <div style={{fontWeight:700,color:'#3b82f6'}}>{m.value}</div>
                  <div style={{color:'#64748b',fontSize:'0.75rem'}}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
