import { getSessionUser } from '@/lib/auth';
import { getEngines, getTestRuns } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function PerformancePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const engines = getEngines();
  const tests = getTestRuns();
  const operational = engines.filter(e=>e.status==='operational');
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Performance Analysis</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Specific impulse & thrust comparison</p>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',marginBottom:'1rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Isp Vacuum Comparison</h2>
        <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          {[...engines].sort((a,b)=>b.ispVac-a.ispVac).map(e=>(
            <div key={e.id} style={{display:'flex',alignItems:'center',gap:'1rem'}}>
              <div style={{minWidth:'140px',fontSize:'0.85rem',fontWeight:600}}>{e.designation}</div>
              <div style={{flex:1,height:'20px',borderRadius:'4px',background:'#0f172a',overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:'4px',background:e.status==='operational'?'#f59e0b':e.status==='testing'?'#3b82f6':'#334155',width:`${(e.ispVac/500*100).toFixed(1)}%`,display:'flex',alignItems:'center',paddingLeft:'6px',fontSize:'0.7rem',color:'#0f172a',fontWeight:700}}>{e.ispVac>100?e.ispVac:''}</div>
              </div>
              <div style={{minWidth:'60px',textAlign:'right',color:'#f59e0b',fontWeight:700,fontSize:'0.85rem'}}>{e.ispVac} s</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',marginBottom:'1rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Thrust-to-Weight Proxy (Thrust kN)</h2>
        <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          {[...engines].filter(e=>e.thrustKN>100).sort((a,b)=>b.thrustKN-a.thrustKN).map(e=>(
            <div key={e.id} style={{display:'flex',alignItems:'center',gap:'1rem'}}>
              <div style={{minWidth:'140px',fontSize:'0.85rem',fontWeight:600}}>{e.designation}</div>
              <div style={{flex:1,height:'20px',borderRadius:'4px',background:'#0f172a',overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:'4px',background:'#ef4444',width:`${(e.thrustKN/24000*100).toFixed(1)}%`}}/>
              </div>
              <div style={{minWidth:'80px',textAlign:'right',color:'#ef4444',fontWeight:700,fontSize:'0.85rem'}}>{e.thrustKN.toLocaleString()} kN</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Test Pass Rate by Engine</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.75rem'}}>
          {operational.map(e=>{
            const engineTests = tests.filter(t=>t.engineId===e.id);
            const passed = engineTests.filter(t=>t.result==='pass').length;
            const pct = engineTests.length>0?Math.round(passed/engineTests.length*100):0;
            return (
              <div key={e.id} style={{background:'#0f172a',borderRadius:'0.5rem',padding:'0.75rem',textAlign:'center'}}>
                <div style={{fontSize:'1.5rem',fontWeight:700,color:pct>=90?'#22c55e':pct>=70?'#f59e0b':'#ef4444'}}>{pct}%</div>
                <div style={{fontSize:'0.75rem',color:'#94a3b8',marginTop:'0.25rem'}}>{e.designation}</div>
                <div style={{fontSize:'0.7rem',color:'#64748b'}}>{passed}/{engineTests.length} pass</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
