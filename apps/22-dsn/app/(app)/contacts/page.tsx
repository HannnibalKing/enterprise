import { getSessionUser } from '@/lib/auth';
import { getContacts, getStations, getAllAntennas } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function ContactsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const contacts = getContacts();
  const stations = getStations();
  const allAntennas = getAllAntennas();
  const antennaToStation = Object.fromEntries(allAntennas.map(a=>[a.id,stations.find(s=>s.antennas.some(x=>x.id===a.id))?.name??'']));
  const antennaMap = Object.fromEntries(allAntennas.map(a=>[a.id,a.designation]));
  const statusColor: Record<string,string> = { active:'#22c55e', scheduled:'#3b82f6', complete:'#94a3b8' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Spacecraft Contacts</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{contacts.length} contacts</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Active',value:contacts.filter(c=>c.status==='active').length,color:'#22c55e'},
          {label:'Scheduled',value:contacts.filter(c=>c.status==='scheduled').length,color:'#3b82f6'},
          {label:'Complete',value:contacts.filter(c=>c.status==='complete').length,color:'#94a3b8'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Spacecraft','Complex','Antenna','Start','End','Uplink','Downlink','Status'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:'1px solid #0f172a',background:c.status==='active'?'rgba(6,182,212,0.05)':i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:700,color:'#06b6d4'}}>{c.spacecraft}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontSize:'0.8rem'}}>{antennaToStation[c.antennaId]??'–'}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontFamily:'monospace'}}>{antennaMap[c.antennaId]??c.antennaId}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{c.startTime}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{c.endTime}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#f59e0b',fontWeight:600}}>{c.uplinkKbps} kbps</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#22c55e',fontWeight:600}}>{c.downlinkMbps} Mbps</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,color:statusColor[c.status]??'#94a3b8',background:'#0f172a'}}>{c.status.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
