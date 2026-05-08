import { getSessionUser } from '@/lib/auth';
import { getHazards } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function HazardsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const hazards = getHazards();
  const statusColor: Record<string,string> = { active:'#ef4444', cleared:'#22c55e', pending:'#f59e0b' };
  const typeColor: Record<string,string> = { 'explosive':'#ef4444', 'toxic':'#a855f7', 'radiation':'#f59e0b', 'aviation':'#3b82f6', 'marine':'#14b8a6' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Hazard Zones</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{hazards.length} zones tracked</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Active',value:hazards.filter(h=>h.status==='active').length,color:'#ef4444'},
          {label:'Pending',value:hazards.filter(h=>h.status==='pending').length,color:'#f59e0b'},
          {label:'Cleared',value:hazards.filter(h=>h.status==='cleared').length,color:'#22c55e'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2.5rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.9rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {hazards.map(h=>(
          <div key={h.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${statusColor[h.status]??'#94a3b8'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'1rem'}}>{h.name}</div>
                <div style={{color:'#94a3b8',fontSize:'0.8rem',marginTop:'0.15rem'}}>Radius: {h.radiusKm} km · {h.type}</div>
              </div>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',color:typeColor[h.type]??'#94a3b8',background:'#0f172a'}}>{h.type}</span>
                <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,background:h.status==='active'?'#7f1d1d':h.status==='cleared'?'#14532d':'#713f12',color:statusColor[h.status]??'#94a3b8'}}>{h.status.toUpperCase()}</span>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem'}}>
              {[{label:'Radius',value:`${h.radiusKm} km`},{label:'Activated',value:h.activatedAt??'–'},{label:'Clearance Req',value:h.clearanceRequired},{label:'Status',value:h.status}].map(m=>(
                <div key={m.label} style={{background:'#0f172a',borderRadius:'0.4rem',padding:'0.6rem'}}>
                  <div style={{fontWeight:700,fontSize:'0.85rem',color:'#e2e8f0'}}>{m.value}</div>
                  <div style={{color:'#64748b',fontSize:'0.7rem',marginTop:'2px'}}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
