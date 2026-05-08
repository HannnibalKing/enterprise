import { getSessionUser } from '@/lib/auth';
import { getPayloads } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function ProcessingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const payloads = getPayloads();
  const active = payloads.filter(p=>['processing','integration','testing'].includes(p.status));
  const steps = ['Arrival & Receiving','Pre-processing Inspection','Propellant Loading','Electrical Checkouts','Mechanical Integration','Encapsulation','Transport to Pad'];
  const statusIdx: Record<string,number> = { processing:2, integration:4, testing:3, encapsulated:6, ready:6 };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Processing Status</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{active.length} payloads in processing</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
        {active.map(p=>{
          const step = statusIdx[p.status]??0;
          return (
            <div key={p.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:'1rem'}}>{p.name}</div>
                  <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{p.customer} · {p.massKg.toLocaleString()} kg · {p.targetOrbit}</div>
                </div>
                <span style={{padding:'0.25rem 0.75rem',borderRadius:'9999px',fontSize:'0.75rem',background:'#1e3a5f',color:'#93c5fd',textTransform:'capitalize'}}>{p.status}</span>
              </div>
              <div style={{display:'flex',gap:'0',marginBottom:'0.5rem'}}>
                {steps.map((s,i)=>(
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                    <div style={{width:'20px',height:'20px',borderRadius:'50%',background:i<step?'#22c55e':i===step?'#a855f7':'#334155',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem',color:'white',fontWeight:700}}>{i<step?'✓':i+1}</div>
                    {i<steps.length-1&&<div style={{position:'relative',width:'100%',height:'2px',background:i<step?'#22c55e':'#334155',marginTop:'-12px',zIndex:0}}/>}
                  </div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'#64748b',marginTop:'4px'}}>
                {steps.map((s,i)=><span key={i} style={{flex:1,textAlign:'center',color:i===step?'#a855f7':i<step?'#22c55e':'#64748b'}}>{s.split(' ')[0]}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
