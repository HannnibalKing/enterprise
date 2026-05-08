import { getSessionUser } from '@/lib/auth';
import { getComponents, getEngines } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function ComponentsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const components = getComponents();
  const engines = getEngines();
  const engMap = Object.fromEntries(engines.map(e=>[e.id,e.designation]));
  const statusColor: Record<string,string> = { 'flight-ready':'#22c55e', testing:'#3b82f6', 'in-development':'#f59e0b' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Component Inventory</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{components.length} component types tracked</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Flight Ready',value:components.filter(c=>c.status==='flight-ready').length,color:'#22c55e'},
          {label:'In Testing',value:components.filter(c=>c.status==='testing').length,color:'#3b82f6'},
          {label:'Total Units',value:components.reduce((s,c)=>s+c.quantity,0),color:'#f59e0b'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Engine','Component','Part Number','Material','Qty','Status','Supplier'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {components.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600,color:'#f59e0b',fontSize:'0.8rem'}}>{engMap[c.engineId]??c.engineId}</td>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600}}>{c.name}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.75rem',fontFamily:'monospace'}}>{c.partNumber}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontSize:'0.8rem'}}>{c.material}</td>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:700,color:'#f97316'}}>{c.quantity}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:c.status==='flight-ready'?'#14532d':c.status==='testing'?'#1e3a5f':'#713f12',color:statusColor[c.status]??'#94a3b8'}}>{c.status}</span>
                </td>
                <td style={{padding:'0.5rem 0.75rem',color:'#93c5fd',fontSize:'0.8rem'}}>{c.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
