import { getSessionUser } from '@/lib/auth';
import { getLaunches } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function LaunchesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const launches = getLaunches();
  const statusColor: Record<string,string> = { success:'#22c55e', upcoming:'#3b82f6', hold:'#f59e0b', scrub:'#ef4444' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Launch Manifest</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{launches.length} missions catalogued</p>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Vehicle','Payload','Site','Orbit','Mass (kg)','Date','Customer','Status'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {launches.map((l,i)=>(
              <tr key={l.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600,fontSize:'0.8rem'}}>{l.vehicle}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#f97316'}}>{l.payload}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontSize:'0.8rem'}}>{l.site}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontSize:'0.75rem'}}>{l.orbit}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#cbd5e1'}}>{l.massKg.toLocaleString()}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{l.scheduledDate.split('T')[0]}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#93c5fd',fontSize:'0.8rem'}}>{l.customer}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.75rem',background:l.status==='success'?'#14532d':l.status==='upcoming'?'#1e3a5f':l.status==='hold'?'#713f12':'#1e293b',color:statusColor[l.status]??'#94a3b8'}}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
