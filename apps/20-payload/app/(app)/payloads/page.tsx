import { getSessionUser } from '@/lib/auth';
import { getPayloads } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function PayloadsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const payloads = getPayloads();
  const statusColor: Record<string,string> = { encapsulated:'#22c55e', ready:'#3b82f6', integration:'#a855f7', processing:'#f59e0b', testing:'#f97316' };
  const typeColor: Record<string,string> = { scientific:'#14b8a6', commercial:'#3b82f6', government:'#22c55e', defense:'#ef4444' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Payload Registry</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{payloads.length} payloads</p>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Name','Customer','Type','Mass (kg)','Orbit','Status','Integrated'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payloads.map((p,i)=>(
              <tr key={p.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600}}>{p.name}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#93c5fd'}}>{p.customer}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.1rem 0.4rem',borderRadius:'9999px',fontSize:'0.7rem',color:typeColor[p.type]??'#94a3b8',background:'#0f172a',textTransform:'capitalize'}}>{p.type}</span>
                </td>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:700,color:'#a855f7'}}>{p.massKg.toLocaleString()}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{p.targetOrbit}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.75rem',background:p.status==='encapsulated'?'#14532d':p.status==='ready'?'#1e3a5f':p.status==='processing'?'#713f12':'#1e293b',color:statusColor[p.status]??'#94a3b8'}}>{p.status}</span>
                </td>
                <td style={{padding:'0.5rem 0.75rem'}}>{p.integrationComplete?'✓':'–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
