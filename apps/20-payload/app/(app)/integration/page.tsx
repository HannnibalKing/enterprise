import { getSessionUser } from '@/lib/auth';
import { getMilestones, getPayloads } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function IntegrationPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const milestones = getMilestones();
  const payloads = getPayloads();
  const pMap = Object.fromEntries(payloads.map(p=>[p.id,p.name]));
  const statusColor: Record<string,string> = { complete:'#22c55e', 'in-progress':'#3b82f6', pending:'#94a3b8', delayed:'#ef4444' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Integration Milestones</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{milestones.length} milestones tracked</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {(['complete','in-progress','pending','delayed'] as const).map(s=>(
          <div key={s} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center',borderLeft:`4px solid ${statusColor[s]}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:statusColor[s]}}>{milestones.filter(m=>m.status===s).length}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',textTransform:'capitalize',marginTop:'0.25rem'}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Payload','Milestone','Planned','Completed','Status'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {milestones.map((m,i)=>(
              <tr key={m.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600,color:'#a855f7'}}>{pMap[m.payloadId]??m.payloadId}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>{m.milestone}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{m.plannedDate}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontSize:'0.8rem'}}>{m.completedDate??'–'}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.75rem',background:m.status==='complete'?'#14532d':m.status==='in-progress'?'#1e3a5f':m.status==='delayed'?'#7f1d1d':'#1e293b',color:statusColor[m.status]??'#94a3b8'}}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
