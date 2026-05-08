import { getSessionUser } from '@/lib/auth';
import { getStreams } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function StreamsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const streams = getStreams();
  const statusColor: Record<string,string> = { active:'#22c55e', idle:'#94a3b8', loss:'#ef4444' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Telemetry Streams</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{streams.length} streams tracked</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem',marginBottom:'1.5rem'}}>
        {(['active','idle','loss'] as const).map(s=>(
          <div key={s} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center',borderTop:`3px solid ${statusColor[s]}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:statusColor[s]}}>{streams.filter(st=>st.status===s).length}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',textTransform:'capitalize'}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Spacecraft','Station','Data Rate','Protocol','Start Time','Status'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {streams.map((s,i)=>(
              <tr key={s.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600}}>{s.spacecraft}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontSize:'0.8rem'}}>{s.station}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#22c55e',fontWeight:600}}>{s.dataRateMbps} Mbps</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{s.protocol}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.75rem'}}>{s.startTime.replace('T',' ').slice(0,16)}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:s.status==='active'?'#14532d':s.status==='loss'?'#7f1d1d':'#1e293b',color:statusColor[s.status]}}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
