import { getSessionUser } from '@/lib/auth';
import { getSpacecraft } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function OrbitsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const spacecraft = getSpacecraft();
  const bands = [
    { name:'LEO (200–2000 km)', min:200, max:2000, color:'#22c55e' },
    { name:'MEO (2000–35786 km)', min:2000, max:35786, color:'#3b82f6' },
    { name:'GEO (35786 km)', min:35780, max:35800, color:'#f97316' },
    { name:'HEO / Beyond', min:35800, max:Infinity, color:'#a855f7' },
  ];
  const inBand = (alt: number, b: {min:number,max:number}) => alt >= b.min && alt < b.max;
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Orbital Parameters</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Altitude & inclination overview</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {bands.map(b=>(
          <div key={b.name} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${b.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:b.color}}>{spacecraft.filter(s=>inBand(s.altitudeKm,b)).length}</div>
            <div style={{color:'#94a3b8',fontSize:'0.8rem',marginTop:'0.25rem'}}>{b.name}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Orbital Elements</h2>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Spacecraft','Type','Altitude (km)','Inclination (°)','Period (min)','Status'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...spacecraft].sort((a,b)=>a.altitudeKm-b.altitudeKm).map((s,i)=>(
              <tr key={s.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600}}>{s.name}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontSize:'0.8rem'}}>{s.type}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#3b82f6',fontWeight:600}}>{s.altitudeKm.toLocaleString()}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>{s.inclinationDeg}°</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b'}}>{s.periodMin>0?Math.round(s.periodMin):'–'}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:s.status==='operational'?'#14532d':'#7f1d1d',color:s.status==='operational'?'#86efac':'#fca5a5'}}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
