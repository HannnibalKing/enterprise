import { getSessionUser } from '@/lib/auth';
import { getChannels } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function ChannelsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const channels = getChannels();
  const statusColor: Record<string,string> = { nominal:'#22c55e', caution:'#f97316', warning:'#f59e0b', critical:'#ef4444' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Channel Parameters</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{channels.length} parameters monitored</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {(['nominal','caution','warning','critical'] as const).map(s=>(
          <div key={s} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center',borderLeft:`4px solid ${statusColor[s]}`}}>
            <div style={{fontSize:'2rem',fontWeight:700,color:statusColor[s]}}>{channels.filter(c=>c.status===s).length}</div>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',textTransform:'capitalize'}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem'}}>
        {channels.map(ch=>{
          const pct = Math.min(Math.max((ch.value-ch.minLimit)/(ch.maxLimit-ch.minLimit),0),1)*100;
          return (
            <div key={ch.id} style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1rem',borderLeft:`3px solid ${statusColor[ch.status]}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                <span style={{fontWeight:600,fontSize:'0.8rem'}}>{ch.name}</span>
                <span style={{fontSize:'0.65rem',color:statusColor[ch.status]}}>{ch.status}</span>
              </div>
              <div style={{fontSize:'1.25rem',fontWeight:700,color:statusColor[ch.status]}}>{ch.value}<span style={{fontSize:'0.7rem',color:'#64748b',marginLeft:'2px'}}>{ch.unit}</span></div>
              <div style={{marginTop:'0.5rem',height:'4px',borderRadius:'2px',background:'#0f172a'}}>
                <div style={{height:'100%',borderRadius:'2px',background:statusColor[ch.status],width:`${pct}%`}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'#64748b',marginTop:'0.25rem'}}>
                <span>{ch.minLimit}</span><span>{ch.maxLimit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
