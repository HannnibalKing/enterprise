import { getSessionUser } from '@/lib/auth';
import { getLaunches } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function RangePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const launches = getLaunches();
  const upcoming = launches.filter(l=>l.status==='upcoming');
  const rangeAreas = ['SLC-40 Pad Exclusion (1.5km)','LC-39A Pad Exclusion (1.5km)','Flight Azimuth Corridor (15km wide)','USCG Maritime Exclusion Zone (120km)','FAA Air Traffic Restriction'];
  const rangeStatus = ['active','active','active','cleared','cleared'];
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Range Safety Status</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Eastern Range operations overview</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Active Zones',value:rangeStatus.filter(s=>s==='active').length,color:'#ef4444'},
          {label:'Cleared Zones',value:rangeStatus.filter(s=>s==='cleared').length,color:'#22c55e'},
          {label:'Upcoming Launches',value:upcoming.length,color:'#3b82f6'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center'}}>
            <div style={{fontSize:'2.5rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Range Exclusion Zones</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {rangeAreas.map((area,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <span style={{fontSize:'0.85rem'}}>{area}</span>
                <span style={{padding:'0.2rem 0.5rem',borderRadius:'9999px',fontSize:'0.75rem',background:rangeStatus[i]==='active'?'#7f1d1d':'#14532d',color:rangeStatus[i]==='active'?'#fca5a5':'#86efac'}}>{rangeStatus[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
          <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Upcoming Range Activities</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {upcoming.map(l=>(
              <div key={l.id} style={{padding:'0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <div style={{fontWeight:600,fontSize:'0.85rem',color:'#ef4444',marginBottom:'0.25rem'}}>{l.payload}</div>
                <div style={{display:'flex',gap:'1rem',fontSize:'0.8rem',color:'#94a3b8'}}>
                  <span>{l.site}</span>
                  <span>{l.scheduledDate.split('T')[0]}</span>
                </div>
                <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:'0.25rem'}}>{l.orbit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
