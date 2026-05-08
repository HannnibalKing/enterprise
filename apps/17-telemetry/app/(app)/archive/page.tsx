import { getSessionUser } from '@/lib/auth';
import { getStreams } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function ArchivePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const streams = getStreams();
  const hours = Array.from({length:24},(_,i)=>i);
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>24-Hour Data Archive</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>Historical telemetry record</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {[{label:'Streams Archived',value:streams.length,color:'#22c55e'},
          {label:'Data Volume',value:'4.7 TB',color:'#3b82f6'},
          {label:'Retention Days',value:90,color:'#f59e0b'},
          {label:'Compression',value:'62%',color:'#a855f7'}].map(s=>(
          <div key={s.label} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',marginBottom:'1rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>24-Hour Downlink Activity</h2>
        <div style={{display:'flex',gap:'4px',alignItems:'flex-end',height:'80px'}}>
          {hours.map(h=>{
            const height = Math.round(Math.sin(h/3+1)*40+Math.random()*20+20);
            return (
              <div key={h} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                <div style={{width:'100%',background:'#22c55e',borderRadius:'2px 2px 0 0',height:`${height}px`,opacity:0.8}}/>
              </div>
            );
          })}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:'4px',fontSize:'0.65rem',color:'#64748b'}}>
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
        </div>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Archive by Spacecraft</h2>
        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          {streams.map(s=>{
            const mb = Math.round(s.dataRateMbps*3600*24/8*1000)/1000;
            return (
              <div key={s.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.6rem 0.75rem',background:'#0f172a',borderRadius:'0.5rem'}}>
                <div style={{flex:1,fontWeight:600,fontSize:'0.85rem'}}>{s.spacecraft}</div>
                <div style={{width:'200px',height:'6px',borderRadius:'3px',background:'#1e293b'}}>
                  <div style={{height:'100%',borderRadius:'3px',background:'#22c55e',width:`${Math.min(s.dataRateMbps/300*100,100)}%`}}/>
                </div>
                <div style={{width:'80px',textAlign:'right',color:'#22c55e',fontWeight:600,fontSize:'0.8rem'}}>{mb > 1000 ? `${(mb/1000).toFixed(1)} GB` : `${mb.toFixed(0)} MB`}/day</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
