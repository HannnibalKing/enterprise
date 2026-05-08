import { getSessionUser } from '@/lib/auth';
import { getContacts, getStations, getAllAntennas } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function SchedulePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const contacts = getContacts();
  const stations = getStations();
  const allAntennas = getAllAntennas();
  const antennaMap = Object.fromEntries(allAntennas.map(a=>[a.id,a.designation]));
  const statusColor: Record<string,string> = { active:'#22c55e', scheduled:'#3b82f6', complete:'#94a3b8' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Contact Schedule</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Antenna utilization across all complexes</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
        {stations.map(st=>{
          const stAntennaIds = new Set(st.antennas.map(a=>a.id));
          const stContacts = contacts.filter(c=>stAntennaIds.has(c.antennaId));
          return (
            <div key={st.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                <div>
                  <h2 style={{fontSize:'1rem',fontWeight:700,margin:0,color:'#06b6d4'}}>{st.name}</h2>
                  <div style={{color:'#64748b',fontSize:'0.8rem'}}>{st.location}</div>
                </div>
                <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                  <span style={{fontSize:'0.8rem',color:'#94a3b8'}}>{stContacts.length} contacts</span>
                  <span style={{fontSize:'0.8rem',color:'#22c55e'}}>{stContacts.filter(c=>c.status==='active').length} active</span>
                </div>
              </div>
              {stContacts.length===0?(
                <p style={{color:'#64748b',fontSize:'0.85rem'}}>No contacts scheduled</p>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                  {stContacts.sort((a,b)=>a.startTime.localeCompare(b.startTime)).map(c=>(
                    <div key={c.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem',borderLeft:`3px solid ${statusColor[c.status]??'#334155'}`}}>
                      <div style={{minWidth:'80px',fontSize:'0.8rem',color:'#64748b',fontFamily:'monospace'}}>{c.startTime}</div>
                      <div style={{minWidth:'80px',fontSize:'0.8rem',color:'#64748b',fontFamily:'monospace'}}>{c.endTime}</div>
                      <div style={{flex:1,fontWeight:600}}>{c.spacecraft}</div>
                      <div style={{color:'#94a3b8',fontSize:'0.75rem'}}>{antennaMap[c.antennaId]??c.antennaId}</div>
                      <div style={{display:'flex',gap:'0.5rem'}}>
                        <span style={{fontSize:'0.7rem',color:'#f59e0b'}}>{c.uplinkKbps} kbps</span>
                        <span style={{fontSize:'0.7rem',color:'#22c55e'}}>{c.downlinkMbps} Mbps</span>
                      </div>
                      <span style={{padding:'0.1rem 0.4rem',borderRadius:'9999px',fontSize:'0.65rem',fontWeight:700,color:statusColor[c.status]??'#94a3b8',background:'#1e293b'}}>{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
