import { getSessionUser } from '@/lib/auth';
import { getTelemetry, getMissions } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function TelemetryPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const telemetry = getTelemetry();
  const missions = getMissions();
  const missionMap = Object.fromEntries(missions.map(m=>[m.id,m.name]));
  const statusColor: Record<string,string> = { nominal:'#22c55e', warning:'#f59e0b', caution:'#f97316' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Telemetry Streams</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{telemetry.length} data points</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem',marginBottom:'1.5rem'}}>
        {[{label:'Nominal',count:telemetry.filter(t=>t.status==='nominal').length,color:'#22c55e'},
          {label:'Warning',count:telemetry.filter(t=>t.status==='warning').length,color:'#f59e0b'},
          {label:'Caution',count:telemetry.filter(t=>t.status==='caution').length,color:'#f97316'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.count}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem'}}>{s.label}</div>
            <div style={{marginTop:'0.5rem',height:'4px',borderRadius:'2px',background:'#0f172a'}}>
              <div style={{height:'100%',borderRadius:'2px',background:s.color,width:`${Math.round(s.count/telemetry.length*100)}%`}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>All Telemetry Parameters</h2>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Mission','Parameter','Value','Unit','Status','Timestamp'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {telemetry.map((t,i)=>(
              <tr key={t.id} style={{borderBottom:'1px solid #1e293b',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',color:'#93c5fd'}}>{missionMap[t.missionId]??t.missionId}</td>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600}}>{t.parameter}</td>
                <td style={{padding:'0.5rem 0.75rem',color:statusColor[t.status]??'#94a3b8',fontWeight:600}}>{t.value}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b'}}>{t.unit}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.75rem',background:t.status==='nominal'?'#14532d':t.status==='warning'?'#713f12':'#7c2d12',color:statusColor[t.status]}}>{t.status}</span>
                </td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.75rem'}}>{t.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
