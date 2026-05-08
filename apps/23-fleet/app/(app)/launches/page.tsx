import { getSessionUser } from '@/lib/auth';
import { getLaunches } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function LaunchesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const launches = getLaunches();
  const successRate = Math.round(launches.filter(l=>l.outcome==='success').length/launches.length*100);
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Launch History</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{launches.length} launches · {successRate}% success rate</p>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Vehicle','Date','Payload','Orbit','Site','Customer','Outcome','Landing'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...launches].sort((a,b)=>b.date.localeCompare(a.date)).map((l,i)=>(
              <tr key={l.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:700,color:'#94a3b8'}}>{l.vehicleId}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{l.date}</td>
                <td style={{padding:'0.5rem 0.75rem',fontSize:'0.8rem'}}>{l.payload}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.75rem'}}>{l.orbit}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontSize:'0.75rem'}}>{l.site}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#93c5fd',fontSize:'0.8rem'}}>{l.customer}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,background:l.outcome==='success'?'#14532d':'#713f12',color:l.outcome==='success'?'#86efac':'#fcd34d'}}>{l.outcome}</span>
                </td>
                <td style={{padding:'0.5rem 0.75rem',color:l.landingOutcome==='success'?'#22c55e':l.landingOutcome==='failure'?'#ef4444':'#64748b',fontSize:'0.8rem'}}>{l.landingOutcome??'–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
