import { getSessionUser } from '@/lib/auth';
import { getContacts, getSpacecraft, getStations } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function ContactsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const contacts = getContacts();
  const spacecraft = getSpacecraft();
  const stations = getStations();
  const scMap = Object.fromEntries(spacecraft.map(s=>[s.id,s.name]));
  const stMap = Object.fromEntries(stations.map(s=>[s.id,s.name]));
  const statusColor: Record<string,string> = { active:'#22c55e', scheduled:'#3b82f6', complete:'#64748b' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Contact Schedule</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{contacts.length} contacts logged</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {(['active','scheduled','complete'] as const).map(s=>(
          <div key={s} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center',borderTop:`3px solid ${statusColor[s]}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:statusColor[s]}}>{contacts.filter(c=>c.status===s).length}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',textTransform:'capitalize'}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Spacecraft','Station','ROS Start','ROS End','Max Elev.','Status'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600,color:'#a855f7'}}>{scMap[c.spacecraftId]??c.spacecraftId}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8'}}>{stMap[c.stationId]??c.stationId}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{c.rosStart.replace('T',' ').slice(0,16)}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{c.rosEnd.replace('T',' ').slice(0,16)}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#3b82f6',fontWeight:600}}>{c.maxElevDeg}°</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:c.status==='active'?'#14532d':c.status==='scheduled'?'#1e3a5f':'#1e293b',color:statusColor[c.status]??'#94a3b8'}}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
