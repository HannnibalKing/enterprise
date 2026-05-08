import { getSessionUser } from '@/lib/auth';
import { getManifests, getPayloads } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function ManifestsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const manifests = getManifests();
  const payloads = getPayloads();
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Launch Manifests</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{manifests.length} manifests</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
        {manifests.map(m=>{
          const mPayloads = payloads.filter(p=>m.payloadIds.includes(p.id));
          return (
            <div key={m.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:'1.1rem',color:'#a855f7'}}>{m.vehicleId}</div>
                  <div style={{color:'#94a3b8',fontSize:'0.85rem'}}>Launch: {m.launchDate} · {m.orbit}</div>
                  <div style={{color:'#64748b',fontSize:'0.8rem',marginTop:'0.15rem'}}>Customer: {m.customer}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'1.25rem',fontWeight:700,color:'#a855f7'}}>{m.totalMassKg.toLocaleString()} kg</div>
                  <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',background:m.status==='confirmed'?'#14532d':'#1e3a5f',color:m.status==='confirmed'?'#86efac':'#93c5fd'}}>{m.status}</span>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {mPayloads.map(p=>(
                  <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                    <div>
                      <span style={{fontWeight:600}}>{p.name}</span>
                      <span style={{color:'#64748b',fontSize:'0.8rem',marginLeft:'0.5rem'}}>{p.customer}</span>
                    </div>
                    <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                      <span style={{color:'#f97316',fontWeight:600}}>{p.massKg.toLocaleString()} kg</span>
                      <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:'#14532d',color:'#86efac'}}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
