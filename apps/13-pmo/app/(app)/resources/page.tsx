import { getResources } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const SKILL: Record<string,{bg:string;color:string}> = {
  principal: {bg:'var(--cyan-dim)',   color:'var(--accent)'},
  senior:    {bg:'var(--green-dim)',  color:'var(--green)'},
  mid:       {bg:'var(--blue-dim)',   color:'var(--blue)'},
  junior:    {bg:'rgba(255,255,255,0.04)',color:'var(--text-muted)'},
};
export default async function ResourcesPage() {
  const resources = getResources();
  const avgUtil = Math.round(resources.reduce((s,r)=>s+r.utilization,0)/resources.length);
  const overloaded = resources.filter(r=>r.utilization>90).length;
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Resource <span style={{color:'var(--accent)'}}>Allocation</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{resources.length} resources · {avgUtil}% avg utilization · <span style={{color:'var(--red)'}}>{overloaded} overloaded</span></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
        {resources.map(res=>{
          const ss=SKILL[res.skillLevel];
          const utilColor = res.utilization>90?'var(--red)':res.utilization>75?'var(--yellow)':'var(--green)';
          return (
            <div key={res.id} className="card" style={{marginBottom:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:'var(--text)',marginBottom:3}}>{res.name}</div>
                  <div style={{fontSize:11,color:'var(--text-soft)'}}>{res.role} · {res.department}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                  <span className="badge" style={{background:ss.bg,color:ss.color}}>{res.skillLevel}</span>
                  <div style={{fontSize:10,color:'var(--text-muted)'}}>${res.billableRate}/hr</div>
                </div>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <div style={{fontSize:10,color:'var(--text-muted)'}}>Utilization</div>
                  <div style={{fontSize:12,fontWeight:800,color:utilColor}}>{res.utilization}%</div>
                </div>
                <div style={{width:'100%',height:6,background:'var(--surface2)',borderRadius:3}}>
                  <div style={{width:`${Math.min(res.utilization,100)}%`,height:'100%',borderRadius:3,background:utilColor}}/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                {[
                  {l:'Capacity',  v:`${res.capacity}h/wk`,  c:'var(--text)'},
                  {l:'Allocated', v:`${res.allocatedHours}h`,c:utilColor},
                  {l:'Projects',  v:res.projectsActive,      c:'var(--accent)'},
                ].map(k=>(
                  <div key={k.l} style={{padding:'6px 8px',background:'var(--surface2)',borderRadius:6}}>
                    <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',color:'var(--text-muted)',marginBottom:2}}>{k.l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
