import { getSessionUser } from '@/lib/auth';
import { getTraining, getAstronauts } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function TrainingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const training = getTraining();
  const astronauts = getAstronauts();
  const aMap = Object.fromEntries(astronauts.map(a=>[a.id,a.name]));
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Training Records</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{training.length} training entries</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Sessions Logged',value:training.length,color:'#14b8a6'},
          {label:'Average Score',value:`${Math.round(training.reduce((s,t)=>s+t.score,0)/training.length)}%`,color:'#22c55e'},
          {label:'Modules',value:[...new Set(training.map(t=>t.module))].length,color:'#3b82f6'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Astronaut','Module','Score','Completed','Cert. Expiry','Instructor'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {training.map((t,i)=>(
              <tr key={t.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600,color:'#14b8a6'}}>{aMap[t.astronautId]??t.astronautId}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>{t.module}</td>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:700,color:t.score>=90?'#22c55e':t.score>=80?'#f59e0b':'#ef4444'}}>{t.score}%</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b',fontSize:'0.8rem'}}>{t.completedDate}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontSize:'0.8rem'}}>{t.certificationExpiry}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#93c5fd'}}>{t.instructor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
