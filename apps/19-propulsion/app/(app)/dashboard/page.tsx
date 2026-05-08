import { getSessionUser } from '@/lib/auth';
import { getStats, getEngines, getTestRuns } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const stats = getStats();
  const engines = getEngines();
  const tests = getTestRuns().slice(-5).reverse();
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>RAPTOR LAB — Propulsion Dashboard</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Welcome, {user.name} ({user.role})</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[
          { label:'Engine Types', value:stats.totalEngines, color:'#f59e0b' },
          { label:'Operational', value:stats.operational, color:'#22c55e' },
          { label:'Total Test Runs', value:stats.totalTests, color:'#f97316' },
          { label:'Failed Tests', value:stats.failedTests, color:'#ef4444' },
        ].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',borderLeft:`4px solid ${s.color}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Engine Performance Matrix</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {engines.map(e=>(
              <div key={e.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:'0.85rem'}}>{e.designation}</div>
                  <div style={{color:'#64748b',fontSize:'0.75rem'}}>{e.propellant}</div>
                </div>
                <div style={{textAlign:'right',minWidth:'100px'}}>
                  <div style={{color:'#f59e0b',fontWeight:600,fontSize:'0.85rem'}}>{e.thrustKN.toLocaleString()} kN</div>
                  <div style={{color:'#64748b',fontSize:'0.7rem'}}>Isp vac: {e.ispVac}s</div>
                </div>
                <div style={{width:'80px',height:'6px',borderRadius:'3px',background:'#1e293b'}}>
                  <div style={{height:'100%',borderRadius:'3px',background:'#f59e0b',width:`${Math.min(e.thrustKN/24000*100,100)}%`}}/>
                </div>
                <span style={{padding:'0.15rem 0.5rem',borderRadius:'9999px',fontSize:'0.7rem',background:e.status==='operational'?'#14532d':e.status==='testing'?'#1e3a5f':'#1e293b',color:e.status==='operational'?'#86efac':e.status==='testing'?'#93c5fd':'#94a3b8',minWidth:'70px',textAlign:'center'}}>{e.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Recent Test Runs</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {tests.map(t=>{
              const eng = engines.find(e=>e.id===t.engineId);
              return (
                <div key={t.id} style={{padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.25rem'}}>
                    <span style={{fontWeight:600,fontSize:'0.8rem'}}>{eng?.designation}</span>
                    <span style={{fontSize:'0.75rem',fontWeight:700,color:t.result==='pass'?'#22c55e':t.result==='fail'?'#ef4444':'#f59e0b'}}>{t.result.toUpperCase()}</span>
                  </div>
                  <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{t.type} · {t.duration}s · {t.date}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
