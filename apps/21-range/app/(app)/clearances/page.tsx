import { getSessionUser } from '@/lib/auth';
import { getClearances } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function ClearancesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const clearances = getClearances();
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Range Clearances</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{clearances.length} clearances</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Granted',value:clearances.filter(c=>c.status==='granted').length,color:'#22c55e'},
          {label:'Pending',value:clearances.filter(c=>c.status==='pending').length,color:'#f59e0b'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {clearances.map(c=>(
          <div key={c.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${c.status==='granted'?'#22c55e':'#f59e0b'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'1rem'}}>Zone {c.zoneId} Clearance</div>
                <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>Authority: {c.authority}</div>
              </div>
              <span style={{padding:'0.25rem 0.75rem',borderRadius:'9999px',fontWeight:700,fontSize:'0.8rem',background:c.status==='granted'?'#14532d':'#713f12',color:c.status==='granted'?'#86efac':'#fcd34d'}}>{c.status.toUpperCase()}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.75rem',marginBottom:'0.75rem'}}>
              {[{label:'Issued',value:c.issuedAt??'–'},{label:'Expires',value:c.expiresAt}].map(m=>(
                <div key={m.label} style={{background:'#0f172a',borderRadius:'0.4rem',padding:'0.6rem'}}>
                  <div style={{fontWeight:600,fontSize:'0.85rem'}}>{m.value}</div>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>{m.label}</div>
                </div>
              ))}
            </div>
            {c.conditions && (
              <div style={{background:'#0f172a',borderRadius:'0.4rem',padding:'0.6rem'}}>
                <div style={{color:'#64748b',fontSize:'0.7rem',marginBottom:'0.2rem'}}>Conditions</div>
                <div style={{color:'#cbd5e1',fontSize:'0.85rem'}}>{c.conditions}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
