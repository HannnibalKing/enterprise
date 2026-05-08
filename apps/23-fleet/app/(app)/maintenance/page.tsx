import { getSessionUser } from '@/lib/auth';
import { getMaintenance, getVehicles } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function MaintenancePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const maintenance = getMaintenance();
  const vehicles = getVehicles();
  const vMap = Object.fromEntries(vehicles.map(v=>[v.id,v.type]));
  const statusColor: Record<string,string> = { scheduled:'#3b82f6', 'in-progress':'#f59e0b', complete:'#22c55e', overdue:'#ef4444' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Maintenance Records</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{maintenance.length} records</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {(['scheduled','in-progress','complete','overdue'] as const).map(s=>(
          <div key={s} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center',borderLeft:`4px solid ${statusColor[s]}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:statusColor[s]}}>{maintenance.filter(m=>m.status===s).length}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',textTransform:'capitalize',marginTop:'0.25rem'}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Vehicle','Type','Task','Scheduled','Completed','Tech','Status'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {maintenance.map((m,i)=>(
              <tr key={m.id} style={{borderBottom:'1px solid #0f172a',background:m.status==='overdue'?'rgba(239,68,68,0.05)':i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:700,color:'#94a3b8',fontSize:'0.8rem'}}>{m.vehicleId}<div style={{color:'#64748b',fontSize:'0.7rem',fontWeight:400}}>{vMap[m.vehicleId]}</div></td>
                <td style={{padding:'0.5rem 0.75rem'}}><span style={{padding:'0.1rem 0.4rem',borderRadius:'9999px',fontSize:'0.7rem',background:'#1e293b',color:m.type==='Scheduled'?'#3b82f6':'#f59e0b'}}>{m.type}</span></td>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600,maxWidth:'200px'}}>{m.task}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{m.scheduledDate}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontSize:'0.8rem'}}>{m.completedDate??'–'}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#93c5fd',fontSize:'0.8rem'}}>{m.technician}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,background:m.status==='complete'?'#14532d':m.status==='overdue'?'#7f1d1d':m.status==='in-progress'?'#713f12':'#1e3a5f',color:statusColor[m.status]??'#94a3b8'}}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
