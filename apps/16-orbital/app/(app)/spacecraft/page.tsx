import { getSessionUser } from '@/lib/auth';
import { getSpacecraft } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function SpacecraftPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const spacecraft = getSpacecraft();
  const typeColor: Record<string,string> = { 'Space Station':'#f97316','Observatory':'#a855f7','Navigation':'#22c55e','Comms':'#3b82f6','Weather':'#06b6d4','Earth Obs':'#14b8a6','Probe':'#f59e0b','Technology':'#64748b' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Spacecraft Catalog</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{spacecraft.length} spacecraft tracked</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem'}}>
        {spacecraft.map(s=>(
          <div key={s.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${typeColor[s.type]??'#94a3b8'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'1rem'}}>{s.name}</div>
                <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{s.nation} · {s.type}</div>
              </div>
              <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',background:s.status==='operational'?'#14532d':'#7f1d1d',color:s.status==='operational'?'#86efac':'#fca5a5'}}>{s.status}</span>
            </div>
            <div style={{fontSize:'0.8rem',color:'#cbd5e1',marginBottom:'0.75rem'}}>{s.mission}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
              {[
                { label:'Altitude', value:`${s.altitudeKm.toLocaleString()} km` },
                { label:'Inclination', value:`${s.inclinationDeg}°` },
                { label:'Period', value:s.periodMin>0?`${Math.round(s.periodMin)} min`:'–' },
              ].map(m=>(
                <div key={m.label} style={{background:'#0f172a',borderRadius:'0.4rem',padding:'0.5rem',textAlign:'center'}}>
                  <div style={{fontWeight:700,fontSize:'0.85rem',color:'#3b82f6'}}>{m.value}</div>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
