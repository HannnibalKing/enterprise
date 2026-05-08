import { getSessionUser } from '@/lib/auth';
import { getTestRuns, getEngines } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function TestsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const tests = getTestRuns();
  const engines = getEngines();
  const engMap = Object.fromEntries(engines.map(e=>[e.id,e.designation]));
  const resultColor: Record<string,string> = { pass:'#22c55e', partial:'#f59e0b', fail:'#ef4444' };
  const typeColor: Record<string,string> = { 'hot-fire':'#f97316', 'cold-flow':'#3b82f6', 'ignition-test':'#a855f7' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Test Run Log</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{tests.length} test runs recorded</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Pass',value:tests.filter(t=>t.result==='pass').length,color:'#22c55e'},
          {label:'Partial',value:tests.filter(t=>t.result==='partial').length,color:'#f59e0b'},
          {label:'Fail',value:tests.filter(t=>t.result==='fail').length,color:'#ef4444'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Engine','Date','Type','Duration (s)','Thrust (kN)','Result','Engineer','Notes'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tests.map((t,i)=>(
              <tr key={t.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600,color:'#f59e0b'}}>{engMap[t.engineId]??t.engineId}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{t.date}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.1rem 0.4rem',borderRadius:'9999px',fontSize:'0.7rem',color:typeColor[t.type]??'#94a3b8',background:'#0f172a'}}>{t.type}</span>
                </td>
                <td style={{padding:'0.5rem 0.75rem'}}>{t.duration}</td>
                <td style={{padding:'0.5rem 0.75rem',color:t.thrustAchievedKN>0?'#f97316':'#64748b',fontWeight:600}}>{t.thrustAchievedKN>0?t.thrustAchievedKN.toLocaleString():'–'}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,color:resultColor[t.result]}}>{t.result.toUpperCase()}</span>
                </td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8'}}>{t.engineer}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.75rem',maxWidth:'200px'}}>{t.notes.slice(0,50)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
