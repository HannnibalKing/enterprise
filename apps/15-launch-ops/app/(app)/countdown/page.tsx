import { getSessionUser } from '@/lib/auth';
import { getCountdowns, getLaunches } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function CountdownPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const countdowns = getCountdowns();
  const launches = getLaunches();
  const launchMap = Object.fromEntries(launches.map(l=>[l.id,l]));
  const events = [
    'T-48h: Pre-launch readiness review','T-24h: LOX pre-load & propellant checks',
    'T-12h: Terminal countdown begins','T-3h: Propellant load complete',
    'T-1h: Launch director poll','T-20m: Range green light',
    'T-10m: Final systems go','T-2m: Engine chill-down',
    'T-0: Ignition & lift-off',
  ];
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Countdown Sequences</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{countdowns.length} active sequences</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
        {countdowns.map(cd=>{
          const launch = launchMap[cd.launchId];
          return (
            <div key={cd.launchId} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:'1.1rem'}}>{launch?.payload ?? cd.launchId}</div>
                  <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>{launch?.vehicle} · {launch?.site}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'0.85rem',color:'#ef4444'}}>{cd.t0.split('T')[0]}</div>
                  <div style={{fontSize:'0.75rem',color:'#f59e0b'}}>{cd.holds} hold(s)</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1rem'}}>
                <div style={{background:'#0f172a',borderRadius:'0.5rem',padding:'0.75rem'}}>
                  <div style={{fontSize:'0.75rem',color:'#64748b',marginBottom:'0.25rem'}}>Current Event</div>
                  <div style={{fontWeight:600,color:'#22c55e',fontSize:'0.85rem'}}>{cd.currentEvent}</div>
                </div>
                <div style={{background:'#0f172a',borderRadius:'0.5rem',padding:'0.75rem'}}>
                  <div style={{fontSize:'0.75rem',color:'#64748b',marginBottom:'0.25rem'}}>Next Milestone</div>
                  <div style={{fontWeight:600,color:'#f97316',fontSize:'0.85rem'}}>{cd.nextMilestone}</div>
                </div>
              </div>
              <div style={{fontSize:'0.8rem',color:'#64748b',marginBottom:'0.5rem'}}>Countdown Timeline</div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.35rem'}}>
                {events.map((e,i)=>{
                  const isActive = e.includes(cd.currentEvent.split(' ').slice(0,2).join(' '));
                  const isPast = i < 3;
                  return (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.4rem 0.75rem',borderRadius:'0.4rem',background:isActive?'#1e3a5f':isPast?'#0f2d1a':'#0f172a'}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,background:isActive?'#3b82f6':isPast?'#22c55e':'#334155'}}/>
                      <span style={{fontSize:'0.8rem',color:isActive?'#93c5fd':isPast?'#86efac':'#64748b'}}>{e}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
