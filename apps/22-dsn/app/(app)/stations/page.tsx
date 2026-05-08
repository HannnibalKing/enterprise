import { getSessionUser } from '@/lib/auth';
import { getStations } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function StationsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stations = getStations();
  const antStatusColor: Record<string,string> = { operational:'#22c55e', maintenance:'#f59e0b', offline:'#ef4444' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>DSN Complexes</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>3 deep space communications complexes</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
        {stations.map(s=>(
          <div key={s.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.5rem',borderTop:'3px solid #06b6d4'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'1.25rem',color:'#06b6d4'}}>{s.name}</div>
                <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.15rem'}}>{s.location}</div>
                <div style={{color:'#64748b',fontSize:'0.8rem'}}>Lat {s.lat}° · Lon {s.lon}°</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:700,fontSize:'1.5rem',color:'#06b6d4'}}>{s.antennas.length}</div>
                <div style={{color:'#64748b',fontSize:'0.8rem'}}>antennas</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:`repeat(${s.antennas.length},1fr)`,gap:'0.75rem'}}>
              {s.antennas.map(a=>(
                <div key={a.id} style={{background:'#0f172a',borderRadius:'0.5rem',padding:'0.75rem',borderLeft:`3px solid ${antStatusColor[a.status]??'#334155'}`}}>
                  <div style={{fontWeight:700,fontSize:'0.9rem'}}>{a.designation}</div>
                  <div style={{color:'#94a3b8',fontSize:'0.75rem',marginTop:'0.2rem'}}>{a.diameterM}m dish</div>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>Bands: {a.freqBands.join(', ')}</div>
                  <span style={{marginTop:'0.4rem',display:'inline-block',padding:'0.1rem 0.4rem',borderRadius:'9999px',fontSize:'0.65rem',color:antStatusColor[a.status]??'#94a3b8',background:'#1e293b'}}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
